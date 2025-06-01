import { useState } from 'react';
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

const HealthPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
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

  const handleAddHealthRecord = async (data: Omit<HealthRecord, 'id' | 'createdAt'>) => {
    try {
      console.log('HealthPage: Adding health record:', data);
      await addHealthRecord([data]); // Wrap single record in array
      setOpenHealthForm(false);
    } catch (error) {
      console.error('Error adding health record:', error);
    }
  };

  const handleAddVaccination = async (data: Omit<Vaccination, 'id' | 'createdAt'>) => {
    try {
      console.log('HealthPage: Adding vaccination:', data);
      await addVaccination(data);
      setOpenVaccinationForm(false);
    } catch (error) {
      console.error('Error adding vaccination:', error);
    }
  };

  const handleAddBatchVaccinations = async (vaccinations: Omit<Vaccination, 'id' | 'createdAt'>[]) => {
    try {
      console.log('HealthPage: Starting batch vaccination submission');
      console.log('Number of vaccinations to add:', vaccinations.length);
      
      // Validate vaccinations
      vaccinations.forEach((vaccination, index) => {
        console.log(`Validating vaccination ${index}:`, vaccination);
        
        // Check for required fields
        const requiredFields = ['animalId', 'animalName', 'animalType', 'vaccineName', 'date', 'nextDueDate'];
        const missingFields = requiredFields.filter(field => !vaccination[field as keyof typeof vaccination]);
        
        if (missingFields.length > 0) {
          console.error('Missing required fields:', missingFields);
          throw new Error(`Invalid vaccination data at index ${index}: Missing fields ${missingFields.join(', ')}`);
        }

        // Validate dates
        if (!(vaccination.date instanceof Timestamp) || !(vaccination.nextDueDate instanceof Timestamp)) {
          console.error('Invalid date format:', { date: vaccination.date, nextDueDate: vaccination.nextDueDate });
          throw new Error(`Invalid vaccination data at index ${index}: Invalid date format`);
        }
      });

      // Process vaccinations
      const batchVaccinations = vaccinations.map(vaccination => ({
        ...vaccination,
        date: vaccination.date instanceof Timestamp ? vaccination.date : Timestamp.fromDate(new Date(vaccination.date)),
        nextDueDate: vaccination.nextDueDate instanceof Timestamp ? vaccination.nextDueDate : Timestamp.fromDate(new Date(vaccination.nextDueDate)),
        createdAt: Timestamp.now(),
      }));

      console.log('Processed batch vaccinations:', batchVaccinations);
      
      // Submit to database
      await batchAddVaccinations(batchVaccinations);
      console.log('Batch vaccinations added successfully');
      
      setOpenBatchVaccinationForm(false);
    } catch (error) {
      console.error('Error adding batch vaccinations:', error);
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
    }
  };

  const handleUpdateHealthRecord = async (id: string, data: Partial<HealthRecord>) => {
    try {
      await updateHealthRecord({ id, data });
    } catch (error) {
      console.error('Error updating health record:', error);
    }
  };

  const handleUpdateVaccination = async (id: string, data: Partial<Vaccination>) => {
    try {
      await updateVaccination({ id, data });
    } catch (error) {
      console.error('Error updating vaccination:', error);
    }
  };

  const handleDeleteHealthRecord = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this health record?')) {
      try {
        await deleteHealthRecord(id);
      } catch (error) {
        console.error('Error deleting health record:', error);
      }
    }
  };

  const handleDeleteVaccination = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vaccination record?')) {
      try {
        await deleteVaccination(id);
      } catch (error) {
        console.error('Error deleting vaccination:', error);
      }
    }
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
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
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
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <button
              type="button"
              onClick={() => setOpenHealthForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-farm-600 hover:bg-farm-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500"
            >
              Add Health Record
            </button>
            <button
              type="button"
              onClick={() => setOpenBatchHealthForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-farm-600 hover:bg-farm-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500"
            >
              Batch Health Record
            </button>
            <button
              type="button"
              onClick={() => setOpenVaccinationForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-farm-600 hover:bg-farm-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500"
            >
              Add Vaccination
            </button>
            <button
              type="button"
              onClick={() => setOpenBatchVaccinationForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-farm-600 hover:bg-farm-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500"
            >
              Batch Vaccination
            </button>
          </div>
        </div>

        <HealthFilters onFilterChange={handleFilterChange} />

        {/* Health Records Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Health Records
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {isLoadingHealth ? (
              <div className="p-4 text-center">Loading...</div>
            ) : filteredHealthRecords.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No health records found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Animal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Treatment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredHealthRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.animalName}</div>
                          <div className="text-sm text-gray-500">{record.animalId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.condition === 'healthy' ? 'bg-green-100 text-green-800' :
                            record.condition === 'sick' ? 'bg-red-100 text-red-800' :
                            record.condition === 'injured' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {record.condition}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.treatment}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${record.cost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleUpdateHealthRecord(record.id, { ...record, condition: 'healthy' })}
                            className="text-farm-600 hover:text-farm-900 mr-4"
                          >
                            Mark Healthy
                          </button>
                          <button
                            onClick={() => handleDeleteHealthRecord(record.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Vaccinations Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Vaccinations
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {isLoadingVaccinations ? (
              <div className="p-4 text-center">Loading...</div>
            ) : filteredVaccinations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No vaccination records found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Animal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vaccine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Due
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVaccinations.map((vaccination) => (
                      <tr key={vaccination.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {vaccination.animalId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vaccination.animalType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {vaccination.vaccineName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(vaccination.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(vaccination.nextDueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            new Date(vaccination.nextDueDate) > new Date() ? 'bg-green-100 text-green-800' :
                            new Date(vaccination.nextDueDate) < new Date() ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {new Date(vaccination.nextDueDate) > new Date() ? 'Up to Date' :
                             new Date(vaccination.nextDueDate) < new Date() ? 'Overdue' :
                             'Due'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleUpdateVaccination(vaccination.id, { ...vaccination, administered: true })}
                            className="text-farm-600 hover:text-farm-900 mr-4"
                          >
                            Mark Administered
                          </button>
                          <button
                            onClick={() => handleDeleteVaccination(vaccination.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

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
              Page {currentPage} of {Math.max(1, vaccinationData?.totalPages || 1)}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= Math.max(1, vaccinationData?.totalPages || 1)}
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
            onAddBatchVaccinations={handleAddBatchVaccinations}
            onClose={() => setOpenBatchVaccinationForm(false)}
            animals={animals}
            vaccinationData={vaccinationData}
          />
        )}
      </main>
    </div>
  );
};

export default HealthPage; 