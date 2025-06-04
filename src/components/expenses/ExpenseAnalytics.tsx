import React, { useMemo } from 'react';
import { BarChart3, Calendar, DollarSign } from 'lucide-react';
import ExpenseChart from '../dashboard/ExpenseChart';
import { ExpenseFilters } from './ExpenseFilters';
import { ChartData, Expense } from '@/types';
import { format, isSameMonth, startOfMonth, endOfMonth } from 'date-fns';
import { formatCurrency } from '@/utils/format';

interface ExpenseAnalyticsProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  expenses: Expense[];
  totalExpense: number;
  averageExpense: number;
  highestExpense: {
    category: string;
    amount: number;
  };
  monthlyData: {
    date: string;
    amount: number;
  }[];
  categoryData: ChartData[];
  getCategoryIcon: (category: string) => JSX.Element;
  selectedDate: Date | null;
}

function ExpenseAnalytics({
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  expenses,
  totalExpense,
  averageExpense,
  highestExpense,
  monthlyData,
  categoryData,
  getCategoryIcon,
  selectedDate
}: ExpenseAnalyticsProps) {
  // Calculate monthly totals directly from expenses
  const monthlyStats = useMemo(() => {
    if (!selectedDate) return { total: 0, dailyTotal: 0, highest: { category: 'N/A', amount: 0 } };
    
    // Filter expenses for the selected month
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = expense.date instanceof Date 
        ? expense.date 
        : expense.date?.toDate?.() || new Date(expense.date);
      return isSameMonth(expenseDate, selectedDate);
    });

    // Calculate total for the month
    const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate total for the selected day
    const dailyTotal = monthlyExpenses.filter(expense => {
      const expenseDate = expense.date instanceof Date 
        ? expense.date 
        : expense.date?.toDate?.() || new Date(expense.date);
      return format(expenseDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    }).reduce((sum, expense) => sum + expense.amount, 0);
    
    // Find highest expense
    const highest = monthlyExpenses.length > 0 
      ? monthlyExpenses.reduce((max, expense) => expense.amount > max.amount ? expense : max, monthlyExpenses[0])
      : { category: 'N/A', amount: 0 };

    return { total, dailyTotal, highest };
  }, [expenses, selectedDate]);

  // Filter monthly data for charts - include all days with actual data
  const filteredMonthlyData = useMemo(() => {
    if (!selectedDate) return monthlyData;
    
    // Get all expenses for the month
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = expense.date instanceof Date 
        ? expense.date 
        : expense.date?.toDate?.() || new Date(expense.date);
      return isSameMonth(expenseDate, selectedDate);
    });

    // Group expenses by day
    const dailyTotals = monthlyExpenses.reduce((acc, expense) => {
      const expenseDate = expense.date instanceof Date 
        ? expense.date 
        : expense.date?.toDate?.() || new Date(expense.date);
      const dayKey = format(expenseDate, 'yyyy-MM-dd');
      const current = acc.get(dayKey) || 0;
      acc.set(dayKey, current + expense.amount);
      return acc;
    }, new Map<string, number>());

    return Array.from(dailyTotals.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [expenses, selectedDate]);

  // Filter category data for charts
  const filteredCategoryData = useMemo(() => {
    if (!selectedDate) return categoryData;
    
    const categoryMap = new Map<string, number>();
    expenses.forEach(expense => {
      const expenseDate = expense.date instanceof Date 
        ? expense.date 
        : expense.date?.toDate?.() || new Date(expense.date);
      
      if (isSameMonth(expenseDate, selectedDate)) {
        const currentAmount = categoryMap.get(expense.category) || 0;
        categoryMap.set(expense.category, currentAmount + expense.amount);
      }
    });
    
    return Array.from(categoryMap.entries())
      .map(([name, amount]) => ({ name, value: amount, amount }));
  }, [expenses, selectedDate]);

  return (
    <div className="mb-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        <BarChart3 className="h-5 w-5 mr-2 text-farm-600" />
        Expense Overview
      </h2>
        {selectedDate && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {format(selectedDate, 'MMMM yyyy')}
          </div>
        )}
      </div>
      
      {/* Filter Controls */}
      <ExpenseFilters 
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        expenses={expenses}
      />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4">
        {/* Monthly Summary */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            Monthly Summary
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(monthlyStats.total)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Daily Total</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(monthlyStats.dailyTotal)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Highest Expense</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(monthlyStats.highest.amount)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Monthly Trend Chart */}
        <ExpenseChart 
          recentExpenses={filteredMonthlyData}
          chartType="line"
          title="Monthly Expense Trend"
          description="Expense pattern over time"
        />
        
        {/* Category Distribution Chart */}
        <ExpenseChart 
          categoryData={filteredCategoryData}
          chartType="pie"
          title="Monthly Category Distribution"
          description="Distribution across categories"
        />
      </div>
    </div>
  );
}

export default ExpenseAnalytics;
