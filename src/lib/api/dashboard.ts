import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Animal, Expense } from '@/types';

export async function getDashboardStats() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get all animals
    const animalsSnapshot = await getDocs(collection(db, 'animals'));
    const animals = animalsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Animal[];

    // Get daily expenses
    const dailyExpensesQuery = query(
      collection(db, 'expenses'),
      where('date', '>=', Timestamp.fromDate(startOfDay))
    );
    const dailyExpensesSnapshot = await getDocs(dailyExpensesQuery);
    const dailyExpenses = dailyExpensesSnapshot.docs.reduce((sum, doc) => {
      const expense = doc.data() as Expense;
      return sum + expense.amount;
    }, 0);

    // Get monthly income from sold animals
    const soldAnimalsQuery = query(
      collection(db, 'animals'),
      where('status', '==', 'sold'),
      where('soldDate', '>=', Timestamp.fromDate(startOfMonth)),
      where('soldDate', '<=', Timestamp.fromDate(endOfMonth))
    );
    const soldAnimalsSnapshot = await getDocs(soldAnimalsQuery);
    const monthlyIncome = soldAnimalsSnapshot.docs.reduce((sum, doc) => {
      const animal = doc.data() as Animal;
      return sum + (animal.sellingPrice || 0);
    }, 0);

    // Get monthly expenses
    const monthlyExpensesQuery = query(
      collection(db, 'expenses'),
      where('date', '>=', Timestamp.fromDate(startOfMonth)),
      where('date', '<=', Timestamp.fromDate(endOfMonth))
    );
    const monthlyExpensesSnapshot = await getDocs(monthlyExpensesQuery);
    const monthlyExpenses = monthlyExpensesSnapshot.docs.reduce((sum, doc) => {
      const expense = doc.data() as Expense;
      return sum + expense.amount;
    }, 0);

    // Calculate monthly profit
    const monthlyProfit = monthlyIncome - monthlyExpenses;

    // Get recent expenses
    const recentExpensesQuery = query(
      collection(db, 'expenses'),
      where('date', '>=', Timestamp.fromDate(startOfMonth))
    );
    const recentExpensesSnapshot = await getDocs(recentExpensesQuery);
    const recentExpenses = recentExpensesSnapshot.docs
      .map(doc => {
        const expense = doc.data() as Expense;
        return {
          date: expense.date.toDate().toISOString(),
          amount: expense.amount
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Get animals by type
    const animalsByType = animals.reduce((acc, animal) => {
      const type = animal.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const animalsByTypeArray = Object.entries(animalsByType).map(([type, count]) => ({
      type,
      count
    }));

    return {
      totalAnimals: animals.length,
      dailyExpenses,
      monthlyProfit,
      monthlyIncome,
      recentExpenses,
      animalsByType: animalsByTypeArray
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
} 