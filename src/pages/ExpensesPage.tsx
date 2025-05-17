import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { User } from '../types';
import { Calendar } from 'lucide-react';
import ExpenseTable from '../components/expenses/ExpenseTable';
import AddExpenseForm from '../components/expenses/AddExpenseForm';
import ExpenseAnalytics from '../components/expenses/ExpenseAnalytics';
import { getCategoryIcon } from '../utils/expenseIcons';
import { expenseServices } from '../services/firebase';
import { useExpenseFilters } from '@/hooks/useExpenseFilters';
import ExpenseFilterBar from '@/components/expenses/ExpenseFilterBar';
import { toast } from 'sonner';

const ExpensesPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    searchTerm,
    setSearchTerm,
    categoryData,
    monthlyData,
    totalExpense,
    averageExpense,
    highestExpense
  } = useExpenseFilters(expenses);

  // Fetch expenses from Firestore
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const expensesList = await expenseServices.getExpenses();
      setExpenses(expensesList);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    fetchExpenses();
  }, [navigate]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
      setFormData({
        ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
      });
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
    const expenseData = {
      ...formData,
      paymentMethod: 'Cash',
      animalRelated: false
    };
    
      const addedExpense = await expenseServices.addExpense(expenseData);
      setExpenses(prev => [addedExpense, ...prev]);
    
    // Reset form
    setFormData({
      category: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setIsAddExpenseOpen(false);
      toast.success('Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    }
  };

  const handleDeleteExpense = async (id: string, description: string): Promise<boolean> => {
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
  };

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // Create a wrapper function for category icons
  const getCategoryIconElement = (category: string): JSX.Element => {
    const iconElement = getCategoryIcon(category);
    // If it's already a React element, return it, otherwise return a default icon
    if (React.isValidElement(iconElement)) {
      return iconElement;
    }
    // Default icon if it's not a valid element
    return <span className="h-4 w-4 text-farm-600">💲</span>;
  };

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(expense => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      expense.description.toLowerCase().includes(searchLower) ||
      expense.category.toLowerCase().includes(searchLower) ||
      (expense.animalName && expense.animalName.toLowerCase().includes(searchLower)) ||
      (expense.paymentMethod && expense.paymentMethod.toLowerCase().includes(searchLower))
    );
  });

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
          />
          
          {/* Expense Analytics */}
          <ExpenseAnalytics 
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            expenses={expenses}
            totalExpense={totalExpense}
            averageExpense={averageExpense}
            highestExpense={highestExpense}
            monthlyData={monthlyData}
            categoryData={categoryData}
            getCategoryIcon={getCategoryIconElement}
          />
          
          {/* Expenses Table */}
          <div className="bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden sm:rounded-lg border border-gray-200 mt-8">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-farm-600" />
                Expense Transactions
              </h2>
            </div>
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-farm-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading expenses...</p>
              </div>
            ) : (
              <ExpenseTable 
                expenses={filteredExpenses}
                deleteExpense={handleDeleteExpense}
                isFiltered={searchTerm.length > 0}
              />
            )}
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      <AddExpenseForm 
        handleAddExpense={handleAddExpense}
        formData={formData}
        handleFormChange={handleFormChange}
        isAddExpenseOpen={isAddExpenseOpen}
        setIsAddExpenseOpen={setIsAddExpenseOpen}
      />
    </div>
  );
};

export default ExpensesPage;
