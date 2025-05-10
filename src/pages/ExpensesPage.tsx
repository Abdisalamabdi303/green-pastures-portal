import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { expenseData } from '../data/mockData';
import { Expense, User, ChartData } from '../types';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import { 
  Wheat, 
  Carrot, 
  LeafyGreen, 
  Tractor, 
  Cow, 
  Search, 
  PlusCircle, 
  Calendar, 
  DollarSign, 
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpDown,
  Filter,
  Trash2
} from 'lucide-react';

const ExpensesPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
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
    setExpenses(expenseData);
  }, [navigate]);

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

  const filteredExpenses = expenses.filter(expense => 
    expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new expense object
    const newExpense: Expense = {
      id: `e${expenses.length + 1}`,
      ...formData
    };
    
    // Add to expenses array
    setExpenses([...expenses, newExpense]);
    
    // Reset form
    setFormData({
      category: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setIsAddExpenseOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'feed':
        return <Wheat className="h-4 w-4 text-farm-600" />;
      case 'medicine':
        return <LeafyGreen className="h-4 w-4 text-red-500" />;
      case 'equipment':
        return <Tractor className="h-4 w-4 text-amber-600" />;
      case 'labor':
        return <Cow className="h-4 w-4 text-blue-500" />;
      default:
        return <Carrot className="h-4 w-4 text-green-500" />;
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

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
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-farm-600" />
              Expense Overview
            </h2>
            
            {/* Filter Controls */}
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
            
            {/* Summary Cards */}
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
            
            {/* Charts */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Monthly Trend Chart */}
              <ExpenseChart 
                recentExpenses={monthlyData}
                chartType="line"
                title="Monthly Expense Trend"
                description="Expense pattern over time"
              />
              
              {/* Category Distribution Chart */}
              <ExpenseChart 
                recentExpenses={[]}
                categoryData={categoryData}
                chartType="pie"
                title="Expense by Category"
                description="Distribution across categories"
              />
            </div>
          </div>
          
          {/* Expenses Table */}
          <div className="bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden sm:rounded-lg border border-gray-200 mt-8">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-farm-600" />
                Expense Transactions
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {expense.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            {getCategoryIcon(expense.category)}
                            <span className="ml-2">{expense.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-farm-600">
                          ₹{expense.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-900 flex items-center justify-end"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No expenses found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsAddExpenseOpen(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-farm-100 sm:mx-0 sm:h-10 sm:w-10">
                    <PlusCircle className="h-6 w-6 text-farm-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Add New Expense
                    </h3>
                    
                    <form onSubmit={handleAddExpense} className="mt-4 space-y-4">
                      {/* Category */}
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          Category
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-farm-500 focus:border-farm-500 sm:text-sm rounded-md"
                          required
                        >
                          <option value="" disabled>Select category</option>
                          <option value="Feed">Feed</option>
                          <option value="Medicine">Medicine</option>
                          <option value="Equipment">Equipment</option>
                          <option value="Labor">Labor</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Amount */}
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                          Amount (₹)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">₹</span>
                          </div>
                          <input
                            type="number"
                            name="amount"
                            id="amount"
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={handleFormChange}
                            className="mt-1 focus:ring-farm-500 focus:border-farm-500 block w-full pl-7 shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                      </div>

                      {/* Date */}
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          value={formData.date}
                          onChange={handleFormChange}
                          className="mt-1 focus:ring-farm-500 focus:border-farm-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleFormChange}
                          className="mt-1 focus:ring-farm-500 focus:border-farm-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-farm-600 text-base font-medium text-white hover:bg-farm-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Add Expense
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500 sm:mt-0 sm:w-auto sm:text-sm"
                          onClick={() => setIsAddExpenseOpen(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
