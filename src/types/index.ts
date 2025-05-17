import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Animal {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  weight: number;
  status: string;
  health: string;
  notes: string;
  createdAt: Timestamp;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: Timestamp | string;
  description: string;
  paymentMethod: string;
  animalRelated: boolean;
  animalName?: string;
  createdAt: Timestamp;
}

export interface HealthRecord {
  id: string;
  animalId: string;
  animalName: string;
  condition: string;
  status: 'critical' | 'stable' | 'recovered';
  date: Timestamp | string;
  treatment: string;
  notes: string;
  createdAt: Timestamp;
}

export interface Vaccination {
  id: string;
  animalId: string;
  animalName: string;
  vaccineName: string;
  date: Timestamp | string;
  nextDueDate: Timestamp | string;
  administered: boolean;
  notes: string;
  createdAt: Timestamp;
}

export interface ChartData {
  name: string;
  amount: number;
  color?: string;
}
