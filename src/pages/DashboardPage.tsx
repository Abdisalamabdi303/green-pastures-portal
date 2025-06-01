import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { User, Animal, Expense } from '../types';
import { animalServices, expenseServices } from '../services/firebase';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/format';
import ExpenseChart from '@/components/expenses/ExpenseChart';
import { Card, CardContent } from '@/components/ui/card';

// Farm-themed color palette
const COLORS = ['#94cf43', '#c1986a', '#6b768a', '#6b8e23', '#cd853f'];

interface DashboardStats {
  totalAnimals: number;
  totalExpenses: number;
  averageExpense: number;
  monthlyExpenses: {
    month: string;
    amount: number;
  }[];
  animalsByType: {
    type: string;
    count: number;
  }[];
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimals: 0,
    totalExpenses: 0,
    averageExpense: 0,
    monthlyExpenses: [],
    animalsByType: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [animals, expenses] = await Promise.all([
        animalServices.getAnimals(),
        expenseServices.getExpenses()
      ]) as [Animal[], Expense[]];

      // Calculate statistics
      const totalAnimals = animals.length;
      const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const averageExpense = expenses.length ? totalExpenses / expenses.length : 0;

      // Process monthly expenses
      const monthlyMap = new Map<string, number>();
      expenses.forEach(expense => {
        let date: Date;
        if (typeof expense.date === 'object' && 'toDate' in expense.date) {
          date = expense.date.toDate();
        } else {
          date = new Date(expense.date as string);
        }
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyMap.set(monthYear, (monthlyMap.get(monthYear) || 0) + (expense.amount || 0));
      });

      const monthlyExpenses = Array.from(monthlyMap.entries())
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      // Process animals by type
      const typeMap = new Map<string, number>();
      animals.forEach(animal => {
        const type = animal.type || 'Unknown';
        typeMap.set(type, (typeMap.get(type) || 0) + 1);
      });

      const animalsByType = Array.from(typeMap.entries())
        .map(([type, count]) => ({ type, count }));

      setStats({
        totalAnimals,
        totalExpenses,
        averageExpense,
        monthlyExpenses,
        animalsByType
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // Prepare data for charts
  const monthlyChartData = stats.monthlyExpenses.map((item, index) => ({
    name: item.month,
    value: item.amount,
    color: COLORS[index % COLORS.length]
  }));

  const animalTypeChartData = stats.animalsByType.map((item, index) => ({
    name: item.type,
    value: item.count,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard Overview</h1>
          
          {/* Summary Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Animals</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalAnimals}</p>
                  </div>
                  <div className="p-3 bg-farm-50 rounded-full">
                    <svg className="h-6 w-6 text-farm-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalExpenses)}</p>
                  </div>
                  <div className="p-3 bg-farm-50 rounded-full">
                    <svg className="h-6 w-6 text-farm-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
            </div>
          </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Expense</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.averageExpense)}</p>
                  </div>
                  <div className="p-3 bg-farm-50 rounded-full">
                    <svg className="h-6 w-6 text-farm-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
              </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Expenses Chart */}
            <ExpenseChart 
              data={monthlyChartData}
              title="Monthly Expenses"
              description="Expense trend over time"
              chartType="line"
              loading={loading}
            />
            
            {/* Animals by Type Chart */}
            <ExpenseChart 
              data={animalTypeChartData}
              title="Animals by Type"
              description="Distribution of animals by type"
              chartType="pie"
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
