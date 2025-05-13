
import { Expense } from "@/types";
import { Banknote } from "lucide-react";
import ExpenseTable from "./ExpenseTable";

interface ExpensesTabContentProps {
  expenses: Expense[];
  loading: boolean;
  deleteExpense: (id: string, description: string) => Promise<boolean>;
  isFiltered: boolean;
}

export function ExpensesTabContent({ expenses, loading, deleteExpense, isFiltered }: ExpensesTabContentProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-farm-500 border-t-transparent"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading expenses...</p>
      </div>
    );
  }
  
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/20">
        <Banknote className="h-10 w-10 mx-auto text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">
          {isFiltered ? "No expenses for selected month" : "No expenses recorded"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isFiltered 
            ? "Try selecting a different month or add new expenses" 
            : "Start tracking your farm expenses by clicking the \"Record Expense\" button"}
        </p>
      </div>
    );
  }
  
  return (
    <ExpenseTable 
      expenses={expenses}
      deleteExpense={deleteExpense}
      isFiltered={isFiltered}
    />
  );
}
