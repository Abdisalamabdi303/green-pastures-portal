import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { HealthRecord, Vaccination } from '@/types';
import AddHealthRecordForm from '@/components/health/AddHealthRecordForm';
import AddVaccinationForm from '@/components/health/AddVaccinationForm';
import { BatchVaccinationForm } from '@/components/health/BatchVaccinationForm';
import { HealthFilters } from '@/components/health/HealthFilters';
import { useHealthData } from '@/hooks/useHealthData';
import { useAnimals } from '@/hooks/useAnimals';
import { Timestamp } from 'firebase/firestore';
import { BatchHealthRecordForm } from '@/components/health/BatchHealthRecordForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, AlertCircle, Filter, Calendar, Syringe, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const HealthPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('health');
  const [openHealthForm, setOpenHealthForm] = useState(false);
  const [openVaccinationForm, setOpenVaccinationForm] = useState(false);
  const [openBatchVaccinationForm, setOpenBatchVaccinationForm] = useState(false);
  const [openBatchHealthForm, setOpenBatchHealthForm] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    dateRange: { start: '', end: '' },
    animalType: '',
    condition: '',
    vaccinationStatus: ''
  });
  const [isAddingHealth, setIsAddingHealth] = useState(false);
  const [isAddingVaccination, setIsAddingVaccination] = useState(false);
  const [isBatchAddingVaccinations, setIsBatchAddingVaccinations] = useState(false);

  const { animals, isLoading: isLoadingAnimals, error: animalsError } = useAnimals();
  const {
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
  } = useHealthData(currentPage);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleAddHealthRecord = async (records: Omit<HealthRecord, 'id' | 'createdAt'>[]) => {
    try {
      setIsAddingHealth(true);
      await addHealthRecord(records);
      toast.success('Health records added successfully');
    } catch (error) {
      toast.error('Failed to add health records');
      console.error('Error adding health records:', error);
    } finally {
      setIsAddingHealth(false);
    }
  };

  const handleAddVaccination = async (vaccination: Omit<Vaccination, 'id' | 'createdAt'>) => {
    try {
      setIsAddingVaccination(true);
      await addVaccination(vaccination);
      toast.success('Vaccination added successfully');
    } catch (error) {
      toast.error('Failed to add vaccination');
      console.error('Error adding vaccination:', error);
    } finally {
      setIsAddingVaccination(false);
    }
  };

  const handleBatchAddVaccinations = async (vaccinations: Omit<Vaccination, 'id' | 'createdAt'>[]) => {
    try {
      setIsBatchAddingVaccinations(true);
      await batchAddVaccinations(vaccinations);
      toast.success('Vaccinations added successfully');
    } catch (error) {
      toast.error('Failed to add vaccinations');
      console.error('Error adding vaccinations:', error);
    } finally {
      setIsBatchAddingVaccinations(false);
    }
  };

  const handleUpdateHealthRecord = async ({ id, data }: { id: string; data: Partial<HealthRecord> }) => {
    try {
      await updateHealthRecord({ id, data });
      toast.success('Health record updated successfully');
    } catch (error) {
      toast.error('Failed to update health record');
      console.error('Error updating health record:', error);
    }
  };

  const handleDeleteHealthRecord = async (id: string) => {
    try {
      await deleteHealthRecord(id);
      toast.success('Health record deleted successfully');
    } catch (error) {
      toast.error('Failed to delete health record');
      console.error('Error deleting health record:', error);
    }
  };

  const handleUpdateVaccination = async ({ id, data }: { id: string; data: Partial<Vaccination> }) => {
    try {
      await updateVaccination({ id, data });
      toast.success('Vaccination updated successfully');
    } catch (error) {
      toast.error('Failed to update vaccination');
      console.error('Error updating vaccination:', error);
    }
  };

  const handleDeleteVaccination = async (id: string) => {
    try {
      await deleteVaccination(id);
      toast.success('Vaccination deleted successfully');
    } catch (error) {
      toast.error('Failed to delete vaccination');
      console.error('Error deleting vaccination:', error);
    }
  };

  const handleAddBatchHealthRecords = async (records: Omit<HealthRecord, 'id' | 'createdAt'>[]) => {
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
    } catch (error) {
      console.error('Error adding batch health records:', error);
      toast.error('Failed to add batch health records');
    }
  };

  const handleEditHealthRecord = (record: HealthRecord) => {
    setOpenHealthForm(true);
    // You can pass the record data to the form if needed
  };

  const handleEditVaccination = (vaccination: Vaccination) => {
    setOpenVaccinationForm(true);
    // You can pass the vaccination data to the form if needed
  };

  const filteredHealthRecords = healthData?.records.filter(record => {
    if (filters.search && !record.animalName.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.animalType && record.animalType !== filters.animalType) {
      return false;
    }
    if (filters.condition && record.condition !== filters.condition) {
      return false;
    }
    if (filters.dateRange.start && new Date(record.date) < new Date(filters.dateRange.start)) {
      return false;
    }
    if (filters.dateRange.end && new Date(record.date) > new Date(filters.dateRange.end)) {
      return false;
    }
    return true;
  }) || [];

  const filteredVaccinations = vaccinationData?.vaccinations.filter(vaccination => {
    if (filters.search && !vaccination.animalName.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.animalType && vaccination.animalType !== filters.animalType) {
      return false;
    }
    if (filters.vaccinationStatus) {
      const isDue = new Date(vaccination.nextDueDate) <= new Date();
      const isOverdue = new Date(vaccination.nextDueDate) < new Date();
      if (filters.vaccinationStatus === 'due' && !isDue) return false;
      if (filters.vaccinationStatus === 'overdue' && !isOverdue) return false;
      if (filters.vaccinationStatus === 'upToDate' && isDue) return false;
    }
    if (filters.dateRange.start && new Date(vaccination.date) < new Date(filters.dateRange.start)) {
      return false;
    }
    if (filters.dateRange.end && new Date(vaccination.date) > new Date(filters.dateRange.end)) {
      return false;
    }
    return true;
  }) || [];

  // Show loading state
  if (isLoadingAnimals || isLoadingHealth || isLoadingVaccinations) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-600"></div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (animalsError || healthError || vaccinationError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading data
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Please try refreshing the page. If the problem persists, contact support.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Health Management
            </h2>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-6">
          <div className="flex items-center mb-4">
            <Filter className="h-4 w-4 mr-2 text-farm-600" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>
          <HealthFilters onFilterChange={handleFilterChange} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Health Records</CardTitle>
            <div className="flex items-center space-x-2">
              {activeTab === 'health' ? (
                <>
                  <Button
                    onClick={() => setOpenHealthForm(true)}
                    disabled={isAddingHealth}
                    className="bg-farm-600 hover:bg-farm-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Record
                  </Button>
                  <Button
                    onClick={() => setOpenBatchHealthForm(true)}
                    className="bg-farm-600 hover:bg-farm-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Batch Record
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setOpenVaccinationForm(true)}
                    disabled={isAddingVaccination}
                    className="bg-farm-600 hover:bg-farm-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Vaccination
                  </Button>
                  <Button
                    onClick={() => setOpenBatchVaccinationForm(true)}
                    disabled={isBatchAddingVaccinations}
                    className="bg-farm-600 hover:bg-farm-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Batch Vaccination
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="health" 
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-farm-600"
                >
                  <Activity className="h-4 w-4" />
                  <span>Health Records</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="vaccinations" 
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-farm-600"
                >
                  <Syringe className="h-4 w-4" />
                  <span>Vaccinations</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="health">
                {healthError ? (
                  <div className="flex items-center space-x-2 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>{healthError.message}</span>
                  </div>
                ) : (
                  <div className="rounded-md border">
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
                        {isLoadingHealth ? (
                          Array(5).fill(0).map((_, index) => (
                            <HealthRecordSkeleton key={index} />
                          ))
                        ) : filteredHealthRecords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                              No health records found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredHealthRecords.map((record) => (
                            <TableRow key={record.id} className="hover:bg-gray-50">
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
                                    onClick={() => handleEditHealthRecord(record)}
                                    className="text-farm-600 hover:text-farm-700 hover:bg-farm-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteHealthRecord(record.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                )}
              </TabsContent>

              <TabsContent value="vaccinations">
                {vaccinationError ? (
                  <div className="flex items-center space-x-2 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>{vaccinationError.message}</span>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Animal ID</TableHead>
                          <TableHead>Vaccine</TableHead>
                          <TableHead>Next Due</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingVaccinations ? (
                          Array(5).fill(0).map((_, index) => (
                            <VaccinationSkeleton key={index} />
                          ))
                        ) : filteredVaccinations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                              No vaccination records found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredVaccinations.map((vaccination) => (
                            <TableRow key={vaccination.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                {vaccination.date.toDate().toLocaleDateString()}
                              </TableCell>
                              <TableCell>{vaccination.animalId}</TableCell>
                              <TableCell>{vaccination.vaccineName}</TableCell>
                              <TableCell>
                                <span className={new Date(vaccination.nextDueDate) <= new Date() ? 'text-red-600' : ''}>
                                  {vaccination.nextDueDate.toDate().toLocaleDateString()}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${(vaccination.cost || 0).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditVaccination(vaccination)}
                                    className="text-farm-600 hover:text-farm-700 hover:bg-farm-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteVaccination(vaccination.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="mt-4 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              Page {currentPage} of {Math.max(1, activeTab === 'health' ? healthData?.totalPages : vaccinationData?.totalPages || 1)}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= Math.max(1, activeTab === 'health' ? healthData?.totalPages : vaccinationData?.totalPages || 1)}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Next
            </button>
          </nav>
        </div>

        {/* Form Dialogs */}
        {openHealthForm && (
          <AddHealthRecordForm
            onAddHealthRecord={handleAddHealthRecord}
            onClose={() => setOpenHealthForm(false)}
            animals={animals}
          />
        )}
        {openBatchHealthForm && (
          <BatchHealthRecordForm
            onAddBatchHealthRecords={handleAddBatchHealthRecords}
            onClose={() => setOpenBatchHealthForm(false)}
            animals={animals}
            healthData={healthData}
          />
        )}
        {openVaccinationForm && (
          <AddVaccinationForm
            onAddVaccination={handleAddVaccination}
            onClose={() => setOpenVaccinationForm(false)}
            animals={animals}
          />
        )}
        {openBatchVaccinationForm && (
          <BatchVaccinationForm
            onAddBatchVaccinations={handleBatchAddVaccinations}
            onClose={() => setOpenBatchVaccinationForm(false)}
            animals={animals}
            vaccinationData={vaccinationData}
          />
        )}
      </main>
    </div>
  );
};

const HealthRecordSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
  </TableRow>
);

const VaccinationSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
  </TableRow>
);

export default HealthPage; 