
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { User } from '../types';
import { Calendar } from 'lucide-react';
import ExpenseTable from '../components/expenses/ExpenseTable';
import AddExpenseForm from '../components/expenses/AddExpenseForm';
import ExpenseAnalytics from '../components/expenses/ExpenseAnalytics';
import { getCategoryIcon } from '../utils/expenseIcons';
import { useExpenses } from '@/hooks/useExpenses';
import { useExpenseFilters } from '@/hooks/useExpenseFilters';
import ExpenseFilterBar from '@/components/expenses/ExpenseFilterBar';

const ExpensesPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  
  const { expenses, loading, addExpense, deleteExpense } = useExpenses();
  
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

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Convert numeric values
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const expenseData = {
      ...formData,
      date: new Date(formData.date).toISOString(),
      paymentMethod: 'Cash',
      animalRelated: false
    };
    
    await addExpense(expenseData);
    
    // Reset form
    setFormData({
      category: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setIsAddExpenseOpen(false);
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
                deleteExpense={deleteExpense}
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
