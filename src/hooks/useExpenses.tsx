import { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  Timestamp,
  orderBy,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Expense, Animal } from "@/types";
import { differenceInYears } from 'date-fns';

export const expenseSchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  amount: z.number().min(0, { message: "Amount must be a positive number" }),
  date: z.string(),
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
  animalRelated: z.boolean().default(false),
  animalName: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export function useExpenses() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchExpensesAndAnimals();
  }, []);
  
  const fetchExpensesAndAnimals = async () => {
    try {
      setLoading(true);
      
      // Fetch animals first
      const animalsQuery = query(collection(db, "animals"));
      const animalsSnapshot = await getDocs(animalsQuery);
      
      const animalsList: Animal[] = [];
      animalsSnapshot.forEach((doc) => {
        const animal = doc.data();
        animalsList.push({ 
          id: doc.id, 
          name: animal.name,
          type: animal.type || '',
          breed: animal.breed || '',
          birthDate: animal.birthDate ? animal.birthDate.toDate() : new Date(),
          gender: animal.gender || 'male',
          weight: animal.weight || 0,
          status: animal.status || 'active',
          purchaseDate: animal.purchaseDate ? animal.purchaseDate.toDate() : undefined,
          purchasePrice: animal.purchasePrice || undefined,
          notes: animal.notes,
          imageUrl: animal.imageUrl
        });
      });
      
      setAnimals(animalsList);
      
      // Then fetch expenses
      const q = query(collection(db, "expenses"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      
      const expensesList: Expense[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const expense: Expense = {
          id: doc.id,
          category: String(data.category || ''),
          amount: Number(data.amount || 0),
          date: data.date?.toDate() || new Date(),
          description: String(data.description || ''),
          paymentMethod: String(data.paymentMethod || ''),
          animalName: data.animalName ? String(data.animalName) : undefined,
          animalRelated: Boolean(data.animalRelated),
          animalId: data.animalId ? String(data.animalId) : undefined
        };
        expensesList.push(expense);
      });
      
      setExpenses(expensesList);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load expenses data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Expense): Promise<boolean> => {
    try {
      const expenseData = {
        ...expense,
        date: expense.date instanceof Date ? Timestamp.fromDate(expense.date) : expense.date,
      };
      
      // If not animal related, remove animalName and animalId
      if (!expense.animalRelated) {
        delete expenseData.animalName;
        delete expenseData.animalId;
      }
      
      const docRef = await addDoc(collection(db, "expenses"), expenseData);
      
      if (!docRef.id) {
        throw new Error("Failed to add expense");
      }
      
      // Add the new expense to the local state
      setExpenses(prev => [{
        ...expense,
        id: docRef.id,
        date: expenseData.date.toDate()
      }, ...prev]);
      
      toast({
        title: "Expense Added",
        description: `${expense.description} expense has been recorded`,
      });
      
      return true;
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error",
        description: "Failed to record expense",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteExpense = async (id: string, description: string) => {
    if (confirm(`Are you sure you want to delete the expense: ${description}?`)) {
      try {
        await deleteDoc(doc(db, "expenses", id));
        
        toast({
          title: "Expense Deleted",
          description: `${description} has been removed`,
        });
        
        // Update local state
        setExpenses(expenses.filter(expense => expense.id !== id));
        return true;
      } catch (error) {
        console.error("Error deleting expense:", error);
        toast({
          title: "Error",
          description: "Failed to delete expense",
          variant: "destructive",
        });
        return false;
      }
    }
    return false;
  };

  return {
    expenses,
    animals,
    loading,
    addExpense,
    deleteExpense,
    fetchExpensesAndAnimals
  };
}
