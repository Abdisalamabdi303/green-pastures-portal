
import { useState, useEffect } from "react";
import { collection, query, getDocs, where, Timestamp } from "firebase/firestore";
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

export default function useDashboardData() {
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

  return { stats, loading };
}
