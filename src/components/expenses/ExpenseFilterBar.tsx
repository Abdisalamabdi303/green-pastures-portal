import React from 'react';
import { Search, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface ExpenseFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setIsAddExpenseOpen: (isOpen: boolean) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}

const ExpenseFilterBar: React.FC<ExpenseFilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  setIsAddExpenseOpen,
  selectedDate,
  setSelectedDate
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-farm-500 focus:border-farm-500 sm:text-sm"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex gap-4">
        <input
          type="date"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-farm-500 focus:border-farm-500 sm:text-sm"
          value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
          onChange={(e) => {
            const date = e.target.value ? new Date(e.target.value) : null;
            setSelectedDate(date);
          }}
        />
        
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-farm-600 hover:bg-farm-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default ExpenseFilterBar;
