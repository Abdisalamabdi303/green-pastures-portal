import { useState, useEffect } from 'react';
import { Expense } from '@/types';

export function useExpenseFilters(expenses: Expense[]) {
  // Initialize with current date values
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [searchTerm, setSearchTerm] = useState('');
  
  // For visualizations and analytics
  const [categoryData, setCategoryData] = useState<Array<{name: string; amount: number}>>([]);
  const [monthlyData, setMonthlyData] = useState<{date: string; amount: number}[]>([]);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [averageExpense, setAverageExpense] = useState<number>(0);
  const [highestExpense, setHighestExpense] = useState<{category: string; amount: number}>({category: '', amount: 0});

  useEffect(() => {
    if (expenses.length > 0) {
      // Process data for visualizations
      processExpenseData();
    }
  }, [expenses, selectedYear, selectedMonth]);

  const processExpenseData = () => {
    // Filter expenses for the selected year and month
    const filteredExpenses = expenses.filter(expense => {
      // Handle Firebase Timestamp or string date
      let expenseDate;
      if (expense.date) {
        if (typeof expense.date === 'object' && 'toDate' in expense.date && typeof expense.date.toDate === 'function') {
          expenseDate = expense.date.toDate();
        } else if (typeof expense.date === 'string') {
          expenseDate = new Date(expense.date);
        } else {
          return false; // Skip this expense if we can't determine the date
        }
        
        return expenseDate.getFullYear() === selectedYear && 
               (selectedMonth === -1 || expenseDate.getMonth() === selectedMonth);
      }
      return false; // Skip if no date
    });
    
    // Calculate total expense
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalExpense(total);
    
    // Calculate average expense
    setAverageExpense(filteredExpenses.length > 0 ? total / filteredExpenses.length : 0);
    
    // Get expense by category
    const categoryMap: Record<string, number> = {};
    filteredExpenses.forEach(expense => {
      if (expense.category) {
        categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.amount;
      }
    });
    
    // Convert to array for charts
    const categoryChartData = Object.keys(categoryMap).map(category => ({
      name: category,
      amount: categoryMap[category]
    }));
    
    setCategoryData(categoryChartData);
    
    // Find highest expense category
    if (categoryChartData.length > 0) {
      const highest = categoryChartData.reduce((prev, current) => 
        prev.amount > current.amount ? prev : current
      );
      
      setHighestExpense({
        category: highest.name,
        amount: highest.amount
      });
    }
    
    // Get monthly data
    const monthlyMap: Record<string, number> = {};
    filteredExpenses.forEach(expense => {
      // Handle Firebase Timestamp
      let date;
      if (expense.date) {
        if (typeof expense.date === 'object' && 'toDate' in expense.date && typeof expense.date.toDate === 'function') {
          date = expense.date.toDate();
        } else if (typeof expense.date === 'string') {
          date = new Date(expense.date);
        } else {
          return; // Skip this expense if we can't determine the date
        }
        
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthlyMap[monthYear] = (monthlyMap[monthYear] || 0) + expense.amount;
      }
    });
    
    // Convert to array for charts and sort by date
    const monthlyChartData = Object.keys(monthlyMap)
      .map(date => ({
        date,
        amount: monthlyMap[date]
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    setMonthlyData(monthlyChartData);
  };

  return {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    searchTerm,
    setSearchTerm,
    categoryData,
    monthlyData,
    totalExpense,
    averageExpense,
    highestExpense,
    processExpenseData
  };
}
