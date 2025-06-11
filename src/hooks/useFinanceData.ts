import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, where, getDocs, Timestamp, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Income, Expense } from '@/types';
import { toast } from 'sonner';
import { startOfMonth, endOfMonth, startOfDay, endOfDay, isSameDay, isSameMonth } from 'date-fns';

interface FinanceData {
  income: Income[];
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

interface FinanceStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  dailyIncome: number;
  dailyExpenses: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  highestSale: Income | null;
  recentSales: Income[];
}

export const useFinanceData = (selectedDate?: Date) => {
  const [data, setData] = useState<FinanceData>({
    income: [],
    expenses: [],
    loading: true,
    error: null
  });

  // Helper function to safely convert dates
  const convertToDate = (dateValue: Date | { toDate: () => Date } | string): Date => {
    if (dateValue instanceof Date) {
      return dateValue;
    }
    if (typeof dateValue === 'object' && dateValue !== null && 'toDate' in dateValue) {
      return dateValue.toDate();
    }
    if (typeof dateValue === 'string') {
      return new Date(dateValue);
    }
    // Fallback to current date if type is unexpected
    return new Date();
  };

  // Fetch income data
  const fetchIncome = useCallback(async () => {
    try {
      const incomeQuery = query(
        collection(db, 'income'),
        orderBy('date', 'desc')
      );
      const incomeSnapshot = await getDocs(incomeQuery);
      const incomeData = incomeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.() || new Date(doc.data().date),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      })) as Income[];

      return incomeData;
    } catch (error) {
      console.error('Error fetching income:', error);
      throw new Error('Failed to fetch income data');
    }
  }, []);

  // Fetch expense data
  const fetchExpenses = useCallback(async () => {
    try {
      const expenseQuery = query(
        collection(db, 'expenses'),
        orderBy('date', 'desc')
      );
      const expenseSnapshot = await getDocs(expenseQuery);
      const expenseData = expenseSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.() || new Date(doc.data().date)
      })) as Expense[];

      return expenseData;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw new Error('Failed to fetch expense data');
    }
  }, []);

  // Fetch all financial data
  const fetchFinanceData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const [income, expenses] = await Promise.all([
        fetchIncome(),
        fetchExpenses()
      ]);

      setData({
        income,
        expenses,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching finance data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
      toast.error('Failed to fetch financial data');
    }
  }, [fetchIncome, fetchExpenses]);

  // Handle animal sale
  const handleAnimalSale = useCallback(async (selectedIds: string[], totalPrice: number, paymentMethod: string = 'Cash') => {
    try {
      const individualPrice = totalPrice / selectedIds.length;
      const batchId = `sale-${Date.now()}`;
      const saleDate = Timestamp.now();

      // Process each animal
      for (const id of selectedIds) {
        // Create income record
        const incomeData = {
          type: 'Animal Sale',
          amount: individualPrice,
          date: saleDate,
          description: `Sale of animal ${id}`,
          paymentMethod,
          animalRelated: true,
          animalId: id,
          createdAt: saleDate,
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
          soldDate: saleDate,
          incomeId: incomeRef.id
        });
      }

      toast.success(`Successfully sold ${selectedIds.length} animal${selectedIds.length > 1 ? 's' : ''}`);
      await fetchFinanceData(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error selling animals:', error);
      toast.error('Failed to sell animals');
      return false;
    }
  }, [fetchFinanceData]);

  // Delete income record
  const deleteIncomeRecord = useCallback(async (incomeId: string) => {
    try {
      await deleteDoc(doc(db, 'income', incomeId));
      
      // Update local state
      setData(prev => ({
        ...prev,
        income: prev.income.filter(item => item.id !== incomeId)
      }));

      toast.success('Income record deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting income:', error);
      toast.error('Failed to delete income record');
      return false;
    }
  }, []);

  // Add manual income record
  const addIncomeRecord = useCallback(async (incomeData: Omit<Income, 'id' | 'createdAt'>) => {
    try {
      const newIncome = {
        ...incomeData,
        createdAt: Timestamp.now(),
        date: incomeData.date instanceof Date ? Timestamp.fromDate(incomeData.date) : incomeData.date
      };

      const docRef = await addDoc(collection(db, 'income'), newIncome);
      
      toast.success('Income record added successfully');
      await fetchFinanceData(); // Refresh data
      return docRef.id;
    } catch (error) {
      console.error('Error adding income:', error);
      toast.error('Failed to add income record');
      return null;
    }
  }, [fetchFinanceData]);

  // Calculate financial statistics
  const statistics = useMemo((): FinanceStats => {
    const now = selectedDate || new Date();
    
    // Filter data by selected date
    const dailyIncome = data.income.filter(item => {
      const itemDate = convertToDate(item.date);
      return isSameDay(itemDate, now);
    });

    const monthlyIncome = data.income.filter(item => {
      const itemDate = convertToDate(item.date);
      return isSameMonth(itemDate, now);
    });

    const dailyExpenses = data.expenses.filter(expense => {
      const expenseDate = convertToDate(expense.date);
      return isSameDay(expenseDate, now);
    });

    const monthlyExpenses = data.expenses.filter(expense => {
      const expenseDate = convertToDate(expense.date);
      return isSameMonth(expenseDate, now);
    });

    // Calculate totals
    const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
    const dailyIncomeTotal = dailyIncome.reduce((sum, item) => sum + item.amount, 0);
    const dailyExpensesTotal = dailyExpenses.reduce((sum, item) => sum + item.amount, 0);
    const monthlyIncomeTotal = monthlyIncome.reduce((sum, item) => sum + item.amount, 0);
    const monthlyExpensesTotal = monthlyExpenses.reduce((sum, item) => sum + item.amount, 0);

    // Find highest sale
    const highestSale = data.income.reduce((max, sale) => 
      sale.amount > (max?.amount || 0) ? sale : max, 
      null as Income | null
    );

    // Get recent sales (last 10)
    const recentSales = [...data.income]
      .sort((a, b) => {
        const dateA = convertToDate(a.date);
        const dateB = convertToDate(b.date);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);

    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      dailyIncome: dailyIncomeTotal,
      dailyExpenses: dailyExpensesTotal,
      monthlyIncome: monthlyIncomeTotal,
      monthlyExpenses: monthlyExpensesTotal,
      highestSale,
      recentSales
    };
  }, [data.income, data.expenses, selectedDate, convertToDate]);

  // Initial data fetch
  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  return {
    ...data,
    statistics,
    refetch: fetchFinanceData,
    handleAnimalSale,
    deleteIncomeRecord,
    addIncomeRecord
  };
}; 