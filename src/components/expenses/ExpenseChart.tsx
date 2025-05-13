
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Banknote, PiggyBank } from "lucide-react";

interface ExpenseChartProps {
  data: { name: string; value: number; color: string }[];
  title: string;
  description: string;
}

const COLORS = ['#94cf43', '#c1986a', '#6b768a', '#6b8e23', '#cd853f'];

export default function ExpenseChart({ data, title, description }: ExpenseChartProps) {
  return (
    <Card className="md:col-span-8 bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
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
                  No expenses recorded for this period
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
