
import { Animal, Expense, StatCard, ChartData } from '../types';

// Mock data for the dashboard
export const statCardsData: StatCard[] = [
  { title: 'Total Animals', value: 1578 },
  { title: 'Monthly Expenses', value: 275000, unit: '$' },
  { title: 'Profit/Loss', value: 125000, unit: '$' }
];

export const expenseChartData: ChartData[] = [
  { name: 'Jan', amount: 240000 },
  { name: 'Feb', amount: 255000 },
  { name: 'Mar', amount: 262000 },
  { name: 'Apr', amount: 258000 },
  { name: 'May', amount: 265000 },
  { name: 'Jun', amount: 275000 },
];

// Mock data for animals
export const animalData: Animal[] = [
  { id: '1', type: 'Cow', breed: 'Holstein', age: 3, health: 'Good' },
  { id: '2', type: 'Cow', breed: 'Jersey', age: 2, health: 'Excellent' },
  { id: '3', type: 'Goat', breed: 'Alpine', age: 1, health: 'Good' },
  { id: '4', type: 'Chicken', breed: 'Rhode Island Red', age: 1, health: 'Fair' },
  { id: '5', type: 'Pig', breed: 'Yorkshire', age: 2, health: 'Good' },
];

// Mock data for expenses
export const expenseData: Expense[] = [
  { id: '1', category: 'Feed', amount: 45000, date: '2025-04-15', description: 'Monthly feed supply' },
  { id: '2', category: 'Veterinary', amount: 12000, date: '2025-04-10', description: 'Routine checkups' },
  { id: '3', category: 'Equipment', amount: 35000, date: '2025-04-05', description: 'New tractor parts' },
  { id: '4', category: 'Labor', amount: 85000, date: '2025-04-01', description: 'Staff salaries' },
  { id: '5', category: 'Utilities', amount: 18000, date: '2025-04-20', description: 'Electricity and water' },
];
