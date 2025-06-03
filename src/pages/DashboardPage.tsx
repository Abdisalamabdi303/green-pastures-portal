import React from 'react';
import Navbar from '../components/layout/Navbar';
import StatCards from '../components/dashboard/StatCards';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import AnimalTypesChart from '../components/dashboard/AnimalTypesChart';
import useOptimizedDashboard from '../hooks/useOptimizedDashboard';
import { DashboardSkeleton } from '../components/ui/expense-skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DashboardPage = () => {
  const { stats, loading, error, refreshData } = useOptimizedDashboard();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <Button
              onClick={refreshData}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
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
                <ExpenseChart 
                  recentExpenses={stats.recentExpenses}
                  loading={loading}
                />
                <AnimalTypesChart 
                  animalsByType={stats.animalsByType}
                  loading={loading}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
