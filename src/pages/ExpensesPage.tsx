import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Expense } from '../types/index';
import Navbar from '../components/layout/Navbar';
import ExpenseFilterBar from '../components/expenses/ExpenseFilterBar';
import ExpenseAnalytics from '../components/expenses/ExpenseAnalytics';
import OptimizedExpenseTable from '../components/expenses/OptimizedExpenseTable';
import AddExpenseForm from '../components/expenses/AddExpenseForm';
import { Calendar } from 'lucide-react';
import { getCategoryIcon } from '../utils/expenseIcons';
import { expenseServices } from '../services/firebase';
import { useExpenseFilters } from '@/hooks/useExpenseFilters';
import { toast } from 'sonner';
import { isSameDay, isSameMonth, startOfMonth, endOfMonth, format } from 'date-fns';

const ITEMS_PER_PAGE = 20;

const ExpensesPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }, [navigate, currentUser, authLoading]);

  // Fetch expenses with pagination
  const fetchExpenses = async (page = 1) => {
    try {
      setLoading(true);
      console.log('Fetching expenses with page:', page);
      
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

      console.log('Fetched expenses:', result);

      // Update state with fetched data
      setExpenses(prev => page === 1 ? result.expenses : [...prev, ...result.expenses]);
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
    if (!selectedDate) return expenses;
    return expenses.filter(expense => {
      const expenseDate = expense.date instanceof Date 
        ? expense.date 
        : expense.date?.toDate?.() || new Date(expense.date);
      return isSameDay(expenseDate, selectedDate);
    });
  }, [expenses, selectedDate]);

  // Memoize monthly expenses
  const monthlyExpenses = useMemo(() => {
    if (!selectedDate) return expenses;
    return expenses.filter(expense => {
      const expenseDate = expense.date instanceof Date 
        ? expense.date 
        : expense.date?.toDate?.() || new Date(expense.date);
      return isSameMonth(expenseDate, selectedDate);
    });
  }, [expenses, selectedDate]);

  // Memoize filtered expenses
  const filteredExpenses = useMemo(() => {
    if (!searchTerm) {
      return selectedDate ? dailyExpenses : expenses;
    }

    const searchLower = searchTerm.toLowerCase();
    const expensesToFilter = selectedDate ? dailyExpenses : expenses;
    
    return expensesToFilter.filter(expense => 
      expense.description.toLowerCase().includes(searchLower) ||
      expense.category.toLowerCase().includes(searchLower) ||
      expense.amount.toString().includes(searchTerm)
    );
  }, [searchTerm, selectedDate, dailyExpenses, expenses]);

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

  // Initial fetch and fetch on date change
  useEffect(() => {
    if (currentUser) {
      console.log('Fetching initial expenses');
      fetchExpenses(1);
    }
  }, [currentUser, selectedDate]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchExpenses(nextPage);
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      const addedExpense = await expenseServices.addExpense(expense);
      setExpenses(prev => [addedExpense, ...prev]);
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
        setExpenses(prev => prev.filter(expense => expense.id !== id));
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Expense Management</h1>
        
        <ExpenseFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setIsAddExpenseOpen={setIsAddExpenseOpen}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

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

        <OptimizedExpenseTable
          expenses={filteredExpenses}
          deleteExpense={handleDeleteExpense}
          isFiltered={searchTerm.length > 0 || selectedDate !== null}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loading={loading}
        />

        <AddExpenseForm
          isAddExpenseOpen={isAddExpenseOpen}
          setIsAddExpenseOpen={setIsAddExpenseOpen}
          handleAddExpense={handleAddExpense}
        />
      </div>
    </div>
  );
};

export default ExpensesPage;
