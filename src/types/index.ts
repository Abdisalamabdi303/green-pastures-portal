
export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface Animal {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  health: string;
  purchaseDate: string;
  purchasePrice: number;
  weight: number;
  gender: string;
  status: string;
  description?: string;
  imageUrl?: string;
  photoUrl?: string;
  isVaccinated?: boolean | string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface ChartData {
  name: string;
  amount: number;
}
