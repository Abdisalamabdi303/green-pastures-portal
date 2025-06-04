import React, { memo, useMemo } from 'react';
import { Expense } from '@/types';

interface ExpenseFiltersProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  expenses: Expense[];
}

const months = [
  'All Months',
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const ExpenseFilters = memo(({
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  expenses
}: ExpenseFiltersProps) => {
  // Memoize the years calculation
  const years = useMemo(() => {
    const uniqueYears = Array.from(
      new Set(
        expenses
          .map(expense => {
            if (expense.date) {
              if (typeof expense.date === 'object' && 'toDate' in expense.date && typeof expense.date.toDate === 'function') {
                return expense.date.toDate().getFullYear();
              } else if (typeof expense.date === 'string') {
                return new Date(expense.date).getFullYear();
              }
            }
            return null;
          })
          .filter((year): year is number => year !== null)
      )
    ).sort((a, b) => b - a); // Sort years in descending order

    // Add current year if not in the list
    const currentYear = new Date().getFullYear();
    if (!uniqueYears.includes(currentYear)) {
      uniqueYears.unshift(currentYear);
    }

    return uniqueYears;
  }, [expenses]);

  return (
    <div className="flex gap-4 items-center">
      <div className="flex items-center gap-2">
        <label htmlFor="year" className="text-sm font-medium text-gray-700">
          Year:
        </label>
        <select
          id="year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="month" className="text-sm font-medium text-gray-700">
          Month:
        </label>
        <select
          id="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
        >
          {months.map((month, index) => (
            <option key={month} value={index - 1}>
              {month}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

ExpenseFilters.displayName = 'ExpenseFilters';
