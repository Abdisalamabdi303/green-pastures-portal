import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { HealthRecord, Vaccination, Animal } from '../types/index';
import Navbar from '../components/layout/Navbar';
import { BatchVaccinationForm } from '@/components/health/BatchVaccinationForm';
import { HealthFilters } from '@/components/health/HealthFilters';
import { useHealthData } from '@/hooks/useHealthData';
import { Timestamp } from 'firebase/firestore';
import { BatchHealthRecordForm } from '@/components/health/BatchHealthRecordForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, AlertCircle, Filter, Calendar, Syringe, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const HealthPage = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('health');
  const [openBatchVaccinationForm, setOpenBatchVaccinationForm] = useState(false);
  const [openBatchHealthForm, setOpenBatchHealthForm] = useState(false);
  const [deleteHealthDialogOpen, setDeleteHealthDialogOpen] = useState(false);
  const [deleteVaccinationDialogOpen, setDeleteVaccinationDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [vaccinationToDelete, setVaccinationToDelete] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    animalType: '',
    condition: ''
  });
  const [isBatchAddingVaccinations, setIsBatchAddingVaccinations] = useState(false);

  const {
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
    deleteHealthRecord,
    addVaccination,
    deleteVaccination,
    batchAddVaccinations
  } = useHealthData(currentPage);

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleAddBatchHealthRecords = useCallback(async (records: Omit<HealthRecord, 'id' | 'createdAt'>[]) => {
    try {
      console.log('HealthPage: Starting batch health record submission');
      console.log('Number of records to add:', records.length);
      
      // Validate records
      records.forEach((record, index) => {
        console.log(`Validating record ${index}:`, record);
        
        // Check for required fields
        const requiredFields = ['animalId', 'animalName', 'animalType', 'condition', 'treatment', 'cost', 'date'];
        const missingFields = requiredFields.filter(field => !record[field as keyof typeof record]);
        
        if (missingFields.length > 0) {
          console.error('Missing required fields:', missingFields);
          throw new Error(`Invalid health record data at index ${index}: Missing fields ${missingFields.join(', ')}`);
        }

        // Validate dates
        if (!(record.date instanceof Timestamp)) {
          console.error('Invalid date format:', { date: record.date });
          throw new Error(`Invalid health record data at index ${index}: Invalid date format`);
        }
      });

      // Process records
      const batchRecords = records.map(record => ({
        ...record,
        date: record.date instanceof Timestamp ? record.date : Timestamp.fromDate(new Date(record.date)),
        createdAt: Timestamp.now(),
      }));

      console.log('Processed batch health records:', batchRecords);
      
      // Submit to database
      await addHealthRecord(batchRecords);
      console.log('Batch health records added successfully');
      
      setOpenBatchHealthForm(false);
      toast.success('Batch health records added successfully');
    } catch (error) {
      console.error('Error adding batch health records:', error);
      toast.error('Failed to add batch health records');
      throw error;
    }
  }, [addHealthRecord]);

  const handleBatchAddVaccinations = useCallback(async (vaccinations: Omit<Vaccination, 'id' | 'createdAt'>[]) => {
    try {
      setIsBatchAddingVaccinations(true);
      await batchAddVaccinations(vaccinations);
      toast.success('Vaccinations added successfully');
      setOpenBatchVaccinationForm(false);
    } catch (error) {
      toast.error('Failed to add vaccinations');
      console.error('Error adding vaccinations:', error);
      throw error;
    } finally {
      setIsBatchAddingVaccinations(false);
    }
  }, [batchAddVaccinations]);

  const handleDeleteHealthRecord = useCallback(async (id: string) => {
    setRecordToDelete(id);
    setDeleteHealthDialogOpen(true);
  }, []);

  const handleDeleteVaccination = useCallback(async (id: string) => {
    setVaccinationToDelete(id);
    setDeleteVaccinationDialogOpen(true);
  }, []);

  const confirmDeleteHealthRecord = useCallback(async () => {
    if (!recordToDelete) return;
    try {
      await deleteHealthRecord(recordToDelete);
      toast.success('Health record deleted successfully');
      setDeleteHealthDialogOpen(false);
      setRecordToDelete(null);
    } catch (error) {
      toast.error('Failed to delete health record');
      console.error('Error deleting health record:', error);
    }
  }, [recordToDelete, deleteHealthRecord]);

  const confirmDeleteVaccination = useCallback(async () => {
    if (!vaccinationToDelete) return;
    try {
      await deleteVaccination(vaccinationToDelete);
      toast.success('Vaccination deleted successfully');
      setDeleteVaccinationDialogOpen(false);
      setVaccinationToDelete(null);
    } catch (error) {
      toast.error('Failed to delete vaccination');
      console.error('Error deleting vaccination:', error);
    }
  }, [vaccinationToDelete, deleteVaccination]);

  const filteredHealthRecords = useCallback(() => {
    return healthData?.records.filter(record => {
      if (filters.search && !record.animalName.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.animalType && record.animalType !== filters.animalType) {
        return false;
      }
      if (filters.condition && record.condition !== filters.condition) {
        return false;
      }
      return true;
    }) || [];
  }, [healthData?.records, filters]);

  const filteredVaccinations = useCallback(() => {
    return vaccinationData?.vaccinations.filter(vaccination => {
      if (filters.search && !vaccination.animalName.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.animalType && vaccination.animalType !== filters.animalType) {
        return false;
      }
      return true;
    }) || [];
  }, [vaccinationData?.vaccinations, filters]);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }, [navigate, currentUser, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  if (animalError || healthError || vaccinationError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <AlertCircle className="mx-auto h-12 w-12" />
          <h3 className="mt-2 text-sm font-medium">Error loading data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  const isLoading = isLoadingHealth || isLoadingVaccinations || isLoadingAnimals;
  const healthRecords = filteredHealthRecords();
  const vaccinations = filteredVaccinations();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Health Records</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setOpenBatchHealthForm(true)}
              className="bg-farm-600 hover:bg-farm-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Health Records
            </Button>
            <Button
              onClick={() => setOpenBatchVaccinationForm(true)}
              className="bg-farm-600 hover:bg-farm-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vaccinations
            </Button>
          </div>
        </div>

        <Card className="bg-white border-[#e8e8e0]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold text-[#2c3e2d]">Health Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-white p-1 rounded-lg border border-[#e8e8e0]">
                <TabsTrigger 
                  value="health" 
                  className="flex items-center space-x-2 data-[state=active]:bg-[#f5f5f0] data-[state=active]:shadow-sm data-[state=active]:text-[#4a6741]"
                >
                  <Activity className="h-4 w-4" />
                  <span>Health Records</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="vaccinations" 
                  className="flex items-center space-x-2 data-[state=active]:bg-[#f5f5f0] data-[state=active]:shadow-sm data-[state=active]:text-[#4a6741]"
                >
                  <Syringe className="h-4 w-4" />
                  <span>Vaccinations</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="health">
                <div className="space-y-4">
                  <HealthFilters onFilterChange={handleFilterChange} animals={animals} />
                  <div className="rounded-md border border-[#e8e8e0] bg-white">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Animal ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Treatment</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          Array(5).fill(0).map((_, index) => (
                            <TableRow key={index}>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                            </TableRow>
                          ))
                        ) : healthRecords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-[#4a6741] py-8">
                              No health records found
                            </TableCell>
                          </TableRow>
                        ) : (
                          healthRecords.map((record) => (
                            <TableRow key={record.id} className="hover:bg-[#f5f5f0]">
                              <TableCell className="font-medium">
                                {record.date.toDate().toLocaleDateString()}
                              </TableCell>
                              <TableCell>{record.animalId}</TableCell>
                              <TableCell>{record.animalType}</TableCell>
                              <TableCell>{record.condition}</TableCell>
                              <TableCell>{record.treatment}</TableCell>
                              <TableCell className="text-right font-medium">
                                ${record.cost.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteHealthRecord(record.id)}
                                    className="text-[#4a6741] hover:text-[#2c3e2d] hover:bg-[#f5f5f0]"
                                    disabled={isLoading}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vaccinations">
                <div className="space-y-4">
                  <HealthFilters onFilterChange={handleFilterChange} animals={animals} />
                  <div className="rounded-md border border-[#e8e8e0] bg-white">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Animal ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Vaccine</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingVaccinations ? (
                          Array(5).fill(0).map((_, index) => (
                            <TableRow key={index}>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                            </TableRow>
                          ))
                        ) : vaccinations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-[#4a6741] py-8">
                              No vaccinations found
                            </TableCell>
                          </TableRow>
                        ) : (
                          vaccinations.map((vaccination) => (
                            <TableRow key={vaccination.id} className="hover:bg-[#f5f5f0]">
                              <TableCell className="font-medium">
                                {vaccination.date.toDate().toLocaleDateString()}
                              </TableCell>
                              <TableCell>{vaccination.animalId}</TableCell>
                              <TableCell>{vaccination.animalType}</TableCell>
                              <TableCell>{vaccination.vaccine}</TableCell>
                              <TableCell>{vaccination.status}</TableCell>
                              <TableCell className="text-right font-medium">
                                ${(vaccination.cost || 0).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteVaccination(vaccination.id)}
                                    className="text-[#4a6741] hover:text-[#2c3e2d] hover:bg-[#f5f5f0]"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-4 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#e8e8e0] bg-white text-sm font-medium text-[#4a6741] hover:bg-[#f5f5f0]"
            >
              Previous
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-[#e8e8e0] bg-white text-sm font-medium text-[#2c3e2d]">
              Page {currentPage} of {Math.max(1, activeTab === 'health' ? healthData?.totalPages : vaccinationData?.totalPages || 1)}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= Math.max(1, activeTab === 'health' ? healthData?.totalPages : vaccinationData?.totalPages || 1)}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#e8e8e0] bg-white text-sm font-medium text-[#4a6741] hover:bg-[#f5f5f0]"
            >
              Next
            </button>
          </nav>
        </div>

        {/* Delete Health Record Confirmation Dialog */}
        <Dialog open={deleteHealthDialogOpen} onOpenChange={setDeleteHealthDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-[#2c3e2d]">Delete Health Record</DialogTitle>
              <DialogDescription className="text-[#4a6741]">
                Are you sure you want to delete this health record? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteHealthDialogOpen(false)}
                className="border-[#e8e8e0] text-[#4a6741] hover:bg-[#f5f5f0]"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteHealthRecord}
                className="bg-[#4a6741] hover:bg-[#3d5636]"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Vaccination Confirmation Dialog */}
        <Dialog open={deleteVaccinationDialogOpen} onOpenChange={setDeleteVaccinationDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-[#2c3e2d]">Delete Vaccination</DialogTitle>
              <DialogDescription className="text-[#4a6741]">
                Are you sure you want to delete this vaccination record? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteVaccinationDialogOpen(false)}
                className="border-[#e8e8e0] text-[#4a6741] hover:bg-[#f5f5f0]"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteVaccination}
                className="bg-[#4a6741] hover:bg-[#3d5636]"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Form Dialogs */}
        <BatchHealthRecordForm
          open={openBatchHealthForm}
          onOpenChange={setOpenBatchHealthForm}
          onSubmit={handleAddBatchHealthRecords}
          animals={animals}
          isLoading={isLoading}
        />
        <BatchVaccinationForm
          open={openBatchVaccinationForm}
          onOpenChange={setOpenBatchVaccinationForm}
          onSubmit={handleBatchAddVaccinations}
          animals={animals}
          isLoading={isLoading || isBatchAddingVaccinations}
        />
      </div>
    </div>
  );
};

export default HealthPage; 