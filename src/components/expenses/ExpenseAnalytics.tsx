
import { BarChart3 } from 'lucide-react';
import ExpenseChart from '../dashboard/ExpenseChart';
import ExpenseFilters from './ExpenseFilters';
import ExpenseSummaryCards from './ExpenseSummaryCards';
import { ChartData } from '@/types';

interface ExpenseAnalyticsProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  expenses: any[];
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
}

const ExpenseAnalytics = ({
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
  getCategoryIcon
}: ExpenseAnalyticsProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <BarChart3 className="h-5 w-5 mr-2 text-farm-600" />
        Expense Overview
      </h2>
      
      {/* Filter Controls */}
      <ExpenseFilters 
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        expenses={expenses}
      />
      
      {/* Summary Cards */}
      <ExpenseSummaryCards 
        totalExpense={totalExpense}
        averageExpense={averageExpense}
        highestExpense={highestExpense}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        getCategoryIcon={getCategoryIcon}
      />
      
      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Monthly Trend Chart */}
        <ExpenseChart 
          recentExpenses={monthlyData}
          chartType="line"
          title="Monthly Expense Trend"
          description="Expense pattern over time"
        />
        
        {/* Category Distribution Chart */}
        <ExpenseChart 
          recentExpenses={[]}
          categoryData={categoryData}
          chartType="pie"
          title="Expense by Category"
          description="Distribution across categories"
        />
      </div>
    </div>
  );
};

export default ExpenseAnalytics;
