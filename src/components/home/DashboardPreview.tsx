import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PreviewStatCards from "./PreviewStatCards";
import PreviewExpenseChart from "./PreviewExpenseChart";

// Define types for our data
interface StatData {
  totalAnimals: number;
  monthlyExpenses: number;
  profitLoss: number;
}

interface ExpenseData {
  name: string;
  amount: number;
}

export default function DashboardPreview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatData>({
    totalAnimals: 0,
    monthlyExpenses: 0,
    profitLoss: 0
  });
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        setLoading(true);
        
        // Get active animals count
        const animalsQuery = query(
          collection(db, "animals"),
          where("status", "==", "active")
        );
        const animalSnapshot = await getDocs(animalsQuery);
        const animalCount = animalSnapshot.size;
        
        // Get recent expenses
        const expensesQuery = query(
          collection(db, "expenses"),
          orderBy("date", "desc"),
          limit(6)
        );
        
        const expenseSnapshot = await getDocs(expensesQuery);
        let totalExpense = 0;
        const expenseItems: ExpenseData[] = [];
        
        expenseSnapshot.forEach((doc) => {
          const expense = doc.data();
          totalExpense += expense.amount;
          
          // Format date for chart
          const date = expense.date && expense.date.toDate 
            ? expense.date.toDate() 
            : new Date(expense.date);
            
          const month = date.toLocaleString('default', { month: 'short' });
          
          // Add to chart data
          expenseItems.push({
            name: month,
            amount: expense.amount
          });
        });
        
        // Set dummy profit for now
        const profit = totalExpense > 0 ? totalExpense * 1.2 : 50000;
        
        setStats({
          totalAnimals: animalCount,
          monthlyExpenses: totalExpense,
          profitLoss: profit - totalExpense
        });
        
        setExpenseData(expenseItems);
      } catch (error) {
        console.error("Error fetching preview data:", error);
        
        // Fallback to mock data
        setStats({
          totalAnimals: 120,
          monthlyExpenses: 45000,
          profitLoss: 12500
        });
        
        setExpenseData([
          { name: "Jan", amount: 45000 },
          { name: "Feb", amount: 52000 },
          { name: "Mar", amount: 48000 },
          { name: "Apr", amount: 61000 },
          { name: "May", amount: 55000 },
          { name: "Jun", amount: 58000 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPreviewData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <p>Loading preview data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PreviewStatCards data={stats} />
      <PreviewExpenseChart data={expenseData} />
    </div>
  );
}
