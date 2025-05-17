import { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";

// Farm-themed color palette
const COLORS = ['#94cf43', '#c9ea9e', '#619c11', '#49760d', '#304f08'];

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface OptimizedChartProps {
  data: ChartData[];
  title: string;
  description?: string;
  type: 'line' | 'bar' | 'pie';
  loading?: boolean;
  height?: number;
  valueFormatter?: (value: number) => string;
  icon?: React.ReactNode;
  className?: string;
}

const defaultValueFormatter = (value: number) => formatCurrency(value);

export function OptimizedChart({ 
  data, 
  title, 
  description, 
  type = 'line',
  loading = false,
  height = 300,
  valueFormatter = defaultValueFormatter,
  icon,
  className
}: OptimizedChartProps) {
  // Memoize the chart configuration to prevent unnecessary re-renders
  const chartConfig = useMemo(() => ({
    tooltip: {
      contentStyle: { 
        backgroundColor: 'white', 
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }
    },
    cartesianGrid: {
      strokeDasharray: '3 3',
      stroke: '#f0f0f0'
    },
    axis: {
      tick: { fill: '#666' },
      axisLine: { stroke: '#e5e7eb' }
    }
  }), []);

  // Memoize the formatted data to prevent unnecessary calculations
  const formattedData = useMemo(() => {
    if (!data) return [];
    return data.map(item => ({
      ...item,
      formattedValue: valueFormatter(item.value)
    }));
  }, [data, valueFormatter]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-farm-600">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {icon}
        </CardHeader>
        <CardContent className={`h-[${height}px] flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-farm-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-farm-600">{title}</CardTitle>
            <CardDescription>No data available</CardDescription>
          </div>
          {icon}
        </CardHeader>
        <CardContent className={`h-[${height}px] flex items-center justify-center`}>
          <p className="text-muted-foreground">No data available to display</p>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={formattedData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid {...chartConfig.cartesianGrid} />
            <XAxis dataKey="name" {...chartConfig.axis} />
            <YAxis {...chartConfig.axis} />
            <Tooltip 
              formatter={(value: any) => [valueFormatter(Number(value)), 'Value']}
              contentStyle={chartConfig.tooltip.contentStyle}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#94cf43" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8, fill: '#94cf43', stroke: 'white', strokeWidth: 2 }}
              name="Value"
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart
            data={formattedData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid {...chartConfig.cartesianGrid} />
            <XAxis dataKey="name" {...chartConfig.axis} />
            <YAxis {...chartConfig.axis} />
            <Tooltip 
              formatter={(value: any) => [valueFormatter(Number(value)), 'Value']}
              contentStyle={chartConfig.tooltip.contentStyle}
            />
            <Legend />
            <Bar 
              dataKey="value" 
              fill="#94cf43" 
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
              name="Value"
            />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {formattedData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [valueFormatter(Number(value)), 'Value']}
              contentStyle={chartConfig.tooltip.contentStyle}
            />
            <Legend />
          </PieChart>
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-farm-600">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {icon}
      </CardHeader>
      <CardContent className={`h-[${height}px]`}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 