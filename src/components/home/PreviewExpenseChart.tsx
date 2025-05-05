
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface ExpenseData {
  name: string;
  amount: number;
}

interface ExpenseChartProps {
  data: ExpenseData[];
}

export default function PreviewExpenseChart({ data }: ExpenseChartProps) {
  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#94cf43" 
                activeDot={{ r: 8 }} 
                name="Expense" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
