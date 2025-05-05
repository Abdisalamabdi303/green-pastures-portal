
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import useDashboardData from "@/hooks/useDashboardData";
import StatCards from "@/components/dashboard/StatCards";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import AnimalTypesChart from "@/components/dashboard/AnimalTypesChart";

export default function Dashboard() {
  const { userData } = useAuth();
  const { stats, loading } = useDashboardData();

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome, {userData?.name || 'Farmer'}
        </h1>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            <StatCards 
              totalAnimals={stats.totalAnimals}
              dailyExpenses={stats.dailyExpenses}
              monthlyProfit={stats.monthlyProfit}
            />
            
            <div className="grid gap-4 md:grid-cols-2">
              <ExpenseChart recentExpenses={stats.recentExpenses} />
              <AnimalTypesChart animalsByType={stats.animalsByType} />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
