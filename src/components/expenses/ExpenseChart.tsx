import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  BarChart as RechartsBarChart,
  Bar as RechartsBar
} from 'recharts';
import { BarChart as BarChartIcon, PieChart as PieChartIcon, LineChart as LineChartIcon } from "lucide-react";
import { ChartData } from "@/types";
import { formatCurrency } from "@/utils/format";

interface ExpenseChartProps {
  data: ChartData[];
  title: string;
  description: string;
  chartType?: 'line' | 'pie' | 'bar';
  loading?: boolean;
}

// Farm-themed color palette
const COLORS = ['#94cf43', '#c1986a', '#6b768a', '#6b8e23', '#cd853f'];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-farm-600">
          {formatCurrency(Number(payload[0].value))}
        </p>
      </div>
    );
  }
  return null;
};

export default function ExpenseChart({ 
  data, 
  title, 
  description, 
  chartType = 'line',
  loading = false
}: ExpenseChartProps) {
  const ChartIcon = () => {
    switch (chartType) {
      case 'line':
        return <LineChartIcon className="h-5 w-5 text-farm-600" />;
      case 'bar':
        return <BarChartIcon className="h-5 w-5 text-farm-600" />;
      default:
        return <PieChartIcon className="h-5 w-5 text-farm-600" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white col-span-2 md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-farm-600">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <ChartIcon />
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-farm-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white col-span-2 md:col-span-1 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-farm-600">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <ChartIcon />
      </CardHeader>
      <CardContent className="h-[300px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: '#666' }} />
              <YAxis tick={{ fill: '#666' }} />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#94cf43" 
                strokeWidth={2}
                activeDot={{ r: 8, fill: '#94cf43', stroke: 'white', strokeWidth: 2 }} 
                name="Amount"
              />
            </LineChart>
          ) : chartType === 'bar' ? (
            <RechartsBarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#666' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#666' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <RechartsBar
                dataKey="value"
                fill="#94cf43"
                name="Amount"
              />
            </RechartsBarChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }: any) => `${name}: ${formatCurrency(Number(value))}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Legend formatter={(value) => <span style={{ color: '#333', fontWeight: 500 }}>{value}</span>} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
