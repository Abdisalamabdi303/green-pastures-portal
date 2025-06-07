import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { User, Expense } from '../types';
import { Calendar } from 'lucide-react';
import OptimizedExpenseTable from '../components/expenses/OptimizedExpenseTable';
import AddExpenseForm from '../components/expenses/AddExpenseForm';
import ExpenseAnalytics from '../components/expenses/ExpenseAnalytics';
import { getCategoryIcon } from '../utils/expenseIcons';
import { expenseServices } from '../services/firebase';
import { useExpenseFilters } from '@/hooks/useExpenseFilters';
import ExpenseFilterBar from '@/components/expenses/ExpenseFilterBar';
import { toast } from 'sonner';
import { isSameDay, isSameMonth, startOfMonth, endOfMonth, format } from 'date-fns';

const ITEMS_PER_PAGE = 20;

const ExpensesPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  
  // Fetch expenses with pagination
  const fetchExpenses = async (page = 1) => {
    try {
      setLoading(true);
      
      // Create date range for the month if a date is selected
      const dateRange = selectedDate ? {
        start: startOfMonth(selectedDate),
        end: endOfMonth(selectedDate)
      } : undefined;

      // Fetch expenses with pagination and date range
      const result = await expenseServices.getExpenses({
        page,
        limit: ITEMS_PER_PAGE,
        dateRange
      });

      // Update state with fetched data
      setAllExpenses(result.expenses);
      setTotalPages(result.totalPages);
      setCurrentPage(page);
      setHasMore(page < result.totalPages);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  // Memoize daily expenses first
  const dailyExpenses = useMemo(() => {
    if (!selectedDate) return allExpenses;
    return allExpenses.filter(expense => {
      const expenseDate = expense.date instanceof Date 
        ? expense.date 
        : expense.date?.toDate?.() || new Date(expense.date);
      return isSameDay(expenseDate, selectedDate);
    });
  }, [allExpenses, selectedDate]);

  // Memoize monthly expenses
  const monthlyExpenses = useMemo(() => {
    if (!selectedDate) return allExpenses;
    return allExpenses.filter(expense => {
      const expenseDate = expense.date instanceof Date 
        ? expense.date 
        : expense.date?.toDate?.() || new Date(expense.date);
      return isSameMonth(expenseDate, selectedDate);
    });
  }, [allExpenses, selectedDate]);

  // Memoize filtered expenses
  const filteredExpenses = useMemo(() => {
    if (!searchTerm) {
      return selectedDate ? dailyExpenses : allExpenses;
    }

    const searchLower = searchTerm.toLowerCase();
    const expensesToFilter = selectedDate ? dailyExpenses : allExpenses;
    
    return expensesToFilter.filter(expense => 
      expense.description.toLowerCase().includes(searchLower) ||
      expense.category.toLowerCase().includes(searchLower) ||
      expense.amount.toString().includes(searchTerm)
    );
  }, [searchTerm, selectedDate, dailyExpenses, allExpenses]);

  // Memoize monthly data for charts
  const monthlyData = useMemo(() => {
    const data = new Map<string, number>();
    
    monthlyExpenses.forEach(expense => {
      const date = expense.date instanceof Date 
        ? expense.date 
        : expense.date?.toDate?.() || new Date(expense.date);
      const dateKey = format(date, 'yyyy-MM-dd');
      data.set(dateKey, (data.get(dateKey) || 0) + expense.amount);
    });

    return Array.from(data.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [monthlyExpenses]);

  // Memoize category data
  const categoryData = useMemo(() => {
    const data = new Map<string, number>();
    
    monthlyExpenses.forEach(expense => {
      data.set(expense.category, (data.get(expense.category) || 0) + expense.amount);
    });

    return Array.from(data.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthlyExpenses]);

  // Memoize category data for charts
  const chartCategoryData = useMemo(() => {
    return categoryData.map(category => ({
      name: category.name,
      value: category.value,
      amount: category.value
    }));
  }, [categoryData]);

  // Memoize total expense
  const totalExpense = useMemo(() => {
    return monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [monthlyExpenses]);

  // Memoize average expense
  const averageExpense = useMemo(() => {
    if (monthlyExpenses.length === 0) return 0;
    return totalExpense / monthlyExpenses.length;
  }, [totalExpense, monthlyExpenses.length]);

  // Memoize highest expense
  const highestExpense = useMemo(() => {
    if (monthlyExpenses.length === 0) return { category: 'N/A', amount: 0 };
    return monthlyExpenses.reduce((max, expense) => 
      expense.amount > max.amount ? expense : max, 
      monthlyExpenses[0]
    );
  }, [monthlyExpenses]);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    // Set initial date to today
    setSelectedDate(new Date());
    fetchExpenses(1);
  }, [navigate]);

  // Effect to fetch expenses when selected date changes
  useEffect(() => {
    fetchExpenses(1);
  }, [selectedDate]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchExpenses(nextPage);
  };

  const handleAddExpense = async (data) => {
    try {
      const addedExpense = await expenseServices.addExpense(data);
      setAllExpenses(prev => [addedExpense, ...prev]);
      setIsAddExpenseOpen(false);
      toast.success('Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
      throw error;
    }
  };

  const handleDeleteExpense = async (id: string, description: string): Promise<boolean> => {
    if (window.confirm(`Are you sure you want to delete the expense "${description}"?`)) {
      try {
        await expenseServices.deleteExpense(id);
        setAllExpenses(prev => prev.filter(expense => expense.id !== id));
        toast.success(`Expense "${description}" deleted successfully`);
        return true;
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error('Failed to delete expense');
        return false;
      }
    }
    return false;
  };

  // Create a wrapper function for category icons
  const getCategoryIconElement = (category: string): JSX.Element => {
    const iconElement = getCategoryIcon(category);
    if (React.isValidElement(iconElement)) {
      return iconElement;
    }
    return <span className="h-4 w-4 text-farm-600">💲</span>;
  };

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Expense filter bar */}
          <ExpenseFilterBar 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            setIsAddExpenseOpen={setIsAddExpenseOpen}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          
          {/* Expense Analytics */}
          <ExpenseAnalytics 
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            expenses={monthlyExpenses}
            totalExpense={totalExpense}
            averageExpense={averageExpense}
            highestExpense={highestExpense}
            monthlyData={monthlyData}
            categoryData={chartCategoryData}
            getCategoryIcon={getCategoryIconElement}
            selectedDate={selectedDate}
          />
          
          {/* Expenses Table */}
          <div className="bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden sm:rounded-lg border border-gray-200 mt-8">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-farm-600" />
                {selectedDate ? `Expense Transactions for ${format(selectedDate, 'MMMM d, yyyy')}` : 'Expense Transactions'}
              </h2>
            </div>
            <OptimizedExpenseTable 
              expenses={filteredExpenses}
              deleteExpense={handleDeleteExpense}
              isFiltered={searchTerm.length > 0 || selectedDate !== null}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              loading={loading}
            />
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      <AddExpenseForm 
        handleAddExpense={handleAddExpense}
        isAddExpenseOpen={isAddExpenseOpen}
        setIsAddExpenseOpen={setIsAddExpenseOpen}
        defaultDate={selectedDate}
      />
    </div>
  );
};

export default ExpensesPage;
