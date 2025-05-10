
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Animal {
  id: string;
  type: string;
  breed: string;
  age: number;
  health: string;
  weight?: number;
  photoUrl?: string; // Add photoUrl property for storing the image
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface StatCard {
  title: string;
  value: number | string;
  unit?: string;
  icon?: string;
}

export interface ChartData {
  name: string;
  amount: number;
}
