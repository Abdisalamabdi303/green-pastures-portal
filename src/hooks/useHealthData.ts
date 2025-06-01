import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { HealthRecord, Vaccination } from '@/types';

const ITEMS_PER_PAGE = 10;

export const useHealthData = (currentPage: number) => {
  const [healthData, setHealthData] = useState<{ records: HealthRecord[]; totalPages: number } | null>(null);
  const [vaccinationData, setVaccinationData] = useState<{ vaccinations: Vaccination[]; totalPages: number } | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);
  const [isLoadingVaccinations, setIsLoadingVaccinations] = useState(true);
  const [healthError, setHealthError] = useState<Error | null>(null);
  const [vaccinationError, setVaccinationError] = useState<Error | null>(null);

  // Fetch health records
  const fetchHealthRecords = async () => {
    try {
      setIsLoadingHealth(true);
      setHealthError(null);
      
      const healthRef = collection(db, 'healthRecords');
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

      setHealthData({ records, totalPages });
    } catch (error) {
      console.error('Error fetching health records:', error);
      setHealthError(error instanceof Error ? error : new Error('Failed to fetch health records'));
    } finally {
      setIsLoadingHealth(false);
    }
  };

  // Fetch vaccinations
  const fetchVaccinations = async () => {
    try {
      setIsLoadingVaccinations(true);
      setVaccinationError(null);
      
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

      setVaccinationData({ vaccinations, totalPages });
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
      setVaccinationError(error instanceof Error ? error : new Error('Failed to fetch vaccinations'));
    } finally {
      setIsLoadingVaccinations(false);
    }
  };

  // Add health record
  const addHealthRecord = async (records: Omit<HealthRecord, 'id' | 'createdAt'>[]) => {
    try {
      const healthRef = collection(db, 'healthRecords');
      const batchRecords = records.map(record => ({
        ...record,
        createdAt: Timestamp.now()
      }));

      for (const record of batchRecords) {
        await addDoc(healthRef, record);
      }

      // Refresh data after adding
      await fetchHealthRecords();
    } catch (error) {
      console.error('Error adding health record:', error);
      throw error;
    }
  };

  // Update health record
  const updateHealthRecord = async ({ id, data }: { id: string; data: Partial<HealthRecord> }) => {
    try {
      const healthRef = doc(db, 'healthRecords', id);
      await updateDoc(healthRef, data);
      
      // Refresh data after updating
      await fetchHealthRecords();
    } catch (error) {
      console.error('Error updating health record:', error);
      throw error;
    }
  };

  // Delete health record
  const deleteHealthRecord = async (id: string) => {
    try {
      const healthRef = doc(db, 'healthRecords', id);
      await deleteDoc(healthRef);
      
      // Refresh data after deleting
      await fetchHealthRecords();
    } catch (error) {
      console.error('Error deleting health record:', error);
      throw error;
    }
  };

  // Add vaccination
  const addVaccination = async (vaccination: Omit<Vaccination, 'id' | 'createdAt'>) => {
    try {
      const vaccinationRef = collection(db, 'vaccinations');
      await addDoc(vaccinationRef, {
        ...vaccination,
        createdAt: Timestamp.now()
      });
      
      // Refresh data after adding
      await fetchVaccinations();
    } catch (error) {
      console.error('Error adding vaccination:', error);
      throw error;
    }
  };

  // Update vaccination
  const updateVaccination = async ({ id, data }: { id: string; data: Partial<Vaccination> }) => {
    try {
      const vaccinationRef = doc(db, 'vaccinations', id);
      await updateDoc(vaccinationRef, data);
      
      // Refresh data after updating
      await fetchVaccinations();
    } catch (error) {
      console.error('Error updating vaccination:', error);
      throw error;
    }
  };

  // Delete vaccination
  const deleteVaccination = async (id: string) => {
    try {
      const vaccinationRef = doc(db, 'vaccinations', id);
      await deleteDoc(vaccinationRef);
      
      // Refresh data after deleting
      await fetchVaccinations();
    } catch (error) {
      console.error('Error deleting vaccination:', error);
      throw error;
    }
  };

  // Batch add vaccinations
  const batchAddVaccinations = async (vaccinations: Omit<Vaccination, 'id' | 'createdAt'>[]) => {
    try {
      const vaccinationRef = collection(db, 'vaccinations');
      const batchVaccinations = vaccinations.map(vaccination => ({
        ...vaccination,
        createdAt: Timestamp.now()
      }));

      for (const vaccination of batchVaccinations) {
        await addDoc(vaccinationRef, vaccination);
      }
      
      // Refresh data after adding
      await fetchVaccinations();
    } catch (error) {
      console.error('Error adding batch vaccinations:', error);
      throw error;
    }
  };

  // Fetch data when component mounts or currentPage changes
  useEffect(() => {
    fetchHealthRecords();
    fetchVaccinations();
  }, [currentPage]);

  return {
    healthData,
    vaccinationData,
    isLoadingHealth,
    isLoadingVaccinations,
    healthError,
    vaccinationError,
    addHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
    addVaccination,
    updateVaccination,
    deleteVaccination,
    batchAddVaccinations
  };
}; 