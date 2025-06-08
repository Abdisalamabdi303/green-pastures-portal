import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { User, Income, Expense, Animal } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar as CalendarIcon, Users, AlertTriangle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
      ).map(([type, count]) => ({ type, count }));

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
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dashboard
            </h2>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {/* Total Animals Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnimals}</div>
              <p className="text-xs text-gray-500 mt-1">
                Current inventory
              </p>
            </CardContent>
          </Card>

          {/* Monthly Sales Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlySales.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.monthlySalesCount} sales this month
              </p>
            </CardContent>
          </Card>

          {/* Monthly Expenses Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyExpenses.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">
                Total expenses this month
              </p>
            </CardContent>
          </Card>

          {/* Monthly Profit/Loss Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Profit/Loss</CardTitle>
              {stats.monthlyProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(stats.monthlyProfit).toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.monthlyProfit >= 0 ? 'Profit' : 'Loss'} this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          {/* Monthly Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Monthly Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyTrends.sales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                    <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Expenses Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Monthly Expenses Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyTrends.expenses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Expenses']} />
                    <Line type="monotone" dataKey="amount" stroke="#EF4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Animal Types Distribution */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Animals by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.animalTypes}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ type, percent }) => `${type} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {stats.animalTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} animals`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DashboardPage;
