import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import ExpenseChart from "@/components/expenses/ExpenseChart";
import ExpenseSummary from "@/components/expenses/ExpenseSummary";
import { ExpensesHeader } from "@/components/expenses/ExpensesHeader";
import { ExpensesMonthFilter } from "@/components/expenses/ExpensesMonthFilter";
import { ExpensesTabContent } from "@/components/expenses/ExpensesTabContent";
import AddExpenseForm from "@/components/expenses/AddExpenseForm";
import { Expense, ExpenseFormValues } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Timestamp } from "firebase/firestore";

export default function Expenses() {
  const { expenses, animals, loading, addExpense, deleteExpense } = useExpenses();
  const { toast } = useToast();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  // Filter expenses by the selected month
  const filteredExpenses = expenses.filter(expense => {
    let expenseDate;
    if (expense.date) {
      if (typeof expense.date === 'object' && 'toDate' in expense.date && typeof expense.date.toDate === 'function') {
        expenseDate = expense.date.toDate();
      } else {
        expenseDate = new Date(expense.date);
      }
      const expenseMonth = expenseDate.toISOString().slice(0, 7);
      return expenseMonth === filterMonth;
    }
    return false;
  });

  // Calculate total for filtered expenses
  const totalExpenses = filteredExpenses.reduce(
    (total, expense) => total + expense.amount, 
    0
  );

  // Get expense data by category
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    if (expense.category) {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const handleAddExpense = async (data: ExpenseFormValues) => {
    try {
      // Convert the form data to match the database schema
      const expenseData: Expense = {
        ...data,
        date: Timestamp.fromDate(new Date(data.date)),
        createdAt: Timestamp.now(),
        animalId: data.animalRelated && data.animalName 
          ? animals.find(a => a.name === data.animalName)?.id 
          : undefined
      };

      const success = await addExpense(expenseData);
      if (success) {
        toast({
          title: "Success",
          description: "Expense has been added successfully",
        });
        setIsAddExpenseOpen(false);
      } else {
        throw new Error("Failed to add expense");
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to let the form handle the error state
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <Button
            onClick={() => setIsAddExpenseOpen(true)}
            className="bg-farm-600 hover:bg-farm-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <ExpenseSummary
            title="Total Expenses"
            value={totalExpenses}
            icon="💰"
          />
          <ExpenseSummary
            title="Average Expense"
            value={totalExpenses / (filteredExpenses.length || 1)}
            icon="📊"
          />
          <ExpenseSummary
            title="Highest Category"
            value={Math.max(...Object.values(expensesByCategory))}
            icon="📈"
          />
          <ExpenseSummary
            title="Number of Expenses"
            value={filteredExpenses.length}
            icon="📝"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ExpenseChart
            title="Expenses by Category"
            data={Object.entries(expensesByCategory).map(([name, value]) => ({
              name,
              value
            }))}
          />
          <ExpenseChart
            title="Monthly Trend"
            data={filteredExpenses.map(expense => ({
              name: new Date(expense.date.toDate()).toLocaleDateString(),
              value: expense.amount
            }))}
          />
        </div>

        <ExpensesMonthFilter
          selectedMonth={filterMonth}
          onMonthChange={setFilterMonth}
        />

        <ExpensesTabContent
          expenses={filteredExpenses}
          onDeleteExpense={deleteExpense}
        />

        <AddExpenseForm
          handleAddExpense={handleAddExpense}
          isAddExpenseOpen={isAddExpenseOpen}
          setIsAddExpenseOpen={setIsAddExpenseOpen}
          animals={animals}
        />
      </div>
    </Layout>
  );
}
