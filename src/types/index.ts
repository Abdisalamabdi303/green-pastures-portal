import { Timestamp } from 'firebase/firestore';

export type AnimalStatus = 'active' | 'deceased';

export interface Animal {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  gender?: string;
  status: 'active' | 'sold' | 'deceased';
  purchaseDate?: Timestamp;
  purchasePrice?: number;
  sellingPrice?: number;
  sellingDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface HealthRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalType: string;
  condition: string;
  treatment: string;
  cost: number;
  date: Timestamp;
  notes?: string;
  createdAt: Timestamp;
}

export interface Vaccination {
  id: string;
  animalId: string;
  animalName: string;
  animalType: string;
  vaccine: string;
  status: string;
  cost?: number;
  date: Timestamp;
  notes?: string;
  createdAt: Timestamp;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: any;
  description: string;
  paymentMethod: string;
  animalRelated?: boolean;
  animalId?: string;
  animalName?: string;
  createdAt: any;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable: boolean;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TableSelection {
  selectedIds: Set<string>;
  isAllSelected: boolean;
}

export interface ChartData {
  name: string;
  value: number;
  amount?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Income {
  id: string;
  type: string;
  amount: number;
  date: Date | { toDate: () => Date };
  description: string;
  paymentMethod: string;
  animalRelated: boolean;
  animalId?: string;
  createdAt: Date | { toDate: () => Date };
  status: string;
  batchId?: string;
  totalBatchAmount?: number;
  animalsInBatch?: number;
}

export interface BatchHealthRecordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (records: Omit<HealthRecord, 'id' | 'createdAt'>[]) => Promise<void>;
  animals: Animal[];
  isLoading: boolean;
}

export interface BatchVaccinationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (vaccinations: Omit<Vaccination, 'id' | 'createdAt'>[]) => Promise<void>;
  animals: Animal[];
  isLoading: boolean;
}
