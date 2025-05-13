
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
  Calendar,
  Filter,
  Banknote
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useExpenses, expenseSchema, ExpenseFormValues } from "@/hooks/useExpenses";
import ExpenseChart from "@/components/expenses/ExpenseChart";
import ExpenseSummary from "@/components/expenses/ExpenseSummary";
import ExpenseTable from "@/components/expenses/ExpenseTable";

const COLORS = ['#94cf43', '#c1986a', '#6b768a', '#6b8e23', '#cd853f'];

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
    const expenseDate = expense.date.toDate();
    const expenseMonth = expenseDate.toISOString().slice(0, 7);
    return expenseMonth === filterMonth;
  });

  // Calculate total for filtered expenses
  const totalExpenses = filteredExpenses.reduce(
    (total, expense) => total + expense.amount, 
    0
  );

  // Get expense data by category
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Prepare data for pie chart
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Expense Tracker</h1>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="mt-2 sm:mt-0 bg-farm-600 hover:bg-farm-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Record Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Record New Expense</DialogTitle>
                <DialogDescription>
                  Enter the details of your farm expense
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Feed">Feed</SelectItem>
                                <SelectItem value="Medicine">Medicine</SelectItem>
                                <SelectItem value="Supplies">Supplies</SelectItem>
                                <SelectItem value="Labor">Labor</SelectItem>
                                <SelectItem value="Utilities">Utilities</SelectItem>
                                <SelectItem value="Transport">Transport</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="Amount"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="animalRelated"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2 space-y-0">
                        <FormControl>
                          <Input 
                            type="checkbox" 
                            checked={field.value}
                            className="h-4 w-4" 
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          This expense is for a specific animal
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  {watchAnimalRelated && (
                    <FormField
                      control={form.control}
                      name="animalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Animal</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Animal" />
                              </SelectTrigger>
                              <SelectContent>
                                {animals.map((animal) => (
                                  <SelectItem key={animal.id} value={animal.name}>
                                    {animal.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpenDialog(false)} type="button">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-farm-600 hover:bg-farm-700 text-white">
                      Save Expense
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
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
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Input 
                type="month" 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-40 h-8"
              />
            </div>
          </div>
          
          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-farm-500 border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading expenses...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/20">
                <Banknote className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No expenses recorded</h3>
                <p className="text-sm text-muted-foreground">
                  Start tracking your farm expenses by clicking the "Record Expense" button
                </p>
              </div>
            ) : (
              <ExpenseTable 
                expenses={expenses}
                deleteExpense={deleteExpense}
              />
            )}
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-farm-500 border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading expenses...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/20">
                <Banknote className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No expenses for selected month</h3>
                <p className="text-sm text-muted-foreground">
                  Try selecting a different month or add new expenses
                </p>
              </div>
            ) : (
              <ExpenseTable 
                expenses={filteredExpenses}
                deleteExpense={deleteExpense}
                isFiltered={true}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
