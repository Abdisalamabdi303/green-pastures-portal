import { BarChart as BarChartIcon, PieChart as PieChartIcon, LineChart as LineChartIcon } from "lucide-react";
import { ChartData } from "@/types";
import { OptimizedChart } from "@/components/ui/optimized-chart";
import { useMemo } from "react";

interface ExpenseChartProps {
  data: ChartData[];
  title: string;
  description: string;
  chartType?: 'line' | 'pie' | 'bar';
  loading?: boolean;
}

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

  // Transform data to ensure it has the value property
  const transformedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      value: item.value || item.amount || 0
    }));
  }, [data]);

  return (
    <OptimizedChart
      data={transformedData}
      title={title}
      description={description}
      type={chartType}
      loading={loading}
      icon={<ChartIcon />}
      className="bg-white col-span-2 md:col-span-1 shadow-sm hover:shadow-md transition-shadow duration-200"
    />
  );
}
