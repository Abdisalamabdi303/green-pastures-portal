import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Animal {
  id: string;
  name?: string;
  type: string;
  breed?: string;
  age?: number;
  gender?: string;
  weight?: number;
  purchaseDate?: string;
  purchasePrice?: number;
  status: 'active' | 'sold' | 'deceased';
  notes?: string;
  createdAt: any; // Firestore Timestamp
  health?: string;
  photoUrl?: string;
  isVaccinated?: boolean;
  expenseId?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: any; // Firestore Timestamp
  description: string;
  createdAt: any; // Firestore Timestamp
  paymentMethod: string;
  animalRelated: boolean;
  animalId?: string;
  animalName?: string;
}

export interface HealthRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalType: string;
  condition: 'healthy' | 'sick' | 'injured' | 'pregnant';
  treatment: string;
  date: string | any; // Firestore Timestamp
  cost: number;
  notes?: string;
  createdAt: any; // Firestore Timestamp
}

export interface Vaccination {
  id: string;
  animalId: string;
  animalName: string;
  animalType: string;
  vaccineName: string;
  date: string | any; // Firestore Timestamp
  nextDueDate: string | any; // Firestore Timestamp
  administered: boolean;
  notes?: string;
  createdAt: any; // Firestore Timestamp
}

export interface ChartData {
  name: string;
  value: number;
  amount?: number;
  color?: string;
}
