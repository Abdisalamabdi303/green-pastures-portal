export type AnimalStatus = 'active' | 'deceased';

export interface Animal {
  id: string;
  name?: string;
  type?: string;
  breed?: string;
  age?: number;
  gender?: 'male' | 'female';
  weight?: number;
  price: number;
  status: AnimalStatus;
  health?: string;
  isVaccinated?: boolean;
  purchasePrice?: number;
  purchaseDate?: string;
  photoUrl?: string;
  notes?: string;
  createdAt?: any;
  expenseId?: string;
  updatedAt: Date;
  incomeId?: string;
}

export interface HealthRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalType: string;
  condition: 'healthy' | 'sick' | 'injured' | 'pregnant';
  treatment: string;
  date: any;
  cost: number;
  notes: string;
  createdAt: any;
}

export interface Vaccination {
  id: string;
  animalId: string;
  animalName: string;
  animalType: string;
  vaccineName: string;
  date: any;
  nextDueDate: any;
  administered: boolean;
  notes: string;
  cost?: number;
  createdAt: any;
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
