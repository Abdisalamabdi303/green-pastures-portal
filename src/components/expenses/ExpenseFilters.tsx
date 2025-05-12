
import { useState } from 'react';
import { Filter } from 'lucide-react';

interface ExpenseFiltersProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  expenses: any[];
}

const ExpenseFilters = ({ selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, expenses }: ExpenseFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4 flex flex-wrap gap-4 items-center border border-gray-100">
      <div className="flex items-center">
        <Filter className="h-4 w-4 mr-2 text-farm-600" />
        <span className="text-sm font-medium text-gray-700">Filters:</span>
      </div>
      
      <div>
        <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-1">
          Year
        </label>
        <select
          id="year-select"
          className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-farm-500 focus:border-farm-500 bg-white"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {Array.from(new Set(expenses.map(expense => new Date(expense.date).getFullYear())))
            .sort((a, b) => b - a)
            .map(year => (
              <option key={year} value={year}>{year}</option>
            ))
          }
        </select>
      </div>
      
      <div>
        <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">
          Month
        </label>
        <select
          id="month-select"
          className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-farm-500 focus:border-farm-500 bg-white"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        >
          <option value={-1}>All Months</option>
          {Array.from({ length: 12 }, (_, i) => i).map(month => (
            <option key={month} value={month}>
              {new Date(2000, month, 1).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ExpenseFilters;
