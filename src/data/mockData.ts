
import { Animal, Expense } from "../types";

// These are just sample mock data for development purposes
export const mockAnimals: Animal[] = [
  {
    id: "1",
    name: "Bessie",
    type: "Cow",
    breed: "Holstein",
    age: 4,
    health: "Good",
    purchaseDate: "2019-05-15",
    purchasePrice: 25000,
    weight: 600,
    gender: "Female",
    status: "Active",
    description: "Dairy cow with high milk production",
    isVaccinated: true,
  },
  {
    id: "2",
    name: "Wilbur",
    type: "Pig",
    breed: "Yorkshire",
    age: 2,
    health: "Excellent",
    purchaseDate: "2021-03-20",
    purchasePrice: 8000,
    weight: 180,
    gender: "Male",
    status: "Active",
    description: "Breeding boar",
    isVaccinated: true,
  },
  {
    id: "3",
    name: "Clucky",
    type: "Chicken",
    breed: "Rhode Island Red",
    age: 1,
    health: "Good",
    purchaseDate: "2022-01-10",
    purchasePrice: 500,
    weight: 2.5,
    gender: "Female",
    status: "Active",
    description: "Egg layer",
    isVaccinated: true,
  },
  {
    id: "4",
    name: "Billy",
    type: "Goat",
    breed: "Boer",
    age: 3,
    health: "Good",
    purchaseDate: "2020-07-12",
    purchasePrice: 7500,
    weight: 75,
    gender: "Male",
    status: "Active",
    description: "Meat goat",
    isVaccinated: true,
  },
  {
    id: "5",
    name: "Woolly",
    type: "Sheep",
    breed: "Merino",
    age: 2,
    health: "Excellent",
    purchaseDate: "2021-09-05",
    purchasePrice: 6000,
    weight: 65,
    gender: "Female",
    status: "Active",
    description: "Wool producer",
    isVaccinated: true,
  },
];

export const mockExpenses: Expense[] = [
  {
    id: "1",
    category: "Feed",
    amount: 5000,
    date: "2023-05-15",
    description: "Cattle feed",
    paymentMethod: "Cash",
    animalRelated: false,
    createdAt: null
  },
  {
    id: "2",
    category: "Medicine",
    amount: 1200,
    date: "2023-05-18",
    description: "Antibiotics",
    paymentMethod: "Bank Transfer",
    animalRelated: true,
    animalName: "Bessie",
    createdAt: null
  },
  {
    id: "3",
    category: "Supplies",
    amount: 3500,
    date: "2023-05-22",
    description: "Farming tools",
    paymentMethod: "Cash",
    animalRelated: false,
    createdAt: null
  },
  {
    id: "4",
    category: "Utilities",
    amount: 2800,
    date: "2023-05-25",
    description: "Electricity bill",
    paymentMethod: "UPI",
    animalRelated: false,
    createdAt: null
  },
  {
    id: "5",
    category: "Labor",
    amount: 8000,
    date: "2023-05-30",
    description: "Monthly wages",
    paymentMethod: "Bank Transfer",
    animalRelated: false,
    createdAt: null
  },
];

// Stat cards data for the dashboard
export const statCardsData = [
  { title: "Total Animals", value: 1578, unit: "" },
  { title: "Monthly Expenses", value: 275000, unit: "₹" },
  { title: "Profit/Loss", value: 125000, unit: "₹" },
];

// Expense chart data for the dashboard
export const expenseChartData = [
  { name: "Jan", amount: 240000 },
  { name: "Feb", amount: 255000 },
  { name: "Mar", amount: 262000 },
  { name: "Apr", amount: 258000 },
  { name: "May", amount: 265000 },
  { name: "Jun", amount: 275000 },
];
