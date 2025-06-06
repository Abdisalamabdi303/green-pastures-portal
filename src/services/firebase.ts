
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, where, setDoc, getDoc, limit as firestoreLimit, startAfter, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Animal, HealthRecord, Vaccination, Expense } from '@/types';

// Animal Services
export const animalServices = {
  // Add a new animal
  addAnimal: async (animalData: Animal) => {
    try {
      console.log('Adding animal to backend:', animalData);
      const animalRef = doc(db, 'animals', animalData.id);
      const animalToAdd = {
        ...animalData,
        createdAt: Timestamp.now(),
        status: animalData.status || 'active',
        health: animalData.health || 'Good',
        isVaccinated: animalData.isVaccinated || false
      };
      
      await setDoc(animalRef, animalToAdd);
      console.log('Animal successfully added to backend');

      // Create an expense record for the animal purchase
      if (animalData.purchasePrice && animalData.purchasePrice > 0) {
        const expenseData = {
          category: 'Animal Purchase',
          amount: animalData.purchasePrice,
          date: Timestamp.fromDate(new Date(animalData.purchaseDate || new Date())),
          description: `Purchase of ${animalData.type || 'Animal'} (${animalData.breed || 'Unknown Breed'})`,
          paymentMethod: 'Cash',
          animalRelated: true,
          animalId: animalData.id,
          animalName: animalData.name || animalData.id,
          createdAt: Timestamp.now()
        };

        const expenseRef = await addDoc(collection(db, 'expenses'), expenseData);
        console.log('Expense record created:', expenseRef.id);
        
        // Update the animal document with the expense reference
        await updateDoc(animalRef, {
          expenseId: expenseRef.id
        });
      }

      return animalToAdd;
    } catch (error) {
      console.error('Error adding animal:', error);
      throw error;
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

  // Update an animal
  updateAnimal: async (id: string, animalData: Partial<Animal>) => {
    try {
      console.log('Updating animal in backend:', id, animalData);
      
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

        console.log('Animal successfully updated in backend with new ID');
        return { ...animalData, id: animalData.id };
      } else {
        // Regular update without ID change
        const animalRef = doc(db, 'animals', id);
        await updateDoc(animalRef, animalData);
        console.log('Animal successfully updated in backend');
        return { id, ...animalData };
      }
    } catch (error) {
      console.error('Error updating animal:', error);
      throw error;
    }
  },

  // Delete an animal - FIXED FOR PROPER BACKEND DELETION
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

// Expense Services - FIXED FOR PROPER CRUD
export const expenseServices = {
  // Add a new expense
  addExpense: async (expenseData: any) => {
    try {
      console.log('Adding expense to backend:', expenseData);
      const docRef = await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        createdAt: Timestamp.now(),
        date: Timestamp.fromDate(new Date(expenseData.date))
      });
      console.log('Expense successfully added to backend:', docRef.id);
      return { id: docRef.id, ...expenseData };
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
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
      // Ensure all required fields are present and properly formatted
      const healthRecord = {
        animalId: recordData.animalId,
        animalName: recordData.animalName || '',
        animalType: recordData.animalType || '',
        condition: recordData.condition,
        treatment: recordData.treatment,
        date: typeof recordData.date === 'string' 
          ? Timestamp.fromDate(new Date(recordData.date))
          : recordData.date,
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
