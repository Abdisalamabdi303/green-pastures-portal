import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/lib/api/dashboard';
import { useToast } from '@/components/ui/use-toast';

interface DashboardStats {
  totalAnimals: number;
  dailyExpenses: number;
  monthlyProfit: number;
  monthlyIncome: number;
  recentExpenses: Array<{
    date: string;
    amount: number;
  }>;
  animalsByType: Array<{
    type: string;
    count: number;
  }>;
}

export default function useOptimizedDashboard() {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const { data: stats, isLoading, refetch } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      });
    }
  });

  const refreshData = useCallback(async () => {
    try {
      setError(null);
      await refetch();
      toast({
        title: "Success",
        description: "Dashboard data refreshed successfully.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh dashboard data');
      toast({
        title: "Error",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
      });
    }
  }, [refetch, toast]);

  return {
    stats: stats || {
      totalAnimals: 0,
      dailyExpenses: 0,
      monthlyProfit: 0,
      monthlyIncome: 0,
      recentExpenses: [],
      animalsByType: []
    },
    loading: isLoading,
    error,
    refreshData
  };
} 