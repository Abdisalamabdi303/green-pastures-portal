
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Expense } from '@/types';

export function useExpenseFilters(expenses: Expense[]) {
  // Initialize with current date values
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [searchTerm, setSearchTerm] = useState('');

  // Memoize filtered expenses to avoid recalculating on every render
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Handle Firebase Timestamp or string date
      let expenseDate;
      if (expense.date) {
        if (typeof expense.date === 'object' && 'toDate' in expense.date && typeof expense.date.toDate === 'function') {
          expenseDate = expense.date.toDate();
        } else if (typeof expense.date === 'string') {
          expenseDate = new Date(expense.date);
        } else if (expense.date instanceof Date) {
          expenseDate = expense.date;
        } else {
          return false;
        }
        
        return expenseDate.getFullYear() === selectedYear && 
               (selectedMonth === -1 || expenseDate.getMonth() === selectedMonth);
      }
      return false;
    });
  }, [expenses, selectedYear, selectedMonth]);

  // Memoize analytics data to avoid recalculating on every render
  const analytics = useMemo(() => {
    // Calculate total expense
    const totalExpense = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate average expense
    const averageExpense = filteredExpenses.length > 0 ? totalExpense / filteredExpenses.length : 0;
    
    // Get expense by category
    const categoryMap: Record<string, number> = {};
    filteredExpenses.forEach(expense => {
      if (expense.category) {
        categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.amount;
      }
    });
    
    // Convert to array for charts
    const categoryData = Object.keys(categoryMap).map(category => ({
      name: category,
      amount: categoryMap[category]
    }));
    
    // Find highest expense category
    const highestExpense = categoryData.length > 0 
      ? categoryData.reduce((prev, current) => prev.amount > current.amount ? prev : current)
      : { name: '', amount: 0 };
    
    // Get monthly data
    const monthlyMap: Record<string, number> = {};
    filteredExpenses.forEach(expense => {
      let date;
      if (expense.date) {
        if (typeof expense.date === 'object' && 'toDate' in expense.date && typeof expense.date.toDate === 'function') {
          date = expense.date.toDate();
        } else if (typeof expense.date === 'string') {
          date = new Date(expense.date);
        } else if (expense.date instanceof Date) {
          date = expense.date;
        } else {
          return;
        }
        
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthlyMap[monthYear] = (monthlyMap[monthYear] || 0) + expense.amount;
      }
    });
    
    // Convert to array for charts and sort by date
    const monthlyData = Object.keys(monthlyMap)
      .map(date => ({
        date,
        amount: monthlyMap[date]
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalExpense,
      averageExpense,
      categoryData,
      monthlyData,
      highestExpense: {
        category: highestExpense.name || '',
        amount: highestExpense.amount
      }
    };
  }, [filteredExpenses]);

  // Memoize callbacks to prevent unnecessary re-renders
  const setSelectedYearCallback = useCallback((year: number) => {
    setSelectedYear(year);
  }, []);

  const setSelectedMonthCallback = useCallback((month: number) => {
    setSelectedMonth(month);
  }, []);

  const setSearchTermCallback = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return {
    selectedYear,
    setSelectedYear: setSelectedYearCallback,
    selectedMonth,
    setSelectedMonth: setSelectedMonthCallback,
    searchTerm,
    setSearchTerm: setSearchTermCallback,
    categoryData: analytics.categoryData,
    monthlyData: analytics.monthlyData,
    totalExpense: analytics.totalExpense,
    averageExpense: analytics.averageExpense,
    highestExpense: analytics.highestExpense,
    filteredExpenses
  };
}
