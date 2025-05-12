
import { Wheat, ArrowUpDown, DollarSign } from 'lucide-react';
import { ChartData } from '@/types';

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

const ExpenseSummaryCards = ({ 
  totalExpense, 
  averageExpense, 
  highestExpense, 
  selectedYear, 
  selectedMonth,
  getCategoryIcon
}: ExpenseSummaryCardsProps) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <DollarSign className="h-5 w-5 text-farm-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalExpense.toLocaleString()}</p>
        <div className="mt-1 text-xs text-gray-500">
          {selectedMonth === -1 
            ? `For ${selectedYear}` 
            : `For ${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })} ${selectedYear}`}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Average Expense</h3>
          <ArrowUpDown className="h-5 w-5 text-blue-500" />
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-1">₹{averageExpense.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        <div className="mt-1 text-xs text-gray-500">Per transaction</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Highest Category</h3>
          <div>
            {highestExpense.category ? getCategoryIcon(highestExpense.category) : <Wheat className="h-5 w-5 text-gray-400" />}
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-1">{highestExpense.category || 'N/A'}</p>
        <div className="mt-1 text-xs text-gray-500">
          {highestExpense.amount > 0 ? `₹${highestExpense.amount.toLocaleString()}` : 'No data'}
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummaryCards;
