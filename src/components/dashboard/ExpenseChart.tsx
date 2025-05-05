
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface ExpenseChartProps {
  recentExpenses: {
    date: string;
    amount: number;
  }[];
}

export default function ExpenseChart({ recentExpenses }: ExpenseChartProps) {
  return (
    <Card className="bg-white col-span-2 md:col-span-1">
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>Daily expenses for the past week</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
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
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
