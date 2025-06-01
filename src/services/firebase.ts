import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, where, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Animal, HealthRecord, Vaccination } from '@/types';

// Animal Services
export const animalServices = {
  // Add a new animal
  addAnimal: async (animalData: Animal) => {
    try {
      const animalRef = doc(db, 'animals', animalData.id);
      await setDoc(animalRef, {
        ...animalData,
        createdAt: Timestamp.now()
      });

      // Create an expense record for the animal purchase
      if (animalData.purchasePrice && animalData.purchasePrice > 0) {
        const expenseData = {
          category: 'Animal Purchase',
          amount: animalData.purchasePrice,
          date: Timestamp.fromDate(new Date(animalData.purchaseDate || new Date())),
          description: `Purchase of ${animalData.name} (${animalData.type})`,
          paymentMethod: 'Cash',
          animalRelated: true,
          animalId: animalData.id,
          animalName: animalData.name,
          createdAt: Timestamp.now()
        };

        const expenseRef = await addDoc(collection(db, 'expenses'), expenseData);
        
        // Update the animal document with the expense reference
        await updateDoc(animalRef, {
          expenseId: expenseRef.id
        });
      }

      return animalData;
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
      // If the ID is being changed
      if (animalData.id && animalData.id !== id) {
        // Create new document with new ID
        const newAnimalRef = doc(db, 'animals', animalData.id);
        await setDoc(newAnimalRef, {
          ...animalData,
          createdAt: Timestamp.now()
        });

        // Delete old document
        const oldAnimalRef = doc(db, 'animals', id);
        await deleteDoc(oldAnimalRef);

        // Update related records with new animalId
        const healthRecordsQuery = query(
          collection(db, 'health_records'),
          where('animalId', '==', id)
        );
        const healthRecordsSnapshot = await getDocs(healthRecordsQuery);
        const healthRecordsUpdates = healthRecordsSnapshot.docs.map(doc => 
          updateDoc(doc.ref, { animalId: animalData.id })
        );
        await Promise.all(healthRecordsUpdates);

        const vaccinationsQuery = query(
          collection(db, 'vaccinations'),
          where('animalId', '==', id)
        );
        const vaccinationsSnapshot = await getDocs(vaccinationsQuery);
        const vaccinationsUpdates = vaccinationsSnapshot.docs.map(doc => 
          updateDoc(doc.ref, { animalId: animalData.id })
        );
        await Promise.all(vaccinationsUpdates);

        return { ...animalData, id: animalData.id };
      } else {
        // Regular update without ID change
        const animalRef = doc(db, 'animals', id);
        await updateDoc(animalRef, animalData);
        return { id, ...animalData };
      }
    } catch (error) {
      console.error('Error updating animal:', error);
      throw error;
    }
  },

  // Delete an animal
  deleteAnimal: async (id: string) => {
    try {
      console.log('Starting deletion process for animal:', id);
      
      // Check if animal exists first
      const animalRef = doc(db, 'animals', id);
      const animalDoc = await getDoc(animalRef);
      
      if (!animalDoc.exists()) {
        throw new Error(`Animal with ID ${id} not found`);
      }

      console.log('Animal found, proceeding with deletion');

      // Delete the animal
      await deleteDoc(animalRef);
      console.log('Animal document deleted');

      // Delete related health records
      const healthRecordsQuery = query(
        collection(db, 'health_records'),
        where('animalId', '==', id)
      );
      const healthRecordsSnapshot = await getDocs(healthRecordsQuery);
      console.log(`Found ${healthRecordsSnapshot.size} health records to delete`);
      
      const healthRecordsDeletions = healthRecordsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(healthRecordsDeletions);
      console.log('Health records deleted');

      // Delete related vaccinations
      const vaccinationsQuery = query(
        collection(db, 'vaccinations'),
        where('animalId', '==', id)
      );
      const vaccinationsSnapshot = await getDocs(vaccinationsQuery);
      console.log(`Found ${vaccinationsSnapshot.size} vaccinations to delete`);
      
      const vaccinationsDeletions = vaccinationsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(vaccinationsDeletions);
      console.log('Vaccinations deleted');

      return id;
    } catch (error) {
      console.error('Error in deleteAnimal:', error);
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
      // Ensure all required fields are present and properly formatted
      const healthRecord = {
        animalId: recordData.animalId,
        animalName: recordData.animalName || '',
        animalType: recordData.animalType || '',
        condition: recordData.condition,
        status: recordData.status,
        date: typeof recordData.date === 'string' 
          ? Timestamp.fromDate(new Date(recordData.date))
          : recordData.date,
        treatment: recordData.treatment,
        cost: recordData.cost || 0,
        notes: recordData.notes || '',
        createdAt: Timestamp.now()
      };

      console.log('Submitting health record to Firestore:', healthRecord);
      
      const docRef = await addDoc(collection(db, 'health_records'), healthRecord);
      return { 
        id: docRef.id, 
        ...healthRecord
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

// Income Services
export const incomeServices = {
  // Add a new income
  addIncome: async (incomeData: any) => {
    try {
      const docRef = await addDoc(collection(db, 'incomes'), {
        ...incomeData,
        createdAt: Timestamp.now(),
        date: Timestamp.fromDate(new Date(incomeData.date))
      });
      return { id: docRef.id, ...incomeData };
    } catch (error) {
      console.error('Error adding income:', error);
      throw error;
    }
  },

  // Get all incomes
  getIncomes: async () => {
    try {
      const q = query(collection(db, 'incomes'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching incomes:', error);
      throw error;
    }
  },

  // Delete an income
  deleteIncome: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'incomes', id));
      return id;
    } catch (error) {
      console.error('Error deleting income:', error);
      throw error;
    }
  }
}; 