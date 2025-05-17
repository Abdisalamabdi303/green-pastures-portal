import { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  Timestamp,
  orderBy,
  deleteDoc,
  doc,
  where
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Banknote,
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  Landmark,
  Calendar, 
  Plus, 
  Trash,
  Filter,
  DollarSign
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { formatCurrency } from "@/utils/format";

const incomeSchema = z.object({
  source: z.string().min(1, { message: "Source is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  amount: z.number().min(0, { message: "Amount must be a positive number" }),
  date: z.string(),
  animalRelated: z.boolean().default(false),
  animalName: z.string().optional(),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

interface Income extends Omit<IncomeFormValues, 'date'> {
  id: string;
  date: Timestamp;
  createdAt: Timestamp;
}

interface Animal {
  id: string;
  name: string;
}

export default function Finance() {
  const { toast } = useToast();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      source: "",
      description: "",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      animalRelated: false,
      animalName: "",
    },
  });

  const watchAnimalRelated = form.watch("animalRelated");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch animals
        const animalsQuery = query(collection(db, "animals"));
        const animalsSnapshot = await getDocs(animalsQuery);
        
        const animalsList: Animal[] = [];
        animalsSnapshot.forEach((doc) => {
          const animal = doc.data();
          animalsList.push({ id: doc.id, name: animal.name });
        });
        
        setAnimals(animalsList);
        
        // Fetch incomes
        const incomesQuery = query(collection(db, "incomes"), orderBy("date", "desc"));
        const incomesSnapshot = await getDocs(incomesQuery);
        
        const incomesList: Income[] = [];
        incomesSnapshot.forEach((doc) => {
          incomesList.push({ id: doc.id, ...doc.data() } as Income);
        });
        
        setIncomes(incomesList);
        
        // Fetch expenses
        const expensesQuery = query(collection(db, "expenses"), orderBy("date", "desc"));
        const expensesSnapshot = await getDocs(expensesQuery);
        
        const expensesList: any[] = [];
        expensesSnapshot.forEach((doc) => {
          expensesList.push({ id: doc.id, ...doc.data() });
        });
        
        setExpenses(expensesList);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load financial data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  const onSubmit = async (data: IncomeFormValues) => {
    try {
      const incomeData = {
        ...data,
        date: Timestamp.fromDate(new Date(data.date)),
        createdAt: Timestamp.now(),
      };
      
      // If not animal related, remove animalName
      if (!data.animalRelated) {
        incomeData.animalName = undefined;
      }
      
      await addDoc(collection(db, "incomes"), incomeData);
      
      toast({
        title: "Income Added",
        description: `${data.description} income has been recorded`,
      });
      
      // Reset form and close dialog
      form.reset();
      setOpenDialog(false);
      
      // Refresh income list
      const q = query(collection(db, "incomes"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      
      const incomesList: Income[] = [];
      querySnapshot.forEach((doc) => {
        incomesList.push({ id: doc.id, ...doc.data() } as Income);
      });
      
      setIncomes(incomesList);
      
    } catch (error) {
      console.error("Error adding income:", error);
      toast({
        title: "Error",
        description: "Failed to record income",
        variant: "destructive",
      });
    }
  };

  const deleteIncome = async (id: string, description: string) => {
    if (confirm(`Are you sure you want to delete the income: ${description}?`)) {
      try {
        await deleteDoc(doc(db, "incomes", id));
        
        toast({
          title: "Income Deleted",
          description: `${description} has been removed`,
        });
        
        // Update local state
        setIncomes(incomes.filter(income => income.id !== id));
        
      } catch (error) {
        console.error("Error deleting income:", error);
        toast({
          title: "Error",
          description: "Failed to delete income",
          variant: "destructive",
        });
      }
    }
  };

  // Filter by the selected month
  const filterByMonth = (items: any[]) => {
    return items.filter(item => {
      const itemDate = item.date.toDate();
      const itemMonth = itemDate.toISOString().slice(0, 7);
      return itemMonth === filterMonth;
    });
  };

  const filteredIncomes = filterByMonth(incomes);
  const filteredExpenses = filterByMonth(expenses);

  // Calculate totals for filtered data
  const totalIncome = filteredIncomes.reduce(
    (total, income) => total + income.amount, 
    0
  );
  
  const totalExpense = filteredExpenses.reduce(
    (total, expense) => total + expense.amount, 
    0
  );
  
  const profitLoss = totalIncome - totalExpense;

  // Generate data for profit/loss chart (last 6 months)
  const generateMonthlyData = () => {
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      
      const yearMonth = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      const monthIncomes = incomes.filter(income => {
        const incomeDate = income.date.toDate();
        return incomeDate.toISOString().slice(0, 7) === yearMonth;
      });
      
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = expense.date.toDate();
        return expenseDate.toISOString().slice(0, 7) === yearMonth;
      });
      
      const monthIncome = monthIncomes.reduce(
        (total, income) => total + income.amount, 
        0
      );
      
      const monthExpense = monthExpenses.reduce(
        (total, expense) => total + expense.amount, 
        0
      );
      
      monthlyData.push({
        name: monthName,
        income: monthIncome,
        expenses: monthExpense,
        profit: monthIncome - monthExpense
      });
    }
    
    return monthlyData;
  };

  const chartData = generateMonthlyData();

  // Get income by source
  const incomeBySource = filteredIncomes.reduce((acc, income) => {
    acc[income.source] = (acc[income.source] || 0) + income.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Financial Management</h1>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="mt-2 sm:mt-0 bg-farm-600 hover:bg-farm-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Record Income
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Record New Income</DialogTitle>
                <DialogDescription>
                  Enter the details of your farm income
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Source" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Milk Sales">Milk Sales</SelectItem>
                                <SelectItem value="Animal Sales">Animal Sales</SelectItem>
                                <SelectItem value="Breeding">Breeding</SelectItem>
                                <SelectItem value="Manure">Manure</SelectItem>
                                <SelectItem value="Subsidy">Subsidy</SelectItem>
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
                          <FormLabel>Amount ($)</FormLabel>
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
                          This income is from a specific animal
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
                      Save Income
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
              <p className="text-xs text-muted-foreground">
                For {new Date(filterMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
              <p className="text-xs text-muted-foreground">
                For {new Date(filterMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
              {profitLoss >= 0 ? (
                <Landmark className="h-4 w-4 text-green-500" />
              ) : (
                <Landmark className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(profitLoss))}
              </div>
              <p className="text-xs text-muted-foreground">
                {profitLoss >= 0 ? 'Profit' : 'Loss'} for {new Date(filterMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-12">
          <Card className="md:col-span-12 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>
                  Income vs. Expenses for the last 6 months
                </CardDescription>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Month</span>
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20, right: 30, left: 20, bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <RechartsTooltip 
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#94cf43" />
                    <Bar dataKey="expenses" name="Expenses" fill="#c1986a" />
                    <Bar dataKey="profit" name="Profit/Loss" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="income" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="profit-loss">Profit/Loss Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="income" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Income Records</h2>
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
            
            {loading ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-farm-500 border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading income records...</p>
              </div>
            ) : filteredIncomes.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/20">
                <DollarSign className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No income recorded for this period</h3>
                <p className="text-sm text-muted-foreground">
                  Add your income records by clicking the "Record Income" button
                </p>
              </div>
            ) : (
              <div className="rounded-md border bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Animal</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncomes.map((income) => (
                      <TableRow key={income.id}>
                        <TableCell className="font-medium">{income.description}</TableCell>
                        <TableCell>{income.source}</TableCell>
                        <TableCell>{income.date.toDate().toLocaleDateString()}</TableCell>
                        <TableCell>
                          {income.animalName ? income.animalName : "-"}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(income.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteIncome(income.id, income.description)}
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
          
          <TabsContent value="profit-loss" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Profit/Loss Analysis</h2>
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
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Income Breakdown</CardTitle>
                  <CardDescription>
                    Income sources for {new Date(filterMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(incomeBySource).length > 0 ? (
                    <div className="space-y-4">
                      {Object.keys(incomeBySource).map((source) => (
                        <div key={source} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-farm-400"></div>
                            <span>{source}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(incomeBySource[source])}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No income data for this period</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Profit/Loss Summary</CardTitle>
                  <CardDescription>
                    Financial summary for {new Date(filterMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Income</span>
                      <span className="text-lg font-medium text-green-600">
                        {formatCurrency(totalIncome)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Expenses</span>
                      <span className="text-lg font-medium text-red-600">
                        {formatCurrency(totalExpense)}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex items-center justify-between">
                      <span className="font-medium">{profitLoss >= 0 ? 'Net Profit' : 'Net Loss'}</span>
                      <span className={`text-xl font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(profitLoss))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Profit Margin</span>
                      <span className={`text-sm font-medium ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalIncome > 0 
                          ? `${((profitLoss / totalIncome) * 100).toFixed(1)}%` 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Based on your financial data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profitLoss >= 0 ? (
                    <>
                      <div className="flex gap-2 items-start">
                        <div className="h-4 w-4 mt-0.5 rounded-full bg-green-500 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium">Positive Profit Margin</p>
                          <p className="text-sm text-muted-foreground">
                            Your farm is operating at a profit this month, which is excellent.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 items-start">
                        <div className="h-4 w-4 mt-0.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium">Consider Reinvestment</p>
                          <p className="text-sm text-muted-foreground">
                            With a healthy profit, you might consider reinvesting in farm infrastructure or expanding your livestock.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-2 items-start">
                        <div className="h-4 w-4 mt-0.5 rounded-full bg-red-500 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium">Negative Profit Margin</p>
                          <p className="text-sm text-muted-foreground">
                            Your farm is operating at a loss this month, which requires attention.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 items-start">
                        <div className="h-4 w-4 mt-0.5 rounded-full bg-yellow-500 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium">Review Expenses</p>
                          <p className="text-sm text-muted-foreground">
                            Consider analyzing your major expense categories to identify opportunities for cost reduction.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex gap-2 items-start">
                    <div className="h-4 w-4 mt-0.5 rounded-full bg-farm-500 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Track Trends</p>
                      <p className="text-sm text-muted-foreground">
                        Continue monitoring your financial performance to identify seasonal patterns and opportunities.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
