import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { User, Income, Expense, Animal } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar as CalendarIcon, Users, AlertTriangle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalAnimals: number;
  monthlySales: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  monthlySalesCount: number;
  highestSale: {
    amount: number;
    description: string;
  };
  monthlyTrends: {
    sales: { month: string; amount: number }[];
    expenses: { month: string; amount: number }[];
  };
  animalTypes: { type: string; count: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Lazy load heavy components
const DashboardStats = lazy(() => import('@/components/dashboard/DashboardStats'));
const MonthlyTrendsChart = lazy(() => import('@/components/dashboard/MonthlyTrendsChart'));
const AnimalTypeDistribution = lazy(() => import('@/components/dashboard/AnimalTypeDistribution'));
const RecentExpenses = lazy(() => import('@/components/dashboard/RecentExpenses'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-600"></div>
  </div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimals: 0,
    monthlySales: 0,
    monthlyExpenses: 0,
    monthlyProfit: 0,
    monthlySalesCount: 0,
    highestSale: { amount: 0, description: '' },
    monthlyTrends: {
      sales: [],
      expenses: []
    },
    animalTypes: []
  });

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);

      // Fetch all animal sales and filter by date in memory
      const salesQuery = query(
        collection(db, 'income'),
        where('type', '==', 'Animal Sale')
      );

      const salesSnapshot = await getDocs(salesQuery);
      const allSales = salesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Income[];

      // Fetch all expenses
      const expensesQuery = query(collection(db, 'expenses'));
      const expensesSnapshot = await getDocs(expensesQuery);
      const allExpenses = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];

      // Fetch all animals
      const animalsQuery = query(collection(db, 'animals'));
      const animalsSnapshot = await getDocs(animalsQuery);
      const allAnimals = animalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Animal[];

      // Calculate monthly trends (last 6 months)
      const monthlyTrends = {
        sales: Array.from({ length: 6 }, (_, i) => {
          const month = subMonths(now, i);
          const start = startOfMonth(month);
          const end = endOfMonth(month);
          
          const monthSales = allSales.filter(sale => {
            const saleDate = sale.date instanceof Date 
              ? sale.date 
              : sale.date?.toDate?.() || new Date(sale.date);
            return saleDate >= start && saleDate <= end;
          });

          return {
            month: format(month, 'MMM yyyy'),
            amount: monthSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
          };
        }).reverse(),

        expenses: Array.from({ length: 6 }, (_, i) => {
          const month = subMonths(now, i);
          const start = startOfMonth(month);
          const end = endOfMonth(month);
          
          const monthExpenses = allExpenses.filter(expense => {
            const expenseDate = expense.date instanceof Date 
              ? expense.date 
              : expense.date?.toDate?.() || new Date(expense.date);
            return expenseDate >= start && expenseDate <= end;
          });

          return {
            month: format(month, 'MMM yyyy'),
            amount: monthExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
          };
        }).reverse()
      };

      // Calculate animal types distribution
      const animalTypes = Object.entries(
        allAnimals.reduce((acc, animal) => {
          const type = animal.type || 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([type, count]) => ({ type, count: Number(count) }));

      // Filter sales for current month
      const monthlySales = allSales.filter(sale => {
        const saleDate = sale.date instanceof Date 
          ? sale.date 
          : sale.date?.toDate?.() || new Date(sale.date);
        return saleDate >= startOfCurrentMonth && saleDate <= endOfCurrentMonth;
      });

      // Filter expenses for current month
      const monthlyExpenses = allExpenses.filter(expense => {
        const expenseDate = expense.date instanceof Date 
          ? expense.date 
          : expense.date?.toDate?.() || new Date(expense.date);
        return expenseDate >= startOfCurrentMonth && expenseDate <= endOfCurrentMonth;
      });

      // Calculate statistics
      const monthlyTotalSales = monthlySales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
      const monthlyTotalExpenses = monthlyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const monthlyProfit = monthlyTotalSales - monthlyTotalExpenses;
      const highestSale = monthlySales.reduce((max, sale) => 
        (sale.amount || 0) > max.amount ? { amount: sale.amount || 0, description: sale.description || '' } : max, 
        { amount: 0, description: '' }
      );

      setStats({
        totalAnimals: allAnimals.length,
        monthlySales: monthlyTotalSales,
        monthlyExpenses: monthlyTotalExpenses,
        monthlyProfit,
        monthlySalesCount: monthlySales.length,
        highestSale,
        monthlyTrends,
        animalTypes
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Suspense fallback={<LoadingFallback />}>
            <DashboardStats stats={stats} />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <MonthlyTrendsChart trends={stats.monthlyTrends} />
          </Suspense>
        </div>
        
        <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Suspense fallback={<LoadingFallback />}>
            <AnimalTypeDistribution types={stats.animalTypes} />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <RecentExpenses expenses={stats.recentExpenses} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
