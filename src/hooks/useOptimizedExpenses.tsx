
import { useState, useEffect, useCallback } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  Timestamp,
  orderBy,
  deleteDoc,
  doc,
  limit,
  startAfter
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Expense, Animal } from "@/types";

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

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ITEMS_PER_PAGE = 20;

// Cache outside component to persist between renders
const cache = new Map<string, { data: any; timestamp: number }>();

export function useOptimizedExpenses() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  
  // Check cache first
  const getCachedData = useCallback((key: string) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  // Set cache
  const setCachedData = useCallback((key: string, data: any) => {
    cache.set(key, { data, timestamp: Date.now() });
  }, []);
  
  const fetchAnimals = useCallback(async () => {
    const cachedAnimals = getCachedData('animals');
    if (cachedAnimals) {
      setAnimals(cachedAnimals);
      return;
    }

    try {
      const animalsQuery = query(collection(db, "animals"), limit(100)); // Limit initial load
      const animalsSnapshot = await getDocs(animalsQuery);
      
      const animalsList: Animal[] = animalsSnapshot.docs.map(doc => {
        const animal = doc.data();
        return { 
          id: doc.id, 
          name: animal.name,
          type: animal.type || '',
          breed: animal.breed || '',
          age: animal.age || 0,
          health: animal.health || '',
          purchaseDate: animal.purchaseDate || '',
          purchasePrice: animal.purchasePrice || 0,
          weight: animal.weight || 0,
          gender: animal.gender || '',
          status: animal.status || '',
          description: animal.description,
          imageUrl: animal.imageUrl,
          photoUrl: animal.photoUrl,
          isVaccinated: animal.isVaccinated || false
        };
      });
      
      setAnimals(animalsList);
      setCachedData('animals', animalsList);
    } catch (error) {
      console.error("Error fetching animals:", error);
    }
  }, [getCachedData, setCachedData]);

  const fetchExpenses = useCallback(async (loadMore = false) => {
    const cacheKey = loadMore ? `expenses_page_${Math.floor(expenses.length / ITEMS_PER_PAGE)}` : 'expenses';
    
    if (!loadMore) {
      const cachedExpenses = getCachedData(cacheKey);
      if (cachedExpenses) {
        setExpenses(cachedExpenses);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      
      let q = query(
        collection(db, "expenses"), 
        orderBy("date", "desc"), 
        limit(ITEMS_PER_PAGE)
      );

      if (loadMore && lastDoc) {
        q = query(
          collection(db, "expenses"),
          orderBy("date", "desc"),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        return;
      }

      const newExpenses: Expense[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          category: data.category || '',
          amount: data.amount || 0,
          date: data.date || null,
          description: data.description || '',
          createdAt: data.createdAt || null,
          paymentMethod: data.paymentMethod || '',
          animalName: data.animalName || '',
          animalRelated: data.animalRelated || false,
          animalId: data.animalId
        };
      });
      
      if (loadMore) {
        setExpenses(prev => [...prev, ...newExpenses]);
      } else {
        setExpenses(newExpenses);
        setCachedData(cacheKey, newExpenses);
      }

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === ITEMS_PER_PAGE);
      
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast({
        title: "Error",
        description: "Failed to load expenses data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [expenses.length, getCachedData, setCachedData, lastDoc, toast]);

  const loadMoreExpenses = useCallback(() => {
    if (!loading && hasMore) {
      fetchExpenses(true);
    }
  }, [loading, hasMore, fetchExpenses]);

  const addExpense = useCallback(async (expense: Expense): Promise<boolean> => {
    try {
      const expenseData = {
        ...expense,
        date: expense.date instanceof Timestamp ? expense.date : Timestamp.fromDate(new Date(expense.date)),
        createdAt: Timestamp.now(),
      };
      
      if (!expense.animalRelated) {
        delete expenseData.animalName;
        delete expenseData.animalId;
      }
      
      const docRef = await addDoc(collection(db, "expenses"), expenseData);
      
      if (!docRef.id) {
        throw new Error("Failed to add expense");
      }
      
      // Add to beginning of list for immediate feedback
      setExpenses(prev => [{
        ...expenseData,
        id: docRef.id
      }, ...prev]);
      
      // Clear cache to force refresh on next load
      cache.clear();
      
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
  }, [toast]);

  const deleteExpense = useCallback(async (id: string, description: string) => {
    if (confirm(`Are you sure you want to delete the expense: ${description}?`)) {
      try {
        await deleteDoc(doc(db, "expenses", id));
        
        toast({
          title: "Expense Deleted",
          description: `${description} has been removed`,
        });
        
        // Optimistic update
        setExpenses(prev => prev.filter(expense => expense.id !== id));
        
        // Clear cache
        cache.clear();
        
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
  }, [toast]);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchAnimals(), fetchExpenses()]);
    };
    initializeData();
  }, [fetchAnimals, fetchExpenses]);

  return {
    expenses,
    animals,
    loading,
    hasMore,
    addExpense,
    deleteExpense,
    loadMoreExpenses,
    refetch: () => {
      cache.clear();
      fetchExpenses();
      fetchAnimals();
    }
  };
}
