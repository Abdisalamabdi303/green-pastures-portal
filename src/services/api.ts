import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Animal, Expense } from '@/types';

export const getAnimals = async (): Promise<Animal[]> => {
  const animalsRef = collection(db, 'animals');
  const snapshot = await getDocs(animalsRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Animal));
};

export const getExpenses = async (): Promise<Expense[]> => {
  const expensesRef = collection(db, 'expenses');
  const snapshot = await getDocs(expensesRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Expense));
}; 