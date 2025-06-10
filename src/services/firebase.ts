import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, where, setDoc, getDoc, limit as firestoreLimit, startAfter, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Animal, HealthRecord, Vaccination, Expense } from '@/types';
import { handleFirebaseError } from '@/lib/firebase';

// Helper function to validate required fields
const validateRequiredFields = (data: any, requiredFields: string[]) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

// Helper function to convert dates to Timestamps
const convertDatesToTimestamps = (data: any) => {
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Date) {
      converted[key] = Timestamp.fromDate(converted[key]);
    } else if (typeof converted[key] === 'string' && !isNaN(Date.parse(converted[key]))) {
      converted[key] = Timestamp.fromDate(new Date(converted[key]));
    }
  });
  return converted;
};

// Animal Services
export const animalServices = {
  // Add a new animal
  addAnimal: async (animalData: Animal) => {
    try {
      // Validate required fields
      validateRequiredFields(animalData, ['id', 'type', 'breed']);
      
      // Check if animal with this ID already exists
      const existingAnimalRef = doc(db, 'animals', animalData.id);
      const existingAnimalDoc = await getDoc(existingAnimalRef);
      
      if (existingAnimalDoc.exists()) {
        throw new Error(`Animal with ID ${animalData.id} already exists`);
      }
      
      const animalToAdd = {
        ...animalData,
        ...convertDatesToTimestamps(animalData),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: animalData.status || 'active',
        health: animalData.health || 'Good',
        isVaccinated: animalData.isVaccinated || false
      };
      
      await setDoc(existingAnimalRef, animalToAdd);
      console.log('Animal successfully added to backend');

      // Create an expense record for the animal purchase
      if (animalData.purchasePrice && animalData.purchasePrice > 0) {
        const expenseData = {
          category: 'Animal Purchase',
          amount: animalData.purchasePrice,
          date: Timestamp.fromDate(new Date(animalData.purchaseDate || new Date())),
          description: `Purchase of ${animalData.type} (${animalData.breed})`,
          paymentMethod: 'Cash',
          animalRelated: true,
          animalId: animalData.id,
          animalName: animalData.name || animalData.id,
          createdAt: Timestamp.now()
        };

        const expenseRef = await addDoc(collection(db, 'expenses'), expenseData);
        console.log('Expense record created:', expenseRef.id);
        
        await updateDoc(existingAnimalRef, {
          expenseId: expenseRef.id
        });
      }

      return animalToAdd;
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  // Get all animals with optimized pagination and search
  getAnimals: async (page = 1, limit = 10, searchTerm = '', lastDoc = null) => {
    try {
      console.log(`Fetching animals - Page: ${page}, Limit: ${limit}, Search: ${searchTerm}`);
      
      // Build the base query
      let baseQuery = query(
        collection(db, 'animals'),
        orderBy('createdAt', 'desc')
      );

      // Get total count only on first page
      let total = 0;
      if (page === 1) {
        const countSnapshot = await getCountFromServer(baseQuery);
        total = countSnapshot.data().count;
      }

      // Build paginated query
      let paginatedQuery = query(
        collection(db, 'animals'),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limit)
      );

      // Add pagination cursor if provided
      if (lastDoc && page > 1) {
        paginatedQuery = query(
          collection(db, 'animals'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          firestoreLimit(limit)
        );
      }

      const dataSnapshot = await getDocs(paginatedQuery);
      let animals = dataSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Animal[];

      // Get the last document for next page cursor
      const lastVisible = dataSnapshot.docs[dataSnapshot.docs.length - 1];

      // Filter animals based on search term if provided
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        animals = animals.filter(animal => 
          animal.id.toLowerCase().includes(searchLower) ||
          animal.type?.toLowerCase().includes(searchLower) ||
          animal.breed?.toLowerCase().includes(searchLower)
        );
      }

      const hasMore = dataSnapshot.docs.length === limit;

      console.log(`Fetched ${animals.length} animals, hasMore: ${hasMore}`);

      return {
        animals,
        total: page === 1 ? total : 0,
        page,
        limit,
        totalPages: page === 1 ? Math.ceil(total / limit) : 0,
        hasMore,
        lastDoc: lastVisible
      };
    } catch (error) {
      console.error('Error fetching animals:', error);
      throw error;
    }
  },

  // Update an animal - Enhanced to handle ID changes properly
  updateAnimal: async (id: string, animalData: Partial<Animal>) => {
    try {
      console.log('Updating animal in backend:', id, animalData);
      
      // Check if animal exists
      const currentAnimalRef = doc(db, 'animals', id);
      const currentAnimalDoc = await getDoc(currentAnimalRef);
      
      if (!currentAnimalDoc.exists()) {
        throw new Error(`Animal with ID ${id} not found`);
      }

      // Get current animal data
      const currentData = currentAnimalDoc.data();
      
      // If the ID is being changed
      if (animalData.id && animalData.id !== id) {
        // Check if new ID already exists
        const newAnimalRef = doc(db, 'animals', animalData.id);
        const newAnimalDoc = await getDoc(newAnimalRef);
        
        if (newAnimalDoc.exists()) {
          throw new Error(`Animal with ID ${animalData.id} already exists`);
        }
        
        // Create new document with new ID
        await setDoc(newAnimalRef, {
          ...currentData,
          ...animalData,
          id: animalData.id,
          updatedAt: Timestamp.now()
        });

        // Delete old document
        await deleteDoc(currentAnimalRef);

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

        const expensesQuery = query(
          collection(db, 'expenses'),
          where('animalId', '==', id)
        );
        const expensesSnapshot = await getDocs(expensesQuery);
        const expensesUpdates = expensesSnapshot.docs.map(doc => 
          updateDoc(doc.ref, { animalId: animalData.id })
        );
        await Promise.all(expensesUpdates);
      } else {
        // Regular update
        const updateData = {
          ...animalData,
          updatedAt: Timestamp.now()
        };

        // Update the animal record
        await updateDoc(currentAnimalRef, updateData);
      }

      return { id, ...animalData };
    } catch (error) {
      console.error('Error updating animal:', error);
      throw error;
    }
  },

  // Delete an animal - Enhanced with better error handling
  deleteAnimal: async (id: string) => {
    try {
      console.log('Starting deletion process for animal:', id);
      
      // Check if animal exists first
      const animalRef = doc(db, 'animals', id);
      const animalDoc = await getDoc(animalRef);
      
      if (!animalDoc.exists()) {
        console.error(`Animal with ID ${id} not found`);
        throw new Error(`Animal with ID ${id} not found`);
      }

      console.log('Animal found, proceeding with deletion');

      // Delete related health records first
      const healthRecordsQuery = query(
        collection(db, 'health_records'),
        where('animalId', '==', id)
      );
      const healthRecordsSnapshot = await getDocs(healthRecordsQuery);
      console.log(`Found ${healthRecordsSnapshot.size} health records to delete`);
      
      if (healthRecordsSnapshot.size > 0) {
        const healthRecordsDeletions = healthRecordsSnapshot.docs.map(doc => {
          console.log('Deleting health record:', doc.id);
          return deleteDoc(doc.ref);
        });
        await Promise.all(healthRecordsDeletions);
        console.log('Health records deleted successfully');
      }

      // Delete related vaccinations
      const vaccinationsQuery = query(
        collection(db, 'vaccinations'),
        where('animalId', '==', id)
      );
      const vaccinationsSnapshot = await getDocs(vaccinationsQuery);
      console.log(`Found ${vaccinationsSnapshot.size} vaccinations to delete`);
      
      if (vaccinationsSnapshot.size > 0) {
        const vaccinationsDeletions = vaccinationsSnapshot.docs.map(doc => {
          console.log('Deleting vaccination:', doc.id);
          return deleteDoc(doc.ref);
        });
        await Promise.all(vaccinationsDeletions);
        console.log('Vaccinations deleted successfully');
      }

      // Delete related expenses
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('animalId', '==', id)
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      console.log(`Found ${expensesSnapshot.size} expenses to delete`);
      
      if (expensesSnapshot.size > 0) {
        const expensesDeletions = expensesSnapshot.docs.map(doc => {
          console.log('Deleting expense:', doc.id);
          return deleteDoc(doc.ref);
        });
        await Promise.all(expensesDeletions);
        console.log('Related expenses deleted successfully');
      }

      // Finally delete the animal document
      await deleteDoc(animalRef);
      console.log('Animal document deleted successfully from backend');

      return id;
    } catch (error) {
      console.error('Critical error in deleteAnimal:', error);
      throw new Error(`Failed to delete animal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// Expense Services
export const expenseServices = {
  // Add a new expense
  addExpense: async (expenseData: any) => {
    try {
      validateRequiredFields(expenseData, ['amount', 'category', 'date']);

      const expenseToAdd = {
        ...expenseData,
        ...convertDatesToTimestamps(expenseData),
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'expenses'), expenseToAdd);
      console.log('Expense successfully added to backend:', docRef.id);
      return { id: docRef.id, ...expenseToAdd };
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  // Get expenses with pagination and optional date range
  async getExpenses({ 
    page = 1, 
    limit = 10, 
    dateRange 
  }: { 
    page?: number; 
    limit?: number;
    dateRange?: { start: Date; end: Date };
  }): Promise<{ 
    expenses: Expense[]; 
    totalPages: number;
    total: number;
  }> {
    try {
      console.log(`Fetching expenses - Page: ${page}, Limit: ${limit}`);
      const expensesRef = collection(db, 'expenses');
      
      // Build the base query
      let baseQuery = query(expensesRef, orderBy('date', 'desc'));

      // Add date range filter if provided
      if (dateRange) {
        baseQuery = query(
          expensesRef,
          where('date', '>=', Timestamp.fromDate(dateRange.start)),
          where('date', '<=', Timestamp.fromDate(dateRange.end)),
          orderBy('date', 'desc')
        );
      }

      // Get total count for pagination
      const totalSnapshot = await getCountFromServer(baseQuery);
      const total = totalSnapshot.data().count;
      const totalPages = Math.ceil(total / limit);

      // Build the paginated query
      let paginatedQuery = query(
        expensesRef,
        ...(dateRange ? [
          where('date', '>=', Timestamp.fromDate(dateRange.start)),
          where('date', '<=', Timestamp.fromDate(dateRange.end))
        ] : []),
        orderBy('date', 'desc'),
        firestoreLimit(limit)
      );

      // If not on first page, get the last document from previous page
      if (page > 1) {
        const previousPageQuery = query(
          expensesRef,
          ...(dateRange ? [
            where('date', '>=', Timestamp.fromDate(dateRange.start)),
            where('date', '<=', Timestamp.fromDate(dateRange.end))
          ] : []),
          orderBy('date', 'desc'),
          firestoreLimit((page - 1) * limit)
        );
        const previousPageSnapshot = await getDocs(previousPageQuery);
        const lastVisible = previousPageSnapshot.docs[previousPageSnapshot.docs.length - 1];
        
        if (lastVisible) {
          paginatedQuery = query(
            expensesRef,
            ...(dateRange ? [
              where('date', '>=', Timestamp.fromDate(dateRange.start)),
              where('date', '<=', Timestamp.fromDate(dateRange.end))
            ] : []),
            orderBy('date', 'desc'),
            startAfter(lastVisible),
            firestoreLimit(limit)
          );
        }
      }

      const snapshot = await getDocs(paginatedQuery);
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];

      console.log(`Fetched ${expenses.length} expenses from backend`);

      return {
        expenses,
        totalPages,
        total
      };
    } catch (error) {
      console.error('Error getting expenses:', error);
      throw error;
    }
  },

  // Delete an expense - FIXED FOR PROPER BACKEND DELETION
  deleteExpense: async (id: string) => {
    try {
      console.log('Deleting expense from backend:', id);
      
      // Check if expense exists first
      const expenseRef = doc(db, 'expenses', id);
      const expenseDoc = await getDoc(expenseRef);
      
      if (!expenseDoc.exists()) {
        console.error(`Expense with ID ${id} not found`);
        throw new Error(`Expense with ID ${id} not found`);
      }

      await deleteDoc(expenseRef);
      console.log('Expense successfully deleted from backend:', id);
      return id;
    } catch (error) {
      console.error('Critical error deleting expense:', error);
      throw new Error(`Failed to delete expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Update expense
  updateExpense: async (id: string, expenseData: Partial<Expense>) => {
    try {
      console.log('Updating expense in backend:', id, expenseData);
      const expenseRef = doc(db, 'expenses', id);
      
      const updateData = { ...expenseData };
      if (updateData.date && typeof updateData.date === 'string') {
        updateData.date = Timestamp.fromDate(new Date(updateData.date));
      }
      
      await updateDoc(expenseRef, updateData);
      console.log('Expense successfully updated in backend');
      return { id, ...expenseData };
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }
};

// Health Record Services
export const healthServices = {
  // Add a new health record
  addHealthRecord: async (recordData: Omit<HealthRecord, 'id' | 'createdAt'>) => {
    try {
      validateRequiredFields(recordData, ['animalId', 'condition', 'treatment', 'date']);

      const healthRecord = {
        ...recordData,
        ...convertDatesToTimestamps(recordData),
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'health_records'), healthRecord);
      console.log('Health record successfully added:', docRef.id);
      return { 
        id: docRef.id, 
        ...healthRecord
      };
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  // Get health records for an animal
  getHealthRecords: async (animalId: string) => {
    try {
      const q = query(
        collection(db, 'health_records'),
        where('animalId', '==', animalId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HealthRecord[];
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  // Update a health record
  updateHealthRecord: async (id: string, data: Partial<HealthRecord>) => {
    try {
      const recordRef = doc(db, 'health_records', id);
      const updateData = {
        ...data,
        ...convertDatesToTimestamps(data),
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(recordRef, updateData);
      return { id, ...updateData };
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  // Delete a health record
  deleteHealthRecord: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'health_records', id));
      return id;
    } catch (error) {
      handleFirebaseError(error);
    }
  }
};

// Vaccination Services
export const vaccinationServices = {
  // Add a new vaccination record
  addVaccination: async (vaccinationData: Omit<Vaccination, 'id' | 'createdAt'>) => {
    try {
      validateRequiredFields(vaccinationData, ['animalId', 'vaccineName', 'date']);

      const vaccinationToAdd = {
        ...vaccinationData,
        ...convertDatesToTimestamps(vaccinationData),
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'vaccinations'), vaccinationToAdd);
      console.log('Vaccination record successfully added:', docRef.id);
      return { 
        id: docRef.id, 
        ...vaccinationToAdd
      };
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  // Get vaccination records for an animal
  getVaccinations: async (animalId: string) => {
    try {
      const q = query(
        collection(db, 'vaccinations'),
        where('animalId', '==', animalId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vaccination[];
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  // Update a vaccination record
  updateVaccination: async (id: string, data: Partial<Vaccination>) => {
    try {
      const vaccinationRef = doc(db, 'vaccinations', id);
      const updateData = {
        ...data,
        ...convertDatesToTimestamps(data),
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(vaccinationRef, updateData);
      return { id, ...updateData };
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  // Delete a vaccination record
  deleteVaccination: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'vaccinations', id));
      return id;
    } catch (error) {
      handleFirebaseError(error);
    }
  }
};

// Income Services
export const incomeServices = {
  // Add a new income
  addIncome: async (incomeData: any) => {
    try {
      validateRequiredFields(incomeData, ['amount', 'date']);

      const incomeToAdd = {
        ...incomeData,
        ...convertDatesToTimestamps(incomeData),
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'incomes'), incomeToAdd);
      return { id: docRef.id, ...incomeToAdd };
    } catch (error) {
      handleFirebaseError(error);
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
