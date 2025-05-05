
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bird, DollarSign, TrendingUp } from "lucide-react";

// Mock data types
interface StatCardData {
  totalAnimals: number;
  monthlyExpenses: number;
  profitLoss: number;
}

interface StatCardProps {
  data: StatCardData;
}

export default function PreviewStatCards({ data }: StatCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Animals Card */}
      <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
          <Bird className="h-4 w-4 text-farm-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalAnimals}</div>
          <p className="text-xs text-muted-foreground">
            Across all categories
          </p>
        </CardContent>
      </Card>

      {/* Monthly Expenses Card */}
      <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-farm-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{data.monthlyExpenses.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            For June 2023
          </p>
        </CardContent>
      </Card>

      {/* Profit/Loss Card */}
      <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ₹{data.profitLoss.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            +8% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
