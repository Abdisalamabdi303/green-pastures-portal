import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthServices, vaccinationServices } from '@/services/firebase';
import { HealthRecord, Vaccination } from '@/types';

const ITEMS_PER_PAGE = 10;

export const useHealthData = (page: number = 1) => {
  const queryClient = useQueryClient();

  // Health Records Query
  const {
    data: healthData,
    isLoading: isLoadingHealth,
    error: healthError
  } = useQuery({
    queryKey: ['healthRecords', page],
    queryFn: async () => {
      const records = await healthServices.getHealthRecords();
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      return {
        records: records.slice(start, end),
        total: records.length,
        totalPages: Math.ceil(records.length / ITEMS_PER_PAGE)
      };
    }
  });

  // Vaccinations Query
  const {
    data: vaccinationData,
    isLoading: isLoadingVaccinations,
    error: vaccinationError
  } = useQuery({
    queryKey: ['vaccinations', page],
    queryFn: async () => {
      const vaccinations = await vaccinationServices.getVaccinations();
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      return {
        vaccinations: vaccinations.slice(start, end),
        total: vaccinations.length,
        totalPages: Math.ceil(vaccinations.length / ITEMS_PER_PAGE)
      };
    }
  });

  // Health Record Mutations
  const addHealthRecord = useMutation({
    mutationFn: (data: Omit<HealthRecord, 'id' | 'createdAt'>) => 
      healthServices.addHealthRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthRecords'] });
      console.log('Health record added successfully');
    },
    onError: (error) => {
      console.error('Failed to add health record:', error);
    }
  });

  const updateHealthRecord = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HealthRecord> }) =>
      healthServices.updateHealthRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthRecords'] });
      console.log('Health record updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update health record:', error);
    }
  });

  const deleteHealthRecord = useMutation({
    mutationFn: (id: string) => healthServices.deleteHealthRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthRecords'] });
      console.log('Health record deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete health record:', error);
    }
  });

  // Vaccination Mutations
  const addVaccination = useMutation({
    mutationFn: (data: Omit<Vaccination, 'id' | 'createdAt'>) =>
      vaccinationServices.addVaccination(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      console.log('Vaccination record added successfully');
    },
    onError: (error) => {
      console.error('Failed to add vaccination record:', error);
    }
  });

  const updateVaccination = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vaccination> }) =>
      vaccinationServices.updateVaccination(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      console.log('Vaccination record updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update vaccination record:', error);
    }
  });

  const deleteVaccination = useMutation({
    mutationFn: (id: string) => vaccinationServices.deleteVaccination(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      console.log('Vaccination record deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete vaccination record:', error);
    }
  });

  // Batch Operations
  const batchAddVaccinations = useMutation({
    mutationFn: async (vaccinations: Omit<Vaccination, 'id' | 'createdAt'>[]) => {
      const results = await Promise.all(
        vaccinations.map(vacc => vaccinationServices.addVaccination(vacc))
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      console.log('Batch vaccinations added successfully');
    },
    onError: (error) => {
      console.error('Failed to add batch vaccinations:', error);
    }
  });

  return {
    // Queries
    healthData,
    vaccinationData,
    isLoadingHealth,
    isLoadingVaccinations,
    healthError,
    vaccinationError,
    
    // Health Record Mutations
    addHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
    
    // Vaccination Mutations
    addVaccination,
    updateVaccination,
    deleteVaccination,
    
    // Batch Operations
    batchAddVaccinations
  };
}; 