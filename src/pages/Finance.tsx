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
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
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
import { incomeServices, expenseServices, animalServices } from "@/services/firebase";
import { toast } from "sonner";

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
        const animalsList = await animalServices.getAnimals();
        setAnimals(animalsList);
        
        // Fetch incomes
        const incomesList = await incomeServices.getIncomes();
        setIncomes(incomesList as Income[]);
        
        // Fetch expenses
        const expensesList = await expenseServices.getExpenses();
        setExpenses(expensesList);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load financial data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
      
      await incomeServices.addIncome(incomeData);
      
      // Reset form and close dialog
      form.reset();
      setOpenDialog(false);
      
      // Refresh income list
      const incomesList = await incomeServices.getIncomes();
      setIncomes(incomesList as Income[]);
      
      toast.success("Income recorded successfully");
      
    } catch (error) {
      console.error("Error adding income:", error);
      toast.error("Failed to record income");
    }
  };

  const deleteIncome = async (id: string, description: string) => {
    if (confirm(`Are you sure you want to delete the income: ${description}?`)) {
      try {
        await incomeServices.deleteIncome(id);
        
        // Update local state
        setIncomes(incomes.filter(income => income.id !== id));
        toast.success("Income deleted successfully");
        
      } catch (error) {
        console.error("Error deleting income:", error);
        toast.error("Failed to delete income");
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

  // Calculate summary statistics
  const totalIncomeSummary = incomes.reduce((sum, income) => sum + (income.amount || 0), 0);
  const totalExpensesSummary = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const netProfitSummary = totalIncomeSummary - totalExpensesSummary;
  const profitMarginSummary = totalIncomeSummary > 0 ? (netProfitSummary / totalIncomeSummary) * 100 : 0;

  // Prepare chart data
  const monthlyDataSummary = [...Array(12)].map((_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    const monthStr = month.toLocaleString('default', { month: 'short' });
    
    const monthIncome = incomes
      .filter(income => {
        const incomeDate = income.date instanceof Timestamp ? income.date.toDate() : new Date(income.date);
        return incomeDate.getMonth() === month.getMonth() && 
               incomeDate.getFullYear() === month.getFullYear();
      })
      .reduce((sum, income) => sum + (income.amount || 0), 0);
    
    const monthExpenses = expenses
      .filter(expense => {
        const expenseDate = expense.date instanceof Timestamp ? expense.date.toDate() : new Date(expense.date);
        return expenseDate.getMonth() === month.getMonth() && 
               expenseDate.getFullYear() === month.getFullYear();
      })
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);
    
    return {
      month: monthStr,
      income: monthIncome,
      expenses: monthExpenses,
      profit: monthIncome - monthExpenses
    };
  }).reverse();

  return (
    <Layout requireAuth={true}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Income Management</h1>
            <p className="text-muted-foreground mt-1">Track and manage your farm's income sources</p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Income
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record New Income</DialogTitle>
                <DialogDescription>
                  Enter the details of the income transaction.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Milk Sales, Animal Sales" {...field} />
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
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter additional details about this income..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="animalRelated"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Is this income related to a specific animal?</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value === 'true');
                              if (value === 'false') {
                                form.setValue('animalName', '');
                              }
                            }}
                            defaultValue={field.value ? 'true' : 'false'}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchAnimalRelated && (
                    <FormField
                      control={form.control}
                      name="animalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Animal</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select an animal" />
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
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpenDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Income</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalIncomeSummary)}</div>
              <p className="text-xs text-muted-foreground">
                All time income
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(monthlyDataSummary[monthlyDataSummary.length - 1]?.income || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Current month's income
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalIncomeSummary / (monthlyDataSummary.length || 1))}
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly average
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Source</CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.entries(
                  incomes.reduce((acc, income) => {
                    const source = income.source || 'Other';
                    acc[source] = (acc[source] || 0) + (income.amount || 0);
                    return acc;
                  }, {} as Record<string, number>)
                ).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                Highest earning source
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Income Trends</CardTitle>
              <CardDescription>Monthly income over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyDataSummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#94cf43" 
                      name="Income"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Income Sources</CardTitle>
              <CardDescription>Distribution of income by source</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(
                      incomes.reduce((acc, income) => {
                        const source = income.source || 'Other';
                        acc[source] = (acc[source] || 0) + (income.amount || 0);
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([source, amount]) => ({
                      source,
                      amount
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} />
                    <Bar dataKey="amount" fill="#94cf43" name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Income Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Income Transactions</CardTitle>
            <CardDescription>View and manage your income records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Banknote className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No income records found</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenDialog(true)}
                          >
                            Add Income
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    incomes.map((income) => (
                      <TableRow key={income.id}>
                        <TableCell>
                          {income.date instanceof Timestamp
                            ? income.date.toDate().toLocaleDateString()
                            : new Date(income.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{income.source}</TableCell>
                        <TableCell>{income.description}</TableCell>
                        <TableCell>{formatCurrency(income.amount || 0)}</TableCell>
                        <TableCell>{income.animalName || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteIncome(income.id, income.source)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
