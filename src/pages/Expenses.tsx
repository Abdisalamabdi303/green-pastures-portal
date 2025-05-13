
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Plus,
  Banknote
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExpenses, expenseSchema, ExpenseFormValues } from "@/hooks/useExpenses";
import ExpenseChart from "@/components/expenses/ExpenseChart";
import ExpenseSummary from "@/components/expenses/ExpenseSummary";
import { ExpensesDialogForm } from "@/components/expenses/ExpensesDialogForm";
import { ExpensesHeader } from "@/components/expenses/ExpensesHeader";
import { ExpensesMonthFilter } from "@/components/expenses/ExpensesMonthFilter";
import { ExpensesTabContent } from "@/components/expenses/ExpensesTabContent";
import { Expense } from "@/types";

export default function Expenses() {
  const { expenses, animals, loading, addExpense, deleteExpense } = useExpenses();
  const [openDialog, setOpenDialog] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "",
      description: "",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: "Cash",
      animalRelated: false,
      animalName: "",
    },
  });

  const watchAnimalRelated = form.watch("animalRelated");

  const onSubmit = async (data: ExpenseFormValues) => {
    const success = await addExpense(data);
    if (success) {
      form.reset();
      setOpenDialog(false);
    }
  };

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

  // Prepare data for pie chart
  const COLORS = ['#94cf43', '#c1986a', '#6b768a', '#6b8e23', '#cd853f'];
  const pieChartData = Object.keys(expensesByCategory).map((category, index) => ({
    name: category,
    value: expensesByCategory[category],
    color: COLORS[index % COLORS.length],
  }));

  // Format the month year for display
  const formattedPeriod = new Date(filterMonth + "-01").toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <Layout>
      <div className="space-y-6">
        <ExpensesHeader setOpenDialog={setOpenDialog} />
        
        <div className="grid gap-4 md:grid-cols-12">
          <ExpenseChart 
            data={pieChartData}
            title="Monthly Expenses"
            description={`Breakdown of expenses for ${formattedPeriod}`}
          />
          
          <ExpenseSummary
            totalExpenses={totalExpenses}
            expensesByCategory={expensesByCategory}
            period={formattedPeriod}
          />
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Expenses</TabsTrigger>
              <TabsTrigger value="monthly">Monthly View</TabsTrigger>
            </TabsList>
            
            <ExpensesMonthFilter filterMonth={filterMonth} setFilterMonth={setFilterMonth} />
          </div>
          
          <TabsContent value="all" className="space-y-4">
            <ExpensesTabContent 
              expenses={expenses as Expense[]} 
              loading={loading} 
              deleteExpense={deleteExpense} 
              isFiltered={false} 
            />
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-4">
            <ExpensesTabContent 
              expenses={filteredExpenses as Expense[]} 
              loading={loading} 
              deleteExpense={deleteExpense} 
              isFiltered={true} 
            />
          </TabsContent>
        </Tabs>
        
        <ExpensesDialogForm 
          form={form}
          onSubmit={onSubmit}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          watchAnimalRelated={watchAnimalRelated}
          animals={animals}
        />
      </div>
    </Layout>
  );
}
