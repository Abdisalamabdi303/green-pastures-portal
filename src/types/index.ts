import { Timestamp } from 'firebase/firestore';

export type AnimalStatus = 'active' | 'deceased';

export interface Animal {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  weight: number;
  status: 'active' | 'sold' | 'deceased';
  purchaseDate?: Date;
  purchasePrice?: number;
  notes?: string;
  imageUrl?: string;
  updatedAt?: Date | Timestamp;
  createdAt?: Date | Timestamp;
}

export interface HealthRecord {
  id: string;
  animalId: string;
  date: Date;
  condition: string;
  treatment: string;
  notes?: string;
  followUpDate?: Date;
  cost?: number;
  veterinarian?: string;
}

export interface Vaccination {
  id: string;
  animalId: string;
  date: Date;
  type: string;
  nextDueDate?: Date;
  notes?: string;
  cost?: number;
  administrator?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: Date;
  description: string;
  paymentMethod: string;
  animalRelated?: boolean;
  animalId?: string;
  animalName?: string;
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
  date: Date;
  description: string;
  paymentMethod: string;
  animalRelated: boolean;
  animalId?: string;
  createdAt: Date;
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
