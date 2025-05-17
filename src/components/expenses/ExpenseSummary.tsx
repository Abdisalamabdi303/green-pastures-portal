import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";

interface ExpenseSummaryProps {
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  period: string;
}

export default function ExpenseSummary({ 
  totalExpenses, 
  expensesByCategory, 
  period 
}: ExpenseSummaryProps) {
  return (
    <Card className="md:col-span-4 bg-white">
      <CardHeader className="pb-2">
        <CardTitle>Summary</CardTitle>
        <CardDescription>{period}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Expenses</span>
              <span className="text-2xl font-bold">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="h-[1px] bg-muted"></div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">By Category</h4>
            {Object.keys(expensesByCategory).length > 0 ? (
              <div className="space-y-1">
                {Object.keys(expensesByCategory).map((category) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{category}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(expensesByCategory[category])}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data for this period</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
