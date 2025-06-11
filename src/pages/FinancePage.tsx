import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFinanceData } from '@/hooks/useFinanceData';
import Navbar from '../components/layout/Navbar';
import { 
  Calendar, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Trash2, 
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { SellAnimalDialog } from '@/components/finance/SellAnimalDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FinancePage = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'today' | 'month' | 'all'>('month');

  const { 
    income, 
    expenses, 
    loading, 
    error, 
    statistics,
    refetch,
    handleAnimalSale,
    deleteIncomeRecord
  } = useFinanceData(selectedDate);

  // Helper function to safely convert dates
  const safeDate = (date: Date | { toDate(): Date } | string | number): Date => {
    if (date instanceof Date) return date;
    if (date && typeof date === 'object' && 'toDate' in date) return date.toDate();
    if (typeof date === 'string' || typeof date === 'number') return new Date(date);
    return new Date();
  };

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    const now = new Date();
    
    switch (dateFilter) {
      case 'today': {
        return {
          income: income.filter(item => {
            const itemDate = item.date instanceof Date ? item.date : safeDate(item.date);
            return format(itemDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
          }),
          expenses: expenses.filter(expense => {
            const expenseDate = expense.date instanceof Date ? expense.date : safeDate(expense.date);
            return format(expenseDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
          })
        };
      }
      case 'month': {
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        return {
          income: income.filter(item => {
            const itemDate = item.date instanceof Date ? item.date : safeDate(item.date);
            return itemDate >= monthStart && itemDate <= monthEnd;
          }),
          expenses: expenses.filter(expense => {
            const expenseDate = expense.date instanceof Date ? expense.date : safeDate(expense.date);
            return expenseDate >= monthStart && expenseDate <= monthEnd;
          })
        };
      }
      default:
        return { income, expenses };
    }
  }, [income, expenses, dateFilter]);

  const handleSellAnimals = async (selectedIds: string[], totalPrice: number, paymentMethod: string) => {
    const success = await handleAnimalSale(selectedIds, totalPrice, paymentMethod);
    if (success) {
      setIsSellDialogOpen(false);
    }
  };

  const handleDeleteIncome = (incomeId: string) => {
    setIncomeToDelete(incomeId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (incomeToDelete) {
      await deleteIncomeRecord(incomeToDelete);
      setIsDeleteDialogOpen(false);
      setIncomeToDelete(null);
    }
  };

  // Handle auth states
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004225] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const currentStats: {
    income: number;
    expenses: number;
    profit: number;
  } = {
    income: filteredData.income.reduce((sum, item) => sum + item.amount, 0),
    expenses: filteredData.expenses.reduce((sum, item) => sum + item.amount, 0),
    profit: 0
  };
  currentStats.profit = currentStats.income - currentStats.expenses;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-[#2c3e2d] sm:text-3xl sm:truncate">
              Financial Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Track income from animal sales and manage your livestock business finances
            </p>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:mt-0 sm:ml-4">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setIsSellDialogOpen(true)}
              className="bg-[#004225] hover:bg-[#003820] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Sell Animals
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <Tabs value={dateFilter} onValueChange={(value) => setDateFilter(value as typeof dateFilter)}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {/* Total Income */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {dateFilter === 'today' ? "Today's Income" : 
                 dateFilter === 'month' ? "Monthly Income" : "Total Income"}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(currentStats.income)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {filteredData.income.length} transaction{filteredData.income.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {dateFilter === 'today' ? "Today's Expenses" : 
                 dateFilter === 'month' ? "Monthly Expenses" : "Total Expenses"}
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(currentStats.expenses)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {filteredData.expenses.length} transaction{filteredData.expenses.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          {/* Net Profit/Loss */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Net {currentStats.profit >= 0 ? 'Profit' : 'Loss'}
              </CardTitle>
              <DollarSign className={`h-4 w-4 ${currentStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${currentStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(currentStats.profit))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((currentStats.income / (currentStats.expenses || 1)) * 100).toFixed(1)}% profit margin
              </p>
            </CardContent>
          </Card>

          {/* Highest Sale */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Highest Sale</CardTitle>
              <PieChart className="h-4 w-4 text-[#004225]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#004225]">
                {formatCurrency(statistics.highestSale?.amount || 0)}
              </div>
              {statistics.highestSale && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {statistics.highestSale.description}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Income */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Recent Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#004225] mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading...</p>
                </div>
              ) : filteredData.income.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No income records found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredData.income
                    .sort((a, b) => {
                      const dateA = a.date instanceof Date ? a.date : safeDate(a.date);
                      const dateB = b.date instanceof Date ? b.date : safeDate(b.date);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .slice(0, 10)
                    .map((income) => {
                      const date = income.date instanceof Date ? income.date : safeDate(income.date);
                      
                      return (
                        <div key={income.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {income.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">
                                {format(date, 'MMM d, yyyy')}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {income.paymentMethod}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-green-600">
                              {formatCurrency(income.amount)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteIncome(income.id)}
                              className="text-gray-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Recent Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#004225] mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading...</p>
                </div>
              ) : filteredData.expenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No expense records found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredData.expenses
                    .sort((a, b) => {
                      const dateA = a.date instanceof Date ? a.date : safeDate(a.date);
                      const dateB = b.date instanceof Date ? b.date : safeDate(b.date);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .slice(0, 10)
                    .map((expense) => {
                      const date = expense.date instanceof Date ? expense.date : safeDate(expense.date);
                      
                      return (
                        <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {expense.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">
                                {format(date, 'MMM d, yyyy')}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {expense.category}
                              </Badge>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-red-600">
                            {formatCurrency(expense.amount)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </main>

      {/* Sell Animal Dialog */}
      <SellAnimalDialog
        isOpen={isSellDialogOpen}
        onClose={() => setIsSellDialogOpen(false)}
        onConfirm={handleSellAnimals}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Delete Income Record</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this income record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancePage; 