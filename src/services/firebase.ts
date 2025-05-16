import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Animal } from '@/types';

// Animal Services
export const animalServices = {
  // Add a new animal
  addAnimal: async (animalData: Animal) => {
    try {
      const docRef = await addDoc(collection(db, 'animals'), {
        ...animalData,
        createdAt: Timestamp.now()
      });
      return { id: docRef.id, ...animalData };
    } catch (error) {
      console.error('Error adding animal:', error);
      throw error;
    }
  },

  // Get all animals
  getAnimals: async () => {
    try {
      const q = query(collection(db, 'animals'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Animal[];
    } catch (error) {
      console.error('Error fetching animals:', error);
      throw error;
    }
  },

  // Update an animal
  updateAnimal: async (id: string, animalData: Partial<Animal>) => {
    try {
      const animalRef = doc(db, 'animals', id);
      await updateDoc(animalRef, animalData);
      return { id, ...animalData };
    } catch (error) {
      console.error('Error updating animal:', error);
      throw error;
    }
  },

  // Delete an animal
  deleteAnimal: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'animals', id));
      return id;
    } catch (error) {
      console.error('Error deleting animal:', error);
      throw error;
    }
  }
};

// Expense Services
export const expenseServices = {
  // Add a new expense
  addExpense: async (expenseData: any) => {
    try {
      const docRef = await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        createdAt: Timestamp.now(),
        date: Timestamp.fromDate(new Date(expenseData.date))
      });
      return { id: docRef.id, ...expenseData };
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  // Get all expenses
  getExpenses: async () => {
    try {
      const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },

  // Delete an expense
  deleteExpense: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
      return id;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }
}; 