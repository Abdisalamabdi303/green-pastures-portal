import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { User, Income } from '../types';
import { Calendar, Plus, TrendingUp, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { isSameDay, isSameMonth, startOfMonth, endOfMonth, format, startOfDay, endOfDay } from 'date-fns';
import { collection, query, where, getDocs, Timestamp, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SellAnimalDialog } from '@/components/finance/SellAnimalDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ITEMS_PER_PAGE = 20;

const FinancePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Animal Sales Income
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button
              onClick={() => setIsSellDialogOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Sell Animals
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {/* Highest Sale Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Highest Sale</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.highestSale.amount.toFixed(2)}</div>
              {stats.highestSale.amount > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {stats.highestSale.description}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Daily Sales Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <CalendarIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.dailyTotal.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {dailyData.income.length} sales today
              </p>
            </CardContent>
          </Card>

          {/* Monthly Sales Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyTotal.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {monthlyData.income.length} sales this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Animal Sales
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : monthlyData.income.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No sales found for this period</div>
            ) : (
              <div className="divide-y divide-gray-200">
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
                      <div key={sale.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-green-100">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {sale.description}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(date, 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          +${sale.amount.toFixed(2)}
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
    </div>
  );
};

export default FinancePage; 