import { FirebaseError } from 'firebase/app';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, where, setDoc, getDoc, limit as firestoreLimit, startAfter, getCountFromServer, Query, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Animal, HealthRecord, Vaccination, Expense } from '@/types';

// Helper function to validate required fields
const validateRequiredFields = (data: any, requiredFields: string[]) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

// Helper function to convert dates to Timestamps
const convertDatesToTimestamps = (data: Partial<Animal> | Partial<Expense>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      result[key] = Timestamp.fromDate(value);
    } else if (value instanceof Timestamp) {
      result[key] = value;
    } else {
      result[key] = value;
    }
  }
  return result;
};

// Helper function to convert Timestamps to Dates
const convertTimestampsToDates = <T extends DocumentData>(doc: QueryDocumentSnapshot<T>): T => {
  const data = doc.data();
  const converted: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      converted[key] = value.toDate();
    } else {
      converted[key] = value;
    }
  }
  
  return converted as T;
};

// Helper function to handle Firebase errors
const handleFirebaseError = (error: FirebaseError | Error): never => {
  console.error('Firebase operation failed:', error);
  throw error;
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
        status: animalData.status || 'active'
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
      const baseQuery = query(
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
      let animals = dataSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw animal data from Firestore:', data); // Debug log
        
        const animal = {
          id: doc.id,
          name: data.name || '',
          type: data.type || '',
          breed: data.breed || '',
          gender: data.gender || 'male',
          weight: Number(data.weight || 0),
          status: data.status || 'active',
          purchasePrice: Number(data.purchasePrice || 0),
          notes: data.notes || '',
          imageUrl: data.imageUrl || '',
          // Ensure age is properly converted to number
          age: Number(data.age || 0),
          purchaseDate: data.purchaseDate?.toDate?.() || (data.purchaseDate ? new Date(data.purchaseDate) : undefined)
        } as Animal;
        
        console.log('Processed animal data:', animal); // Debug log
        return animal;
      });

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
  updateAnimal: async (id: string, animalData: Partial<Animal>, onSuccess?: () => void) => {
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
        const updatedData = {
          ...currentData,
          ...convertDatesToTimestamps(animalData),
          updatedAt: Timestamp.now()
        };
        
        await setDoc(newAnimalRef, updatedData);
        await deleteDoc(currentAnimalRef);
        
        // Call onSuccess callback if provided
        onSuccess?.();
        
        return updatedData;
      }
      
      // Regular update without ID change
      const updatedData = {
        ...animalData,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(currentAnimalRef, convertDatesToTimestamps(updatedData));

      // Handle purchase price changes
      if (animalData.purchasePrice !== undefined && 
          animalData.purchasePrice !== currentData.purchasePrice) {
        // Find existing purchase expense
        const expensesQuery = query(
          collection(db, 'expenses'),
          where('animalId', '==', id),
          where('category', '==', 'Animal Purchase')
        );
        const expensesSnapshot = await getDocs(expensesQuery);

        if (!expensesSnapshot.empty) {
          // Update existing expense
          const expenseDoc = expensesSnapshot.docs[0];
          await updateDoc(expenseDoc.ref, {
            amount: animalData.purchasePrice,
            updatedAt: Timestamp.now(),
            description: `Updated purchase price for ${currentData.type} (${currentData.breed})`
          });
        } else {
          // Create new expense record
          const expenseData = {
            category: 'Animal Purchase',
            amount: animalData.purchasePrice,
            date: Timestamp.fromDate(new Date(currentData.purchaseDate || new Date())),
            description: `Purchase of ${currentData.type} (${currentData.breed}) - Price updated`,
            paymentMethod: 'Cash',
            animalRelated: true,
            animalId: id,
            animalName: currentData.name || id,
            createdAt: Timestamp.now()
          };

          await addDoc(collection(db, 'expenses'), expenseData);
        }
      }
      
      // Call onSuccess callback if provided
      onSuccess?.();
      
      return {
        ...currentData,
        ...updatedData
      };
    } catch (error) {
      handleFirebaseError(error);
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
      console.log(`Fetching expenses - Page: ${page}, Limit: ${limit}, DateRange:`, dateRange);
      const expensesRef = collection(db, 'expenses');
      
      // Build the base query
      let baseQuery: Query<DocumentData> = query(expensesRef, orderBy('date', 'desc'));

      // Add date range filter if provided
      if (dateRange) {
        const startTimestamp = Timestamp.fromDate(dateRange.start);
        const endTimestamp = Timestamp.fromDate(dateRange.end);
        console.log('Date range timestamps:', { start: startTimestamp, end: endTimestamp });
        
        baseQuery = query(
          expensesRef,
          where('date', '>=', startTimestamp),
          where('date', '<=', endTimestamp),
          orderBy('date', 'desc')
        );
      }

      // Get total count for pagination
      const totalSnapshot = await getCountFromServer(baseQuery);
      const total = totalSnapshot.data().count;
      const totalPages = Math.ceil(total / limit);

      console.log('Total expenses:', total, 'Total pages:', totalPages);

      // Build the paginated query
      let paginatedQuery = query(
        baseQuery,
        firestoreLimit(limit)
      );

      // If not on first page, get the last document from previous page
      if (page > 1) {
        const previousPageQuery = query(
          baseQuery,
          firestoreLimit((page - 1) * limit)
        );
        const previousPageSnapshot = await getDocs(previousPageQuery);
        const lastVisible = previousPageSnapshot.docs[previousPageSnapshot.docs.length - 1];
        
        if (lastVisible) {
          paginatedQuery = query(
            baseQuery,
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
