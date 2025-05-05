
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface AnimalTypesChartProps {
  animalsByType: {
    name: string;
    count: number;
  }[];
}

export default function AnimalTypesChart({ animalsByType }: AnimalTypesChartProps) {
  return (
    <Card className="bg-white col-span-2 md:col-span-1">
      <CardHeader>
        <CardTitle>Animals by Type</CardTitle>
        <CardDescription>Distribution of livestock</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={animalsByType}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [value, 'Count']} />
            <Legend />
            <Bar dataKey="count" fill="#94cf43" name="Number of Animals" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
