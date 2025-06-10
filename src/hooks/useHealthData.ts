import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { HealthRecord, Vaccination, Animal } from '@/types';

const ITEMS_PER_PAGE = 10;
const CACHE_DURATION = 1000 * 60; // 1 minute

// Create cache Maps outside hook to persist between renders
const healthCache = new Map<string, { data: any; timestamp: number }>();
const vaccinationCache = new Map<string, { data: any; timestamp: number }>();
const animalCache = new Map<string, { data: any; timestamp: number }>();

export const useHealthData = (currentPage: number) => {
  const [healthData, setHealthData] = useState<{ records: HealthRecord[]; totalPages: number } | null>(null);
  const [vaccinationData, setVaccinationData] = useState<{ vaccinations: Vaccination[]; totalPages: number } | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isLoadingVaccinations, setIsLoadingVaccinations] = useState(false);
  const [isLoadingAnimals, setIsLoadingAnimals] = useState(false);
  const [healthError, setHealthError] = useState<Error | null>(null);
  const [vaccinationError, setVaccinationError] = useState<Error | null>(null);
  const [animalError, setAnimalError] = useState<Error | null>(null);

  // Fetch animals
  const fetchAnimals = useCallback(async () => {
    try {
      setIsLoadingAnimals(true);
      setAnimalError(null);

      // Check cache first
      const cacheKey = 'animals';
      const cachedData = animalCache.get(cacheKey);
      const now = Date.now();
      
      if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
        setAnimals(cachedData.data);
        return;
      }

      const animalsRef = collection(db, 'animals');
      const q = query(
        animalsRef,
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(q);
      const animalsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          // Sort in memory instead of in query
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        }) as Animal[];

      // Update cache
      animalCache.set(cacheKey, {
        data: animalsData,
        timestamp: now
      });

      setAnimals(animalsData);
    } catch (error) {
      console.error('Error fetching animals:', error);
      setAnimalError(error instanceof Error ? error : new Error('Failed to fetch animals'));
    } finally {
      setIsLoadingAnimals(false);
    }
  }, []);

  // Fetch health records with caching
  const fetchHealthRecords = useCallback(async () => {
    // Check cache first
    const cacheKey = `health-${currentPage}`;
    const cachedData = healthCache.get(cacheKey);
    const now = Date.now();
    
    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      setHealthData(cachedData.data);
      return;
    }

    setIsLoadingHealth(true);
    setHealthError(null);
    
    try {
      const healthRef = collection(db, 'health_records');
      const q = query(
        healthRef,
        orderBy('date', 'desc'),
        limit(ITEMS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HealthRecord[];

      // Get total count for pagination
      const totalSnapshot = await getDocs(healthRef);
      const totalPages = Math.ceil(totalSnapshot.size / ITEMS_PER_PAGE);

      const newData = { records, totalPages };
      
      // Update cache
      healthCache.set(cacheKey, {
        data: newData,
        timestamp: now
      });

      setHealthData(newData);
    } catch (error) {
      console.error('Error fetching health records:', error);
      setHealthError(error instanceof Error ? error : new Error('Failed to fetch health records'));
    } finally {
      setIsLoadingHealth(false);
    }
  }, [currentPage]);

  // Fetch vaccinations with caching
  const fetchVaccinations = useCallback(async () => {
    // Check cache first
    const cacheKey = `vaccination-${currentPage}`;
    const cachedData = vaccinationCache.get(cacheKey);
    const now = Date.now();
    
    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      setVaccinationData(cachedData.data);
      return;
    }

    setIsLoadingVaccinations(true);
    setVaccinationError(null);
    
    try {
      const vaccinationRef = collection(db, 'vaccinations');
      const q = query(
        vaccinationRef,
        orderBy('date', 'desc'),
        limit(ITEMS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const vaccinations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vaccination[];

      // Get total count for pagination
      const totalSnapshot = await getDocs(vaccinationRef);
      const totalPages = Math.ceil(totalSnapshot.size / ITEMS_PER_PAGE);

      const newData = { vaccinations, totalPages };
      
      // Update cache
      vaccinationCache.set(cacheKey, {
        data: newData,
        timestamp: now
      });

      setVaccinationData(newData);
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
      setVaccinationError(error instanceof Error ? error : new Error('Failed to fetch vaccinations'));
    } finally {
      setIsLoadingVaccinations(false);
    }
  }, [currentPage]);

  // Add health record with optimistic update and expense tracking
  const addHealthRecord = async (records: Omit<HealthRecord, 'id' | 'createdAt'>[]) => {
    try {
      const healthRef = collection(db, 'health_records');
      const batchRecords = records.map(record => ({
        ...record,
        createdAt: Timestamp.now()
      }));

      // Optimistic update
      const optimisticRecords = batchRecords.map(record => ({
        ...record,
        id: `temp-${Date.now()}-${Math.random()}`
      })) as HealthRecord[];

      setHealthData(prev => {
        if (!prev) return { records: optimisticRecords, totalPages: 1 };
        return {
          records: [...optimisticRecords, ...prev.records.slice(0, ITEMS_PER_PAGE - optimisticRecords.length)],
          totalPages: prev.totalPages
        };
      });

      // Add health costs to expenses - combine costs for batch records
      if (batchRecords.length > 0) {
        const totalCost = batchRecords.reduce((sum, record) => sum + (record.cost || 0), 0);
        if (totalCost > 0) {
          // Create a single expense for the batch
          const firstRecord = batchRecords[0];
          const animalNames = batchRecords.map(r => r.animalName).join(', ');
          await addDoc(collection(db, 'expenses'), {
            category: 'Health',
            description: `Batch health treatment for ${animalNames}: ${firstRecord.condition}`,
            amount: totalCost,
            date: firstRecord.date,
            paymentMethod: 'Cash',
            animalRelated: true,
            animalName: animalNames,
            animalId: batchRecords.map(r => r.animalId).join(','),
            createdAt: Timestamp.now(),
            isBatchRecord: true
          });
        }
      }

      // Actual update
      for (const record of batchRecords) {
        await addDoc(healthRef, record);
      }

      // Update cache instead of clearing
      const cacheKey = `health-${currentPage}`;
      healthCache.set(cacheKey, {
        data: {
          records: [...optimisticRecords, ...(healthData?.records || [])],
          totalPages: healthData?.totalPages || 1
        },
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error adding health record:', error);
      // Revert optimistic update on error
      await fetchHealthRecords();
      throw error;
    }
  };

  // Update health record with optimistic update and expense tracking
  const updateHealthRecord = async ({ id, data }: { id: string; data: Partial<HealthRecord> }) => {
    try {
      const oldRecord = healthData?.records.find(r => r.id === id);
      
      // Optimistic update
      setHealthData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          records: prev.records.map(record => 
            record.id === id ? { ...record, ...data } : record
          )
        };
      });

      // If cost changed, update expense
      if (data.cost !== undefined && oldRecord && data.cost !== oldRecord.cost) {
        const expensesRef = collection(db, 'expenses');
        const q = query(
          expensesRef,
          where('description', '==', `Health treatment for ${oldRecord.animalName}: ${oldRecord.condition}`),
          where('date', '==', oldRecord.date)
        );
        const expenseSnapshot = await getDocs(q);
        
        if (!expenseSnapshot.empty) {
          const expenseDoc = expenseSnapshot.docs[0];
          await updateDoc(doc(db, 'expenses', expenseDoc.id), {
            amount: data.cost
          });
        }
      }

      // Actual update
      const healthRef = doc(db, 'health_records', id);
      await updateDoc(healthRef, data);

      // Update cache
      const cacheKey = `health-${currentPage}`;
      healthCache.set(cacheKey, {
        data: healthData,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error updating health record:', error);
      // Revert optimistic update on error
      await fetchHealthRecords();
      throw error;
    }
  };

  // Delete health record with optimistic update and expense cleanup
  const deleteHealthRecord = useCallback(async (id: string) => {
    try {
      const oldRecord = healthData?.records.find(r => r.id === id);
      
      // Optimistic update
      setHealthData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          records: prev.records.filter(record => record.id !== id),
          totalPages: Math.ceil((prev.records.length - 1) / ITEMS_PER_PAGE)
        };
      });

      // Update cache
      const cacheKey = `health-${currentPage}`;
      const cachedData = healthCache.get(cacheKey);
      if (cachedData) {
        healthCache.set(cacheKey, {
          data: {
            records: cachedData.data.records.filter(record => record.id !== id),
            totalPages: Math.ceil((cachedData.data.records.length - 1) / ITEMS_PER_PAGE)
          },
          timestamp: Date.now()
        });
      }

      // Delete from database
      await deleteDoc(doc(db, 'health_records', id));
    } catch (error) {
      console.error('Error deleting health record:', error);
      // Revert optimistic update on error
      await fetchHealthRecords();
      throw error;
    }
  }, [currentPage, healthData]);

  // Add vaccination with optimistic update
  const addVaccination = async (vaccination: Omit<Vaccination, 'id' | 'createdAt'>) => {
    try {
      // Optimistic update
      const optimisticVaccination = {
        ...vaccination,
        id: `temp-${Date.now()}-${Math.random()}`,
        createdAt: Timestamp.now()
      } as Vaccination;

      setVaccinationData(prev => {
        if (!prev) return { vaccinations: [optimisticVaccination], totalPages: 1 };
        return {
          vaccinations: [optimisticVaccination, ...prev.vaccinations.slice(0, ITEMS_PER_PAGE - 1)],
          totalPages: prev.totalPages
        };
      });

      // Clear cache
      vaccinationCache.clear();

      // Actual update
      const vaccinationRef = collection(db, 'vaccinations');
      await addDoc(vaccinationRef, {
        ...vaccination,
        createdAt: Timestamp.now()
      });
      
      // Refresh data
      await fetchVaccinations();
    } catch (error) {
      console.error('Error adding vaccination:', error);
      // Revert optimistic update on error
      await fetchVaccinations();
      throw error;
    }
  };

  // Update vaccination with optimistic update
  const updateVaccination = async ({ id, data }: { id: string; data: Partial<Vaccination> }) => {
    try {
      // Optimistic update
      setVaccinationData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          vaccinations: prev.vaccinations.map(vaccination => 
            vaccination.id === id ? { ...vaccination, ...data } : vaccination
          )
        };
      });

      // Clear cache
      vaccinationCache.clear();

      // Actual update
      const vaccinationRef = doc(db, 'vaccinations', id);
      await updateDoc(vaccinationRef, data);
      
      // Refresh data
      await fetchVaccinations();
    } catch (error) {
      console.error('Error updating vaccination:', error);
      // Revert optimistic update on error
      await fetchVaccinations();
      throw error;
    }
  };

  // Delete vaccination with optimistic update
  const deleteVaccination = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setVaccinationData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          vaccinations: prev.vaccinations.filter(vaccination => vaccination.id !== id),
          totalPages: Math.ceil((prev.vaccinations.length - 1) / ITEMS_PER_PAGE)
        };
      });

      // Update cache
      const cacheKey = `vaccination-${currentPage}`;
      const cachedData = vaccinationCache.get(cacheKey);
      if (cachedData) {
        vaccinationCache.set(cacheKey, {
          data: {
            vaccinations: cachedData.data.vaccinations.filter(vaccination => vaccination.id !== id),
            totalPages: Math.ceil((cachedData.data.vaccinations.length - 1) / ITEMS_PER_PAGE)
          },
          timestamp: Date.now()
        });
      }

      // Delete from database
      await deleteDoc(doc(db, 'vaccinations', id));
    } catch (error) {
      console.error('Error deleting vaccination:', error);
      // Revert optimistic update on error
      await fetchVaccinations();
      throw error;
    }
  }, [currentPage, vaccinationData]);

  // Batch add vaccinations with optimistic update
  const batchAddVaccinations = async (vaccinations: Omit<Vaccination, 'id' | 'createdAt'>[]) => {
    try {
      // Optimistic update
      const optimisticVaccinations = vaccinations.map(vaccination => ({
        ...vaccination,
        id: `temp-${Date.now()}-${Math.random()}`,
        createdAt: Timestamp.now()
      })) as Vaccination[];

      setVaccinationData(prev => {
        if (!prev) return { vaccinations: optimisticVaccinations, totalPages: 1 };
        return {
          vaccinations: [...optimisticVaccinations, ...prev.vaccinations.slice(0, ITEMS_PER_PAGE - optimisticVaccinations.length)],
          totalPages: prev.totalPages
        };
      });

      // Clear cache
      vaccinationCache.clear();

      // Actual update
      const vaccinationRef = collection(db, 'vaccinations');
      const batchVaccinations = vaccinations.map(vaccination => ({
        ...vaccination,
        createdAt: Timestamp.now()
      }));

      for (const vaccination of batchVaccinations) {
        await addDoc(vaccinationRef, vaccination);
      }
      
      // Refresh data
      await fetchVaccinations();
    } catch (error) {
      console.error('Error adding batch vaccinations:', error);
      // Revert optimistic update on error
      await fetchVaccinations();
      throw error;
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch animals first
        await fetchAnimals();

        // Check cache for initial data
        const healthCacheKey = `health-${currentPage}`;
        const vaccinationCacheKey = `vaccination-${currentPage}`;
        
        const healthCachedData = healthCache.get(healthCacheKey);
        const vaccinationCachedData = vaccinationCache.get(vaccinationCacheKey);
        const now = Date.now();
        
        if (healthCachedData && now - healthCachedData.timestamp < CACHE_DURATION) {
          setHealthData(healthCachedData.data);
        } else {
          await fetchHealthRecords();
        }
        
        if (vaccinationCachedData && now - vaccinationCachedData.timestamp < CACHE_DURATION) {
          setVaccinationData(vaccinationCachedData.data);
        } else {
          await fetchVaccinations();
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, [currentPage, fetchHealthRecords, fetchVaccinations, fetchAnimals]);

  return {
    healthData,
    vaccinationData,
    animals,
    isLoadingHealth,
    isLoadingVaccinations,
    isLoadingAnimals,
    healthError,
    vaccinationError,
    animalError,
    addHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
    addVaccination,
    updateVaccination,
    deleteVaccination,
    batchAddVaccinations,
    fetchAnimals
  };
}; 