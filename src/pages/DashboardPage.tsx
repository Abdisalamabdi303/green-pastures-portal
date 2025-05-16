import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { User, Animal, Expense } from '../types';
import { animalServices, expenseServices } from '../services/firebase';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimals: 0,
    totalExpenses: 0,
    averageExpense: 0,
    monthlyExpenses: [],
    animalsByType: []
  });
  const navigate = useNavigate();

  const calculateStats = (animals: Animal[], expenses: Expense[]) => {
    // Calculate total animals
    const totalAnimals = animals.length;

    // Calculate expenses stats
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const averageExpense = totalExpenses / (expenses.length || 1);

    // Calculate monthly expenses
    const monthlyExpenses = expenses.reduce((acc: { [key: string]: number }, expense) => {
      const date = new Date(expense.date);
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[monthYear] = (acc[monthYear] || 0) + (expense.amount || 0);
      return acc;
    }, {});

    // Convert monthly expenses to array and sort by date
    const monthlyExpensesArray = Object.entries(monthlyExpenses)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Get last 6 months

    // Calculate animals by type
    const animalsByType = animals.reduce((acc: { [key: string]: number }, animal) => {
      const type = animal.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Convert animals by type to array
    const animalsByTypeArray = Object.entries(animalsByType)
      .map(([type, count]) => ({ type, count }));

    return {
      totalAnimals,
      totalExpenses,
      averageExpense,
      monthlyExpenses: monthlyExpensesArray,
      animalsByType: animalsByTypeArray
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [animals, expenses] = await Promise.all([
        animalServices.getAnimals(),
        expenseServices.getExpenses()
      ]);

      const dashboardStats = calculateStats(animals, expenses);
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    fetchDashboardData();
  }, [navigate]);

  if (!user || loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="text-sm text-gray-500">
              Welcome back, {user.name}
            </div>
          </div>
          
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-500">Total Animals</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.totalAnimals}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-500">Total Expenses</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {formatCurrency(stats.totalExpenses)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-500">Average Expense</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                {formatCurrency(stats.averageExpense)}
                </p>
              </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Expenses Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Expenses</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyExpenses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Bar dataKey="amount" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Animals by Type Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Animals by Type</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.animalsByType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="type" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
