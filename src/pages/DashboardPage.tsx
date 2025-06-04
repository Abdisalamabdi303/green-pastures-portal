import React, { Suspense, lazy } from 'react';
import Navbar from '../components/layout/Navbar';
import { DashboardSkeleton } from '../components/ui/expense-skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useOptimizedDashboard from '../hooks/useOptimizedDashboard';

// Lazy load components
const StatCards = lazy(() => import('../components/dashboard/StatCards'));
const ExpenseChart = lazy(() => import('../components/dashboard/ExpenseChart'));
const AnimalTypesChart = lazy(() => import('../components/dashboard/AnimalTypesChart'));

const DashboardPage = () => {
  const { stats, loading, error, refreshData } = useOptimizedDashboard();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Overview of your farm's performance and metrics
              </p>
            </div>
            <Button
              onClick={refreshData}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
          
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Main Content */}
          {loading ? (
            <DashboardSkeleton />
          ) : (
            <div className="space-y-6">
              {/* Stats Cards */}
              <Suspense fallback={<DashboardSkeleton />}>
                <StatCards 
                  totalAnimals={stats.totalAnimals}
                  dailyExpenses={stats.dailyExpenses}
                  monthlyProfit={stats.monthlyProfit}
                />
              </Suspense>
              
              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Trends</h2>
                  <Suspense fallback={<div className="h-[300px] animate-pulse bg-gray-100 rounded-lg" />}>
                    <ExpenseChart 
                      recentExpenses={stats.recentExpenses}
                      loading={loading}
                    />
                  </Suspense>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Animal Distribution</h2>
                  <Suspense fallback={<div className="h-[300px] animate-pulse bg-gray-100 rounded-lg" />}>
                    <AnimalTypesChart 
                      animalsByType={stats.animalsByType}
                      loading={loading}
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
