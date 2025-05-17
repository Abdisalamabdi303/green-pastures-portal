import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Animal, HealthRecord, Vaccination } from '@/types';

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

// Health Record Services
export const healthServices = {
  // Add a new health record
  addHealthRecord: async (recordData: Omit<HealthRecord, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'health_records'), {
        ...recordData,
        createdAt: Timestamp.now(),
        date: typeof recordData.date === 'string' 
          ? Timestamp.fromDate(new Date(recordData.date))
          : recordData.date
      });
      return { 
        id: docRef.id, 
        ...recordData,
        createdAt: Timestamp.now()
      };
    } catch (error) {
      console.error('Error adding health record:', error);
      throw error;
    }
  },

  // Get all health records
  getHealthRecords: async () => {
    try {
      const q = query(collection(db, 'health_records'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HealthRecord[];
    } catch (error) {
      console.error('Error fetching health records:', error);
      throw error;
    }
  },

  // Update a health record
  updateHealthRecord: async (id: string, recordData: Partial<HealthRecord>) => {
    try {
      const recordRef = doc(db, 'health_records', id);
      const updateData = { ...recordData };
      
      if (updateData.date && typeof updateData.date === 'string') {
        updateData.date = Timestamp.fromDate(new Date(updateData.date));
      }
      
      await updateDoc(recordRef, updateData);
      return { id, ...recordData };
    } catch (error) {
      console.error('Error updating health record:', error);
      throw error;
    }
  },

  // Delete a health record
  deleteHealthRecord: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'health_records', id));
      return id;
    } catch (error) {
      console.error('Error deleting health record:', error);
      throw error;
    }
  }
};

// Vaccination Services
export const vaccinationServices = {
  // Add a new vaccination record
  addVaccination: async (vaccinationData: Omit<Vaccination, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'vaccinations'), {
        ...vaccinationData,
        createdAt: Timestamp.now(),
        date: typeof vaccinationData.date === 'string'
          ? Timestamp.fromDate(new Date(vaccinationData.date))
          : vaccinationData.date,
        nextDueDate: typeof vaccinationData.nextDueDate === 'string'
          ? Timestamp.fromDate(new Date(vaccinationData.nextDueDate))
          : vaccinationData.nextDueDate
      });
      return { 
        id: docRef.id, 
        ...vaccinationData,
        createdAt: Timestamp.now()
      };
    } catch (error) {
      console.error('Error adding vaccination:', error);
      throw error;
    }
  },

  // Get all vaccinations
  getVaccinations: async () => {
    try {
      const q = query(collection(db, 'vaccinations'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vaccination[];
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
      throw error;
    }
  },

  // Update a vaccination record
  updateVaccination: async (id: string, vaccinationData: Partial<Vaccination>) => {
    try {
      const vaccinationRef = doc(db, 'vaccinations', id);
      const updateData = { ...vaccinationData };
      
      if (updateData.date && typeof updateData.date === 'string') {
        updateData.date = Timestamp.fromDate(new Date(updateData.date));
      }
      if (updateData.nextDueDate && typeof updateData.nextDueDate === 'string') {
        updateData.nextDueDate = Timestamp.fromDate(new Date(updateData.nextDueDate));
      }
      
      await updateDoc(vaccinationRef, updateData);
      return { id, ...vaccinationData };
    } catch (error) {
      console.error('Error updating vaccination:', error);
      throw error;
    }
  },

  // Delete a vaccination record
  deleteVaccination: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'vaccinations', id));
      return id;
    } catch (error) {
      console.error('Error deleting vaccination:', error);
      throw error;
    }
  }
}; 