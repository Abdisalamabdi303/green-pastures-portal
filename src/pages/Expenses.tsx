
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
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  PiggyBank, 
  Banknote, 
  Plus, 
  Trash,
  Calendar,
  Filter
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

const expenseSchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  amount: z.number().min(0, { message: "Amount must be a positive number" }),
  date: z.string(),
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
  animalRelated: z.boolean().default(false),
  animalName: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface Expense extends Omit<ExpenseFormValues, 'date'> {
  id: string;
  date: Timestamp;
  createdAt: Timestamp;
}

interface Animal {
  id: string;
  name: string;
}

const COLORS = ['#94cf43', '#c1986a', '#6b768a', '#6b8e23', '#cd853f'];

export default function Expenses() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchExpensesAndAnimals = async () => {
      try {
        setLoading(true);
        
        // Fetch animals first
        const animalsQuery = query(collection(db, "animals"));
        const animalsSnapshot = await getDocs(animalsQuery);
        
        const animalsList: Animal[] = [];
        animalsSnapshot.forEach((doc) => {
          const animal = doc.data();
          animalsList.push({ id: doc.id, name: animal.name });
        });
        
        setAnimals(animalsList);
        
        // Then fetch expenses
        const q = query(collection(db, "expenses"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        
        const expensesList: Expense[] = [];
        querySnapshot.forEach((doc) => {
          expensesList.push({ id: doc.id, ...doc.data() } as Expense);
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
    
    fetchExpensesAndAnimals();
  }, [toast]);

  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      const expenseData = {
        ...data,
        date: Timestamp.fromDate(new Date(data.date)),
        createdAt: Timestamp.now(),
      };
      
      // If not animal related, remove animalName
      if (!data.animalRelated) {
        expenseData.animalName = undefined;
      }
      
      await addDoc(collection(db, "expenses"), expenseData);
      
      toast({
        title: "Expense Added",
        description: `${data.description} expense has been recorded`,
      });
      
      // Reset form and close dialog
      form.reset();
      setOpenDialog(false);
      
      // Refresh expense list
      const q = query(collection(db, "expenses"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      
      const expensesList: Expense[] = [];
      querySnapshot.forEach((doc) => {
        expensesList.push({ id: doc.id, ...doc.data() } as Expense);
      });
      
      setExpenses(expensesList);
      
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error",
        description: "Failed to record expense",
        variant: "destructive",
      });
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
        
      } catch (error) {
        console.error("Error deleting expense:", error);
        toast({
          title: "Error",
          description: "Failed to delete expense",
          variant: "destructive",
        });
      }
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

  const pieChartData = Object.keys(expensesByCategory).map((category, index) => ({
    name: category,
    value: expensesByCategory[category],
    color: COLORS[index % COLORS.length],
  }));

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
          <Card className="md:col-span-8 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Monthly Expenses</CardTitle>
                <CardDescription>
                  Breakdown of expenses for {new Date(filterMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
                </CardDescription>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Filter</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                  <div className="space-y-2">
                    <h4 className="font-medium">Select Month</h4>
                    <Input 
                      type="month" 
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No expenses recorded for this month
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-4 bg-white">
            <CardHeader className="pb-2">
              <CardTitle>Summary</CardTitle>
              <CardDescription>
                {new Date(filterMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Expenses</span>
                    <span className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="h-[1px] bg-muted"></div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">By Category</h4>
                  {Object.keys(expensesByCategory).length > 0 ? (
                    <div className="space-y-1">
                      {Object.keys(expensesByCategory).map((category) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{category}</span>
                          <span className="text-sm font-medium">
                            ₹{expensesByCategory[category].toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data for this period</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
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
              <div className="rounded-md border bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Animal</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{expense.date.toDate().toLocaleDateString()}</TableCell>
                        <TableCell>
                          {expense.animalName ? expense.animalName : "-"}
                        </TableCell>
                        <TableCell>{expense.paymentMethod}</TableCell>
                        <TableCell className="text-right">₹{expense.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteExpense(expense.id, expense.description)}
                            className="text-destructive h-8 w-8"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
              <div className="rounded-md border bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Animal</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{expense.date.toDate().toLocaleDateString()}</TableCell>
                        <TableCell>
                          {expense.animalName ? expense.animalName : "-"}
                        </TableCell>
                        <TableCell>{expense.paymentMethod}</TableCell>
                        <TableCell className="text-right">₹{expense.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteExpense(expense.id, expense.description)}
                            className="text-destructive h-8 w-8"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
