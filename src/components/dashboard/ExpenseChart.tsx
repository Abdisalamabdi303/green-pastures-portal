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
import { Wheat, ShoppingBasket, TrendingUp } from "lucide-react";

interface ExpenseChartProps {
  recentExpenses?: {
    date: string;
    amount: number;
  }[];
  categoryData?: ChartData[];
  chartType?: 'line' | 'pie' | 'bar';
  title?: string;
  description?: string;
  loading?: boolean;
}

// Farm-themed color palette
const COLORS = ['#94cf43', '#c9ea9e', '#619c11', '#49760d', '#304f08'];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export default function ExpenseChart({ 
  recentExpenses = [], 
  categoryData = [], 
  chartType = 'line',
  title = "Recent Expenses",
  description = "Daily expenses for the past week",
  loading = false
}: ExpenseChartProps) {
  
  const ChartIcon = () => {
    switch(chartType) {
      case 'pie': 
        return <ShoppingBasket className="h-4 w-4 text-muted-foreground" />;
      case 'bar': 
        return <Wheat className="h-4 w-4 text-muted-foreground" />;
      default: 
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Format data for charts
  const formattedExpenses = recentExpenses?.map(expense => {
    const formattedDate = formatDate(expense.date);
    return {
      ...expense,
      formattedDate,
      formattedAmount: formatCurrency(expense.amount),
      // Keep original date for sorting
      originalDate: new Date(expense.date).getTime()
    };
  }).sort((a, b) => a.originalDate - b.originalDate) || [];
  
  if (loading) {
    return (
      <Card className="bg-white col-span-2 md:col-span-1 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-farm-600">{title}</CardTitle>
            <CardDescription>Loading data...</CardDescription>
          </div>
          <ChartIcon />
        </CardHeader>
        <CardContent className="h-[300px] pt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-farm-600"></div>
        </CardContent>
      </Card>
    );
  }
  
  if ((chartType === 'line' || chartType === 'bar') && (!recentExpenses || recentExpenses.length === 0)) {
    return (
      <Card className="bg-white col-span-2 md:col-span-1 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-farm-600">{title}</CardTitle>
            <CardDescription>No data available</CardDescription>
          </div>
          <ChartIcon />
        </CardHeader>
        <CardContent className="h-[300px] pt-4 flex items-center justify-center">
          <p className="text-muted-foreground">No expense data available to display</p>
        </CardContent>
      </Card>
    );
  }
  
  if (chartType === 'pie' && (!categoryData || categoryData.length === 0)) {
    return (
      <Card className="bg-white col-span-2 md:col-span-1 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-farm-600">{title}</CardTitle>
            <CardDescription>No category data available</CardDescription>
          </div>
          <ChartIcon />
        </CardHeader>
        <CardContent className="h-[300px] pt-4 flex items-center justify-center">
          <p className="text-muted-foreground">No category data available to display</p>
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
              data={formattedExpenses}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fill: '#666' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fill: '#666' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value as number), 'Amount']}
                labelFormatter={(label) => label}
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
                dataKey="amount" 
                stroke="#94cf43" 
                strokeWidth={2}
                activeDot={{ r: 8, fill: '#94cf43', stroke: 'white', strokeWidth: 2 }} 
                name="Expense Amount"
              />
            </LineChart>
          ) : chartType === 'pie' && categoryData ? (
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
                animationDuration={800}
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [formatCurrency(value as number), 'Amount']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Legend formatter={(value) => <span style={{ color: '#333', fontWeight: 500 }}>{value}</span>} />
            </PieChart>
          ) : (
            <BarChart
              data={formattedExpenses}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fill: '#666' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fill: '#666' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value as number), 'Amount']}
                labelFormatter={(label) => label}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="amount" 
                fill="#94cf43" 
                name="Expense Amount" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
