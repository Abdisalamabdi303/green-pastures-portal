
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import useDashboardData from "@/hooks/useDashboardData";
import StatCards from "@/components/dashboard/StatCards";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import AnimalTypesChart from "@/components/dashboard/AnimalTypesChart";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function Dashboard() {
  const { userData } = useAuth();
  const { stats, loading } = useDashboardData();
  const [recentExpenses, setRecentExpenses] = useState<{date: string; amount: number}[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);

  useEffect(() => {
    // Fetch recent expenses from Firestore
    const fetchRecentExpenses = async () => {
      try {
        setExpensesLoading(true);
        const q = query(
          collection(db, "expenses"),
          orderBy("date", "desc"),
          limit(7)
        );
        
        const querySnapshot = await getDocs(q);
        const expenses: {date: string; amount: number}[] = [];
        
        querySnapshot.forEach((doc) => {
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
            amount: data.amount
          });
        });
        
        // Reverse to show chronological order
        setRecentExpenses(expenses.reverse());
      } catch (error) {
        console.error("Error fetching recent expenses:", error);
        toast({
          title: "Error",
          description: "Failed to load expense data",
          variant: "destructive"
        });
      } finally {
        setExpensesLoading(false);
      }
    };
    
    fetchRecentExpenses();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome, {userData?.name || 'Farmer'}
        </h1>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-farm-600"></div>
            <p className="ml-2">Loading dashboard data...</p>
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
                loading={expensesLoading}
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
