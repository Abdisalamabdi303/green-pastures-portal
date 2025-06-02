
import React from 'react';
import Navbar from '../components/layout/Navbar';
import StatCards from '../components/dashboard/StatCards';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import AnimalTypesChart from '../components/dashboard/AnimalTypesChart';
import useOptimizedDashboard from '../hooks/useOptimizedDashboard';
import { DashboardSkeleton } from '../components/ui/expense-skeleton';

const DashboardPage = () => {
  const { stats, loading } = useOptimizedDashboard();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
          
          {loading ? (
            <DashboardSkeleton />
          ) : (
            <div className="space-y-6">
              {/* Stats Cards */}
              <StatCards 
                totalAnimals={stats.totalAnimals}
                dailyExpenses={stats.dailyExpenses}
                monthlyProfit={stats.monthlyProfit}
              />
              
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExpenseChart expenses={stats.recentExpenses} />
                <AnimalTypesChart animals={stats.animalsByType} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
