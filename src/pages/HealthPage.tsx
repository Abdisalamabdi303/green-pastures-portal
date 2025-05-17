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
  Plus,
  Trash2,
  Calendar,
  FileText,
  Stethoscope
} from 'lucide-react';
import { formatDate } from '../utils/format';
import { healthServices, vaccinationServices, animalServices } from '@/services/firebase';
import { toast } from 'sonner';
import AddHealthRecordForm from '@/components/health/AddHealthRecordForm';
import AddVaccinationForm from '@/components/health/AddVaccinationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const HealthPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'vaccinations'>('records');
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [animals, setAnimals] = useState<Array<{ id: string; name: string; }>>([]);
  const [openHealthForm, setOpenHealthForm] = useState(false);
  const [openVaccinationForm, setOpenVaccinationForm] = useState(false);
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
      const [records, vacs, animalsList] = await Promise.all([
        healthServices.getHealthRecords(),
        vaccinationServices.getVaccinations(),
        animalServices.getAnimals()
      ]);
      setHealthRecords(records);
      setVaccinations(vacs);
      setAnimals(animalsList.map(animal => ({ id: animal.id, name: animal.name })));
    } catch (error) {
      console.error('Error fetching health data:', error);
      toast.error('Failed to load health records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHealthRecord = async (data: Omit<HealthRecord, 'id' | 'createdAt'>) => {
    try {
      const newRecord = await healthServices.addHealthRecord(data);
      setHealthRecords(prev => [newRecord, ...prev]);
      toast.success('Health record added successfully');
    } catch (error) {
      console.error('Error adding health record:', error);
      toast.error('Failed to add health record');
    }
  };

  const handleAddVaccination = async (data: Omit<Vaccination, 'id' | 'createdAt'>) => {
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
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'recovered':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
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

  const criticalCount = healthRecords.filter(r => r.status === 'critical').length;
  const stableCount = healthRecords.filter(r => r.status === 'stable').length;
  const recoveredCount = healthRecords.filter(r => r.status === 'recovered').length;
  const upcomingVaccinations = vaccinations.filter(v => !v.administered).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Health Management</h1>
          <p className="mt-2 text-gray-600">Monitor and manage animal health records and vaccinations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <span className="text-2xl font-bold text-red-600">{criticalCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Stable Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Activity className="h-8 w-8 text-yellow-500" />
                <span className="text-2xl font-bold text-yellow-600">{stableCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recovered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <span className="text-2xl font-bold text-green-600">{recoveredCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Vaccinations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Calendar className="h-8 w-8 text-blue-500" />
                <span className="text-2xl font-bold text-blue-600">{upcomingVaccinations}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex space-x-2 p-1 bg-muted rounded-lg">
            <Button
              variant={activeTab === 'records' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('records')}
              className="gap-2"
            >
              <Stethoscope className="h-4 w-4" />
              Health Records
            </Button>
            <Button
              variant={activeTab === 'vaccinations' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('vaccinations')}
              className="gap-2"
            >
              <Syringe className="h-4 w-4" />
              Vaccinations
            </Button>
          </div>

          <Button
            onClick={() => {
              if (activeTab === 'records') {
                setOpenHealthForm(true);
              } else {
                setOpenVaccinationForm(true);
              }
            }}
            size="sm"
            className="bg-farm-600 hover:bg-farm-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {activeTab === 'records' ? 'Health Record' : 'Vaccination'}
          </Button>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-farm-600 border-t-transparent mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading records...</p>
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
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {healthRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No health records found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    healthRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`flex items-center gap-1 w-fit ${getStatusClass(record.status)}`}
                          >
                            {getStatusIcon(record.status)}
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{record.animalName}</div>
                          <div className="text-xs text-muted-foreground">ID: {record.animalId}</div>
                        </TableCell>
                        <TableCell>{record.condition}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(record.date.toString())}
                          </div>
                        </TableCell>
                        <TableCell>{record.treatment}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={record.notes}>
                            {record.notes || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteHealthRecord(record.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vaccinations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Syringe className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No vaccination records found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    vaccinations.map((vaccination) => (
                      <TableRow key={vaccination.id}>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`flex items-center gap-1 w-fit ${
                              vaccination.administered
                                ? 'bg-green-50 text-green-700 border-green-100'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                            }`}
                          >
                            {vaccination.administered ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                            {vaccination.administered ? 'Completed' : 'Scheduled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{vaccination.animalName}</div>
                          <div className="text-xs text-muted-foreground">ID: {vaccination.animalId}</div>
                        </TableCell>
                        <TableCell>{vaccination.vaccineName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(vaccination.date.toString())}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(vaccination.nextDueDate.toString())}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={vaccination.notes}>
                            {vaccination.notes || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVaccination(vaccination.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Form Dialogs */}
      <AddHealthRecordForm
        open={openHealthForm}
        onOpenChange={setOpenHealthForm}
        onSubmit={handleAddHealthRecord}
        animals={animals}
      />
      <AddVaccinationForm
        open={openVaccinationForm}
        onOpenChange={setOpenVaccinationForm}
        onSubmit={handleAddVaccination}
        animals={animals}
      />
    </div>
  );
};

export default HealthPage; 