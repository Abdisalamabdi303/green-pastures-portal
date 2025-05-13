
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Expense, User, ChartData } from '../types';
import { Search, PlusCircle, Calendar, DollarSign } from 'lucide-react';
import ExpenseTable from '../components/expenses/ExpenseTable';
import AddExpenseForm from '../components/expenses/AddExpenseForm';
import ExpenseAnalytics from '../components/expenses/ExpenseAnalytics';
import { getCategoryIcon } from '../utils/expenseIcons';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp, query, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';

const ExpensesPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  
  // For visualizations and analytics
  const [categoryData, setCategoryData] = useState<ChartData[]>([]);
  const [monthlyData, setMonthlyData] = useState<{date: string; amount: number}[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [averageExpense, setAverageExpense] = useState<number>(0);
  const [highestExpense, setHighestExpense] = useState<{category: string; amount: number}>({category: '', amount: 0});
  
  const navigate = useNavigate();

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

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedExpenses: Expense[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedExpenses.push({
          id: doc.id,
          category: data.category,
          amount: data.amount,
          date: data.date instanceof Timestamp ? 
            data.date.toDate().toISOString().split('T')[0] : 
            new Date(data.date).toISOString().split('T')[0],
          description: data.description
        });
      });
      
      setExpenses(fetchedExpenses);
      toast.success('Expenses loaded successfully');
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (expenses.length > 0) {
      // Process data for visualizations
      processExpenseData();
    }
  }, [expenses, selectedYear, selectedMonth]);

  const processExpenseData = () => {
    // Filter expenses for the selected year and month
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === selectedYear && 
             (selectedMonth === -1 || expenseDate.getMonth() === selectedMonth);
    });
    
    // Calculate total expense
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalExpense(total);
    
    // Calculate average expense
    setAverageExpense(filteredExpenses.length > 0 ? total / filteredExpenses.length : 0);
    
    // Get expense by category
    const categoryMap: Record<string, number> = {};
    filteredExpenses.forEach(expense => {
      categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.amount;
    });
    
    // Convert to array for charts
    const categoryChartData = Object.keys(categoryMap).map(category => ({
      name: category,
      amount: categoryMap[category]
    }));
    
    setCategoryData(categoryChartData);
    
    // Find highest expense category
    if (categoryChartData.length > 0) {
      const highest = categoryChartData.reduce((prev, current) => 
        prev.amount > current.amount ? prev : current
      );
      
      setHighestExpense({
        category: highest.name,
        amount: highest.amount
      });
    }
    
    // Get monthly data
    const monthlyMap: Record<string, number> = {};
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyMap[monthYear] = (monthlyMap[monthYear] || 0) + expense.amount;
    });
    
    // Convert to array for charts and sort by date
    const monthlyChartData = Object.keys(monthlyMap)
      .map(date => ({
        date,
        amount: monthlyMap[date]
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    setMonthlyData(monthlyChartData);
  };

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
    
    try {
      // Create new expense object
      const newExpense = {
        ...formData,
        date: new Date(formData.date)
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'expenses'), newExpense);
      
      // Add to local state with Firestore ID
      const expenseWithId: Expense = {
        id: docRef.id,
        ...formData
      };
      
      setExpenses([expenseWithId, ...expenses]);
      toast.success('Expense added successfully');
      
      // Reset form
      setFormData({
        category: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      setIsAddExpenseOpen(false);
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'expenses', id));
      
      // Update local state
      setExpenses(expenses.filter(expense => expense.id !== id));
      toast.success('Expense deleted successfully');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // Since we know the getCategoryIcon from utils/expenseIcons.tsx returns ReactNode but
  // our component expects ReactElement, we'll create a wrapper function that ensures
  // we return a ReactElement
  const getCategoryIconElement = (category: string): JSX.Element => {
    const iconElement = getCategoryIcon(category);
    // If it's already a ReactElement, return it, otherwise return a default icon
    if (React.isValidElement(iconElement)) {
      return iconElement;
    }
    // Default icon if it's not a valid element (like if it returns a string)
    return <DollarSign className="h-4 w-4 text-farm-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-farm-600" />
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
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Expense
              </button>
            </div>
          </div>
          
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
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-farm-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading expenses...</p>
              </div>
            ) : (
              <ExpenseTable 
                expenses={expenses}
                getCategoryIcon={getCategoryIconElement}
                handleDeleteExpense={handleDeleteExpense}
                searchTerm={searchTerm}
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
