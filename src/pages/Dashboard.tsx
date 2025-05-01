
import { useEffect, useState } from "react";
import { 
  collection, 
  query, 
  getDocs, 
  where, 
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bird, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

interface DashboardStats {
  totalAnimals: number;
  dailyExpenses: number;
  monthlyProfit: number;
  recentExpenses: any[];
  animalsByType: any[];
}

export default function Dashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimals: 0,
    dailyExpenses: 0,
    monthlyProfit: 0,
    recentExpenses: [],
    animalsByType: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get total animals
        const animalsQuery = query(collection(db, "animals"));
        const animalSnapshot = await getDocs(animalsQuery);
        const totalAnimals = animalSnapshot.size;
        
        // Get animal types for chart
        const animalTypes: Record<string, number> = {};
        animalSnapshot.forEach((doc) => {
          const animal = doc.data();
          animalTypes[animal.type] = (animalTypes[animal.type] || 0) + 1;
        });
        
        const animalsByType = Object.keys(animalTypes).map(type => ({
          name: type,
          count: animalTypes[type]
        }));
        
        // Get today's expenses
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const expensesQuery = query(
          collection(db, "expenses"),
          where("date", ">=", Timestamp.fromDate(today))
        );
        
        const expensesSnapshot = await getDocs(expensesQuery);
        let dailyExpenses = 0;
        
        expensesSnapshot.forEach((doc) => {
          const expense = doc.data();
          dailyExpenses += expense.amount;
        });
        
        // Get recent expenses for chart (last 7 days)
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        
        const recentExpensesQuery = query(
          collection(db, "expenses"),
          where("date", ">=", Timestamp.fromDate(last7Days))
        );
        
        const recentExpensesSnapshot = await getDocs(recentExpensesQuery);
        const expensesByDay: Record<string, number> = {};
        
        // Initialize the last 7 days
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          expensesByDay[dateStr] = 0;
        }
        
        recentExpensesSnapshot.forEach((doc) => {
          const expense = doc.data();
          const date = expense.date.toDate();
          const dateStr = date.toISOString().split('T')[0];
          expensesByDay[dateStr] = (expensesByDay[dateStr] || 0) + expense.amount;
        });
        
        const recentExpenses = Object.keys(expensesByDay)
          .sort()
          .map(date => ({
            date,
            amount: expensesByDay[date]
          }));
        
        // Dummy profit data for now
        const monthlyProfit = 12500 - 8750;
        
        setStats({
          totalAnimals,
          dailyExpenses,
          monthlyProfit,
          recentExpenses,
          animalsByType
        });
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome, {userData?.name || 'Farmer'}
        </h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
              <Bird className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnimals}</div>
              <p className="text-xs text-muted-foreground">
                Registered in the system
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.dailyExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                For all operations today
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Profit</CardTitle>
              {stats.monthlyProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{Math.abs(stats.monthlyProfit).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.monthlyProfit >= 0 ? 'Profit' : 'Loss'} this month
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Daily expenses for the past week</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.recentExpenses}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#94cf43" 
                    activeDot={{ r: 8 }} 
                    name="Expense Amount"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="bg-white col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Animals by Type</CardTitle>
              <CardDescription>Distribution of livestock</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.animalsByType}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Count']} />
                  <Legend />
                  <Bar dataKey="count" fill="#94cf43" name="Number of Animals" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
