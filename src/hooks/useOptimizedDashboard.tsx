import { useState, useEffect, useMemo } from "react";
import { collection, query, getDocs, where, Timestamp, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface DashboardStats {
  totalAnimals: number;
  dailyExpenses: number;
  monthlyProfit: number;
  recentExpenses: {
    date: string;
    amount: number;
  }[];
  animalsByType: {
    name: string;
    count: number;
  }[];
}

interface DashboardState {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for dashboard
const dashboardCache = new Map<string, { data: DashboardStats; timestamp: number }>();

const DEFAULT_STATS: DashboardStats = {
    totalAnimals: 0,
    dailyExpenses: 0,
    monthlyProfit: 0,
    recentExpenses: [],
    animalsByType: [],
};

export default function useOptimizedDashboard() {
  const [state, setState] = useState<DashboardState>({
    stats: DEFAULT_STATS,
    loading: true,
    error: null,
  });

  // Memoized date calculations
  const dates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    return { today, last7Days };
  }, []);

    const fetchDashboardData = async () => {
      // Check cache first
      const cachedData = dashboardCache.get('dashboard');
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      setState(prev => ({ ...prev, stats: cachedData.data, loading: false, error: null }));
        return;
      }

      try {
      setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Fetch data in parallel for better performance
      const [animalSnapshot, todayExpensesSnapshot, recentExpensesSnapshot, monthlyExpensesSnapshot] = await Promise.all([
        getDocs(query(collection(db, "animals"), limit(1000))),
          getDocs(query(
            collection(db, "expenses"),
            where("date", ">=", Timestamp.fromDate(dates.today)),
            limit(100)
          )),
          getDocs(query(
            collection(db, "expenses"),
            where("date", ">=", Timestamp.fromDate(dates.last7Days)),
            orderBy("date", "desc"),
            limit(200)
        )),
        getDocs(query(
          collection(db, "expenses"),
          where("date", ">=", Timestamp.fromDate(new Date(dates.today.getFullYear(), dates.today.getMonth(), 1))),
          limit(1000)
          ))
        ]);
        
        // Process animals data
        const totalAnimals = animalSnapshot.size;
        const animalTypes: Record<string, number> = {};
        
        animalSnapshot.forEach((doc) => {
          const animal = doc.data();
          const type = animal.type || 'Unknown';
          animalTypes[type] = (animalTypes[type] || 0) + 1;
        });
        
      const animalsByType = Object.keys(animalTypes)
        .map(type => ({
          name: type,
          count: animalTypes[type]
        }))
        .sort((a, b) => b.count - a.count); // Sort by count in descending order
        
        // Process today's expenses
        let dailyExpenses = 0;
        todayExpensesSnapshot.forEach((doc) => {
          const expense = doc.data();
        dailyExpenses += Number(expense.amount) || 0;
      });
      
      // Process monthly expenses for profit calculation
      let monthlyExpenses = 0;
      monthlyExpensesSnapshot.forEach((doc) => {
        const expense = doc.data();
        monthlyExpenses += Number(expense.amount) || 0;
        });
        
        // Process recent expenses for chart
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
          if (expense.date && expense.date.toDate) {
            const date = expense.date.toDate();
            const dateStr = date.toISOString().split('T')[0];
          const amount = Number(expense.amount) || 0;
          expensesByDay[dateStr] = (expensesByDay[dateStr] || 0) + amount;
          }
        });
        
        const recentExpenses = Object.keys(expensesByDay)
          .sort()
          .map(date => ({
            date,
            amount: expensesByDay[date]
          }));
        
      // Calculate monthly profit (estimated revenue - expenses)
      const estimatedMonthlyRevenue = totalAnimals * 500; // Example: $500 per animal per month
      const monthlyProfit = Math.max(0, estimatedMonthlyRevenue - monthlyExpenses);
        
        const newStats: DashboardStats = {
          totalAnimals,
          dailyExpenses,
          monthlyProfit,
          recentExpenses,
          animalsByType
        };

      setState(prev => ({ ...prev, stats: newStats, loading: false, error: null }));
        
        // Cache the results
        dashboardCache.set('dashboard', {
          data: newStats,
          timestamp: Date.now()
        });
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: "Failed to load dashboard data. Please try again." 
      }));
      }
    };
    
  useEffect(() => {
    fetchDashboardData();
  }, [dates.today, dates.last7Days]);

  // Function to refresh data
  const refreshData = () => {
    dashboardCache.clear();
    fetchDashboardData();
  };

  return { 
    stats: state.stats, 
    loading: state.loading, 
    error: state.error,
    refreshData 
  };
}
