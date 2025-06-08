import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { User, Income } from '../types';
import { Calendar, Plus, TrendingUp, DollarSign, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { isSameDay, isSameMonth, startOfMonth, endOfMonth, format, startOfDay, endOfDay } from 'date-fns';
import { collection, query, where, getDocs, Timestamp, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SellAnimalDialog } from '@/components/finance/SellAnimalDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const ITEMS_PER_PAGE = 20;

const FinancePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);

  // Fetch income from animal sales
  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      
      // Create date range for the month if a date is selected
      const dateRange = selectedDate ? {
        start: startOfMonth(selectedDate),
        end: endOfMonth(selectedDate)
      } : undefined;

      // Fetch income from animal sales - only filter by type first
      const incomeQuery = query(
        collection(db, 'income'),
        where('type', '==', 'Animal Sale')
      );
      const incomeSnapshot = await getDocs(incomeQuery);
      const incomeData = incomeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Income[];

      // Filter by date range in memory
      const filteredIncome = incomeData.filter(income => {
        const incomeDate = income.date instanceof Date 
          ? income.date 
          : income.date?.toDate?.() || new Date(income.date);
        return dateRange 
          ? incomeDate >= dateRange.start && incomeDate <= dateRange.end
          : true;
      });

      setIncome(filteredIncome);

    } catch (error) {
      console.error('Error fetching income data:', error);
      toast.error('Failed to fetch income data');
    } finally {
      setLoading(false);
    }
  };

  // Handle animal sale
  const handleAnimalSale = async (selectedIds: string[], totalPrice: number) => {
    try {
      const individualPrice = totalPrice / selectedIds.length;
      const batchId = `sale-${Date.now()}`;

      // Process each animal
      for (const id of selectedIds) {
        // Create income record
        const incomeData = {
          type: 'Animal Sale',
          amount: individualPrice,
          date: Timestamp.now(),
          description: `Sale of animal ${id}`,
          paymentMethod: 'Cash',
          animalRelated: true,
          animalId: id,
          createdAt: Timestamp.now(),
          status: 'completed',
          batchId,
          totalBatchAmount: totalPrice,
          animalsInBatch: selectedIds.length
        };

        // Create income record
        const incomeRef = await addDoc(collection(db, 'income'), incomeData);

        // Update animal status
        const animalRef = doc(db, 'animals', id);
        await updateDoc(animalRef, {
          status: 'sold',
          sellingPrice: individualPrice,
          soldDate: Timestamp.now(),
          incomeId: incomeRef.id
        });
      }

      toast.success('Animals sold successfully');
      setIsSellDialogOpen(false);
      fetchIncomeData(); // Refresh the income data
    } catch (error) {
      console.error('Error selling animals:', error);
      toast.error('Failed to sell animals');
    }
  };

  // Memoize daily data
  const dailyData = useMemo(() => {
    if (!selectedDate) return { income: [] };
    
    return {
      income: income.filter(income => {
        const incomeDate = income.date instanceof Date 
          ? income.date 
          : income.date?.toDate?.() || new Date(income.date);
        return isSameDay(incomeDate, selectedDate);
      })
    };
  }, [income, selectedDate]);

  // Memoize monthly data
  const monthlyData = useMemo(() => {
    if (!selectedDate) return { income: [] };
    
    return {
      income: income.filter(income => {
        const incomeDate = income.date instanceof Date 
          ? income.date 
          : income.date?.toDate?.() || new Date(income.date);
        return isSameMonth(incomeDate, selectedDate);
      })
    };
  }, [income, selectedDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    // Highest sale
    const highestSale = income.reduce((max, sale) => 
      sale.amount > max.amount ? sale : max, 
      { amount: 0 } as Income
    );

    // Daily total
    const dailyTotal = dailyData.income.reduce((sum, sale) => sum + sale.amount, 0);

    // Monthly total
    const monthlyTotal = monthlyData.income.reduce((sum, sale) => sum + sale.amount, 0);

    return {
      highestSale,
      dailyTotal,
      monthlyTotal
    };
  }, [income, dailyData, monthlyData]);

  const handleDeleteIncome = async (income: Income) => {
    setIncomeToDelete(income);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!incomeToDelete) return;

    try {
      // Delete from Firestore
      const incomeRef = doc(db, 'income', incomeToDelete.id);
      await deleteDoc(incomeRef);

      // Update local state
      setIncome(prev => prev.filter(i => i.id !== incomeToDelete.id));
      
      toast.success('Income record deleted successfully');
    } catch (error) {
      console.error('Error deleting income:', error);
      toast.error('Failed to delete income record');
    } finally {
      setIsDeleteDialogOpen(false);
      setIncomeToDelete(null);
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
    // Set initial date to today
    setSelectedDate(new Date());
    fetchIncomeData();
  }, [navigate]);

  // Effect to fetch data when selected date changes
  useEffect(() => {
    fetchIncomeData();
  }, [selectedDate]);

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-[#2c3e2d] sm:text-3xl sm:truncate">
              Animal Sales Income
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button
              onClick={() => setIsSellDialogOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#579445] hover:bg-[#5c8650] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a6741]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Sell Animals
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {/* Highest Sale Card */}
          <Card className="bg-white border-[#e8e8e0]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2c3e2d]">Highest Sale</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#4a6741]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c3e2d]">${stats.highestSale.amount.toFixed(2)}</div>
              {stats.highestSale.amount > 0 && (
                <p className="text-xs text-[#4a6741] mt-1">
                  {stats.highestSale.description}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Daily Sales Card */}
          <Card className="bg-white border-[#e8e8e0]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2c3e2d]">Today's Sales</CardTitle>
              <CalendarIcon className="h-4 w-4 text-[#4a6741]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c3e2d]">${stats.dailyTotal.toFixed(2)}</div>
              <p className="text-xs text-[#4a6741] mt-1">
                {dailyData.income.length} sales today
              </p>
            </CardContent>
          </Card>

          {/* Monthly Sales Card */}
          <Card className="bg-white border-[#e8e8e0]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2c3e2d]">Monthly Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-[#4a6741]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c3e2d]">${stats.monthlyTotal.toFixed(2)}</div>
              <p className="text-xs text-[#4a6741] mt-1">
                {monthlyData.income.length} sales this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales */}
        <div className="bg-white shadow rounded-lg border border-[#e8e8e0]">
          <div className="px-4 py-5 sm:px-6 border-b border-[#e8e8e0]">
            <h3 className="text-lg leading-6 font-medium text-[#2c3e2d]">
              Recent Animal Sales
            </h3>
          </div>
          <div className="border-t border-[#e8e8e0]">
            {loading ? (
              <div className="p-4 text-center text-[#4a6741]">Loading...</div>
            ) : monthlyData.income.length === 0 ? (
              <div className="p-4 text-center text-[#4a6741]">No sales found for this period</div>
            ) : (
              <div className="divide-y divide-[#e8e8e0]">
                {monthlyData.income
                  .sort((a, b) => {
                    const dateA = a.date instanceof Date ? a.date : a.date?.toDate?.() || new Date(a.date);
                    const dateB = b.date instanceof Date ? b.date : b.date?.toDate?.() || new Date(b.date);
                    return dateB.getTime() - dateA.getTime();
                  })
                  .map((sale) => {
                    const date = sale.date instanceof Date 
                      ? sale.date 
                      : sale.date?.toDate?.() || new Date(sale.date);
                    
                    return (
                      <div key={sale.id} className="px-4 py-4 sm:px-6 hover:bg-[#f5f5f0] transition-colors duration-150">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#2c3e2d] truncate">
                              {sale.description}
                            </p>
                            <p className="text-sm text-[#4a6741]">
                              {format(date, 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-[#18d651]">
                              ${sale.amount.toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteIncome(sale)}
                              className="text-[#4a6741] hover:text-[#2c3e2d] hover:bg-[#f5f5f0]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </main>

      <SellAnimalDialog
        isOpen={isSellDialogOpen}
        onClose={() => setIsSellDialogOpen(false)}
        onConfirm={handleAnimalSale}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border-[#e8e8e0]">
          <DialogHeader>
            <DialogTitle className="text-[#2c3e2d]">Delete Income Record</DialogTitle>
            <DialogDescription className="text-[#4a6741]">
              Are you sure you want to delete this income record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-[#e8e8e0] text-[#4a6741] hover:bg-[#f5f5f0]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-[#4a6741] hover:bg-[#3d5636]"
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