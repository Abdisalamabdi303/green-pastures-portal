import { Bird, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from '@/lib/utils';

interface StatCardsProps {
  totalAnimals: number;
  dailyExpenses: number;
  monthlyProfit: number;
  monthlyIncome: number;
}

export function StatCards({ 
  totalAnimals = 0, 
  dailyExpenses = 0, 
  monthlyProfit = 0,
  monthlyIncome = 0 
}: StatCardsProps) {
  // Ensure all values are numbers
  const safeTotalAnimals = Number(totalAnimals) || 0;
  const safeDailyExpenses = Number(dailyExpenses) || 0;
  const safeMonthlyProfit = Number(monthlyProfit) || 0;
  const safeMonthlyIncome = Number(monthlyIncome) || 0;
  const monthlyExpenses = safeDailyExpenses * 30; // Approximate monthly expenses

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
          <Bird className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{safeTotalAnimals}</div>
          <p className="text-xs text-muted-foreground">
            Registered in the system
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(monthlyExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total expenses this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(safeMonthlyIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            Income from sold animals
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Profit</CardTitle>
          {safeMonthlyProfit >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${safeMonthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(safeMonthlyProfit))}
          </div>
          <p className="text-xs text-muted-foreground">
            {safeMonthlyProfit >= 0 ? 'Profit' : 'Loss'} this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
