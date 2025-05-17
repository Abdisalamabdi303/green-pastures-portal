import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { User, HealthRecord, Vaccination } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Syringe,
  Plus
} from 'lucide-react';
import { formatDate } from '../utils/format';
import { healthServices, vaccinationServices } from '@/services/firebase';
import { toast } from 'sonner';

const HealthPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'vaccinations'>('records');
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchHealthData();
  }, [navigate]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const [records, vacs] = await Promise.all([
        healthServices.getHealthRecords(),
        vaccinationServices.getVaccinations()
      ]);
      setHealthRecords(records);
      setVaccinations(vacs);
    } catch (error) {
      console.error('Error fetching health data:', error);
      toast.error('Failed to load health records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHealthRecord = async (data: Omit<HealthRecord, 'id'>) => {
    try {
      const newRecord = await healthServices.addHealthRecord(data);
      setHealthRecords(prev => [newRecord, ...prev]);
      toast.success('Health record added successfully');
    } catch (error) {
      console.error('Error adding health record:', error);
      toast.error('Failed to add health record');
    }
  };

  const handleAddVaccination = async (data: Omit<Vaccination, 'id'>) => {
    try {
      const newVaccination = await vaccinationServices.addVaccination(data);
      setVaccinations(prev => [newVaccination, ...prev]);
      toast.success('Vaccination record added successfully');
    } catch (error) {
      console.error('Error adding vaccination:', error);
      toast.error('Failed to add vaccination');
    }
  };

  const handleDeleteHealthRecord = async (id: string) => {
    try {
      await healthServices.deleteHealthRecord(id);
      setHealthRecords(prev => prev.filter(record => record.id !== id));
      toast.success('Health record deleted successfully');
    } catch (error) {
      console.error('Error deleting health record:', error);
      toast.error('Failed to delete health record');
    }
  };

  const handleDeleteVaccination = async (id: string) => {
    try {
      await vaccinationServices.deleteVaccination(id);
      setVaccinations(prev => prev.filter(vac => vac.id !== id));
      toast.success('Vaccination record deleted successfully');
    } catch (error) {
      console.error('Error deleting vaccination:', error);
      toast.error('Failed to delete vaccination');
    }
  };

  const getStatusIcon = (status: HealthRecord['status']) => {
    switch (status) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'stable':
        return <Activity className="h-5 w-5 text-yellow-500" />;
      case 'recovered':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: HealthRecord['status']) => {
    switch (status) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'stable':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'recovered':
        return 'bg-green-50 text-green-700 border-green-100';
      default:
        return '';
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Health Management</h1>
            <button 
              onClick={() => {
                // TODO: Open add record modal based on active tab
                if (activeTab === 'records') {
                  // Open health record form
                } else {
                  // Open vaccination form
                }
              }}
              className="flex items-center px-4 py-2 bg-farm-600 text-white rounded-md hover:bg-farm-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Record
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('records')}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeTab === 'records'
                  ? 'bg-farm-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Activity className="h-5 w-5 mr-2" />
              Health Records
            </button>
            <button
              onClick={() => setActiveTab('vaccinations')}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeTab === 'vaccinations'
                  ? 'bg-farm-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Syringe className="h-5 w-5 mr-2" />
              Vaccinations
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-farm-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading records...</p>
              </div>
            ) : activeTab === 'records' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {healthRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(record.status)}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(record.status)}`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{record.animalName}</div>
                        <div className="text-sm text-gray-500">ID: {record.animalId}</div>
                      </TableCell>
                      <TableCell>{record.condition}</TableCell>
                      <TableCell>{formatDate(record.date.toString())}</TableCell>
                      <TableCell>{record.treatment}</TableCell>
                      <TableCell>{record.notes}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleDeleteHealthRecord(record.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead>Vaccine</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vaccinations.map((vaccination) => (
                    <TableRow key={vaccination.id}>
                      <TableCell>
                        <div className="flex items-center">
                          {vaccination.administered ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            vaccination.administered
                              ? 'bg-green-50 text-green-700'
                              : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {vaccination.administered ? 'Completed' : 'Scheduled'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{vaccination.animalName}</div>
                        <div className="text-sm text-gray-500">ID: {vaccination.animalId}</div>
                      </TableCell>
                      <TableCell>{vaccination.vaccineName}</TableCell>
                      <TableCell>{formatDate(vaccination.date.toString())}</TableCell>
                      <TableCell>{formatDate(vaccination.nextDueDate.toString())}</TableCell>
                      <TableCell>{vaccination.notes}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleDeleteVaccination(vaccination.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HealthPage; 