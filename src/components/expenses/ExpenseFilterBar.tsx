
import { Search } from 'lucide-react';
import { useState } from 'react';

interface ExpenseFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setIsAddExpenseOpen: (isOpen: boolean) => void;
}

const ExpenseFilterBar = ({ searchTerm, setSearchTerm, setIsAddExpenseOpen }: ExpenseFilterBarProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
      <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
        <span className="h-6 w-6 mr-2 text-farm-600">💰</span>
        Expenses Management
      </h1>
      <div className="flex space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search expenses..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-farm-500 focus:border-farm-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        <button 
          className="bg-farm-600 text-white px-4 py-2 rounded-md hover:bg-farm-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500 flex items-center"
          onClick={() => setIsAddExpenseOpen(true)}
        >
          <span className="h-4 w-4 mr-2">➕</span>
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default ExpenseFilterBar;
