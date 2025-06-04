import React, { memo } from 'react';
import { Receipt, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';
import { ChartData } from '@/types';
import { formatCurrency } from '@/utils/format';

interface ExpenseSummaryCardsProps {
  totalExpense: number;
  averageExpense: number;
  highestExpense: {
    category: string;
    amount: number;
  };
  selectedYear: number;
  selectedMonth: number;
  getCategoryIcon: (category: string) => JSX.Element;
}

const ExpenseSummaryCards = memo(({ 
  totalExpense, 
  averageExpense, 
  highestExpense, 
  selectedYear, 
  selectedMonth,
  getCategoryIcon
}: ExpenseSummaryCardsProps) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6">
      {/* Total Expenses Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-farm-100 p-3 rounded-lg group-hover:bg-farm-200 transition-colors">
              <Wallet className="h-6 w-6 text-farm-600" />
            </div>
            <h3 className="ml-4 text-sm font-medium text-gray-500">Total Expenses</h3>
          </div>
          <ArrowUpRight className="h-4 w-4 text-farm-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpense)}</p>
          <div className="mt-1 text-xs text-gray-500">
            {selectedMonth === -1 
              ? `For ${selectedYear}` 
              : `For ${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })} ${selectedYear}`}
          </div>
        </div>
      </div>
      
      {/* Average Expense Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="ml-4 text-sm font-medium text-gray-500">Average Expense</h3>
          </div>
          <ArrowUpRight className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(averageExpense)}
          </p>
          <div className="mt-1 text-xs text-gray-500">Per transaction</div>
        </div>
      </div>
      
      {/* Highest Expense Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-amber-100 p-3 rounded-lg group-hover:bg-amber-200 transition-colors">
              <Receipt className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="ml-4 text-sm font-medium text-gray-500">Highest Expense</h3>
          </div>
          <ArrowUpRight className="h-4 w-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(highestExpense.amount)}</p>
          <div className="mt-1 flex items-center text-xs">
            <span className="text-gray-500">Category:</span>
            <div className="ml-2 flex items-center text-amber-700 font-medium">
              {getCategoryIcon(highestExpense.category)}
              <span className="ml-1">{highestExpense.category}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ExpenseSummaryCards.displayName = 'ExpenseSummaryCards';

export default ExpenseSummaryCards;
