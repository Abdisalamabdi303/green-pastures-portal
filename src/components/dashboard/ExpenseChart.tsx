
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { ChartData } from "@/types";

interface ExpenseChartProps {
  recentExpenses: {
    date: string;
    amount: number;
  }[];
  categoryData?: ChartData[];
  chartType?: 'line' | 'pie' | 'bar';
  title?: string;
  description?: string;
}

const COLORS = ['#94cf43', '#c9ea9e', '#619c11', '#49760d', '#304f08'];

export default function ExpenseChart({ 
  recentExpenses, 
  categoryData, 
  chartType = 'line',
  title = "Recent Expenses",
  description = "Daily expenses for the past week"
}: ExpenseChartProps) {
  return (
    <Card className="bg-white col-span-2 md:col-span-1">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' && (
            <LineChart
              data={recentExpenses}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#94cf43" 
                activeDot={{ r: 8 }} 
                name="Expense Amount"
              />
            </LineChart>
          )}

          {chartType === 'pie' && categoryData && (
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
              <Legend />
            </PieChart>
          )}

          {chartType === 'bar' && (
            <BarChart
              data={recentExpenses}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
              <Legend />
              <Bar dataKey="amount" fill="#94cf43" name="Expense Amount" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
