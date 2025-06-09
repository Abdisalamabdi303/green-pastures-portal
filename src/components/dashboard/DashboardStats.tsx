import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalAnimals: number;
    monthlySales: number;
    monthlyExpenses: number;
    monthlyProfit: number;
    monthlySalesCount: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Total Animals Card */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Animals</CardTitle>
          <Users className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{stats.totalAnimals}</div>
          <p className="text-sm text-gray-500 mt-1">
            Current inventory
          </p>
        </CardContent>
      </Card>

      {/* Monthly Sales Card */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Monthly Sales</CardTitle>
          <DollarSign className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">${stats.monthlySales.toFixed(2)}</div>
          <p className="text-sm text-gray-500 mt-1">
            {stats.monthlySalesCount} sales this month
          </p>
        </CardContent>
      </Card>

      {/* Monthly Expenses Card */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Monthly Expenses</CardTitle>
          <DollarSign className="h-5 w-5 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">${stats.monthlyExpenses.toFixed(2)}</div>
          <p className="text-sm text-gray-500 mt-1">
            Total expenses this month
          </p>
        </CardContent>
      </Card>

      {/* Monthly Profit/Loss Card */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Monthly Profit/Loss</CardTitle>
          {stats.monthlyProfit >= 0 ? (
            <TrendingUp className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${stats.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(stats.monthlyProfit).toFixed(2)}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {stats.monthlyProfit >= 0 ? 'Profit' : 'Loss'} this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats; 