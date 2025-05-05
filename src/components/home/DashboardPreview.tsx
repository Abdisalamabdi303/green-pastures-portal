
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Bird, DollarSign, TrendingUp } from "lucide-react";

// Simulated data for the dashboard preview
const mockData = {
  totalAnimals: 1578,
  monthlyExpenses: 275000,
  profitLoss: 125000,
  expenseData: [
    { name: 'Jan', amount: 240000 },
    { name: 'Feb', amount: 255000 },
    { name: 'Mar', amount: 262000 },
    { name: 'Apr', amount: 258000 },
    { name: 'May', amount: 265000 },
    { name: 'Jun', amount: 275000 },
  ]
};

export default function DashboardPreview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Animals Card */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <Bird className="h-4 w-4 text-farm-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalAnimals}</div>
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
            <div className="text-2xl font-bold">₹{mockData.monthlyExpenses.toLocaleString()}</div>
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
              ₹{mockData.profitLoss.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={mockData.expenseData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#94cf43" activeDot={{ r: 8 }} name="Expense" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
