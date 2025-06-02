
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

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for dashboard
const dashboardCache = new Map<string, { data: any; timestamp: number }>();

export default function useOptimizedDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimals: 0,
    dailyExpenses: 0,
    monthlyProfit: 0,
    recentExpenses: [],
    animalsByType: [],
  });
  const [loading, setLoading] = useState(true);

  // Memoized date calculations
  const dates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    return { today, last7Days };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Check cache first
      const cachedData = dashboardCache.get('dashboard');
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        setStats(cachedData.data);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch data in parallel for better performance
        const [animalSnapshot, todayExpensesSnapshot, recentExpensesSnapshot] = await Promise.all([
          getDocs(query(collection(db, "animals"), limit(1000))), // Reasonable limit
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
        
        const animalsByType = Object.keys(animalTypes).map(type => ({
          name: type,
          count: animalTypes[type]
        }));
        
        // Process today's expenses
        let dailyExpenses = 0;
        todayExpensesSnapshot.forEach((doc) => {
          const expense = doc.data();
          dailyExpenses += expense.amount || 0;
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
            expensesByDay[dateStr] = (expensesByDay[dateStr] || 0) + (expense.amount || 0);
          }
        });
        
        const recentExpenses = Object.keys(expensesByDay)
          .sort()
          .map(date => ({
            date,
            amount: expensesByDay[date]
          }));
        
        // Calculate monthly profit (simplified)
        const monthlyProfit = Math.max(0, 12500 - dailyExpenses * 30);
        
        const newStats = {
          totalAnimals,
          dailyExpenses,
          monthlyProfit,
          recentExpenses,
          animalsByType
        };

        setStats(newStats);
        
        // Cache the results
        dashboardCache.set('dashboard', {
          data: newStats,
          timestamp: Date.now()
        });
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dates.today, dates.last7Days]);

  // Function to refresh data
  const refreshData = () => {
    dashboardCache.clear();
    setLoading(true);
  };

  return { stats, loading, refreshData };
}
