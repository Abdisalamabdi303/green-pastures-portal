
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import StatCards from "@/components/dashboard/StatCards";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import AnimalTypesChart from "@/components/dashboard/AnimalTypesChart";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnimals: 0,
    dailyExpenses: 0,
    monthlyProfit: 0,
    animalsByType: [] as { name: string; count: number }[]
  });
  const [recentExpenses, setRecentExpenses] = useState<{date: string; amount: number}[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get total animals and types
        const animalsQuery = query(collection(db, "animals"));
        const animalSnapshot = await getDocs(animalsQuery);
        const totalAnimals = animalSnapshot.size;
        
        // Get animal types for chart
        const animalTypes: Record<string, number> = {};
        animalSnapshot.forEach((doc) => {
          const animal = doc.data();
          if (animal.type) {
            animalTypes[animal.type] = (animalTypes[animal.type] || 0) + 1;
          }
        });
        
        const animalsByType = Object.keys(animalTypes).map(type => ({
          name: type,
          count: animalTypes[type]
        }));
        
        // Get today's expenses
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayExpensesQuery = query(
          collection(db, "expenses"),
          where("date", ">=", Timestamp.fromDate(today))
        );
        
        const expensesSnapshot = await getDocs(todayExpensesQuery);
        let dailyExpenses = 0;
        
        expensesSnapshot.forEach((doc) => {
          const expense = doc.data();
          dailyExpenses += expense.amount || 0;
        });
        
        // Get recent expenses for chart (last 7 days)
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        
        const recentExpensesQuery = query(
          collection(db, "expenses"),
          orderBy("date", "desc"),
          limit(7)
        );
        
        const recentExpensesSnapshot = await getDocs(recentExpensesQuery);
        const expenses: {date: string; amount: number}[] = [];
        
        recentExpensesSnapshot.forEach((doc) => {
          const data = doc.data();
          const date = data.date instanceof Timestamp ? 
            data.date.toDate() : 
            new Date(data.date);
          
          // Format date for chart display
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
          
          expenses.push({
            date: formattedDate,
            amount: data.amount || 0
          });
        });
        
        // Calculate monthly profit (dummy value for now)
        // In a real app, this would come from revenue - expenses
        const monthlyProfit = 5000 - dailyExpenses;
        
        setStats({
          totalAnimals,
          dailyExpenses,
          monthlyProfit,
          animalsByType
        });
        
        setRecentExpenses(expenses.reverse()); // Reverse to show chronological order
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
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
        
        {loading ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-[350px] w-full" />
              <Skeleton className="h-[350px] w-full" />
            </div>
          </div>
        ) : (
          <>
            <StatCards 
              totalAnimals={stats.totalAnimals}
              dailyExpenses={stats.dailyExpenses}
              monthlyProfit={stats.monthlyProfit}
            />
            
            <div className="grid gap-4 md:grid-cols-2">
              <ExpenseChart 
                recentExpenses={recentExpenses} 
                title="Recent Expenses"
                description="Daily expenses for the past week"
              />
              <AnimalTypesChart animalsByType={stats.animalsByType} />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
