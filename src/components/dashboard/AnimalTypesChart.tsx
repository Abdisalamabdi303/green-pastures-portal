import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart,
  Pie,
  Cell,
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Loader2 } from "lucide-react";

interface AnimalTypesChartProps {
  animalsByType: {
    name: string;
    count: number;
  }[];
  loading?: boolean;
}

// Farm-themed color palette
const COLORS = ['#94cf43', '#c9ea9e', '#619c11', '#49760d', '#304f08'];

export default function AnimalTypesChart({ animalsByType = [], loading = false }: AnimalTypesChartProps) {
  if (loading) {
    return (
      <Card className="bg-white col-span-2 md:col-span-1">
        <CardHeader>
          <CardTitle>Animals by Type</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-farm-600" />
        </CardContent>
      </Card>
    );
  }

  if (!animalsByType || animalsByType.length === 0) {
    return (
      <Card className="bg-white col-span-2 md:col-span-1">
        <CardHeader>
          <CardTitle>Animals by Type</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No animal data available to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white col-span-2 md:col-span-1">
      <CardHeader>
        <CardTitle>Animals by Type</CardTitle>
        <CardDescription>Distribution of livestock</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={animalsByType}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
              animationDuration={800}
            >
              {animalsByType.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [value, 'Count']}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Legend formatter={(value) => <span style={{ color: '#333', fontWeight: 500 }}>{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
