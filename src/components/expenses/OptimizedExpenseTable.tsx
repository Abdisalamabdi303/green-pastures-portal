
import { Expense } from "@/types";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/format";
import { memo, useCallback } from "react";

interface OptimizedExpenseTableProps {
  expenses: Expense[];
  deleteExpense: (id: string, description: string) => Promise<boolean>;
  isFiltered?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

// Memoized row component to prevent unnecessary re-renders
const ExpenseRow = memo(({ 
  expense, 
  onDelete 
}: { 
  expense: Expense; 
  onDelete: (id: string, description: string) => Promise<boolean>;
}) => {
  const handleDelete = useCallback(() => {
    onDelete(expense.id, expense.description || "");
  }, [expense.id, expense.description, onDelete]);

  // Helper function to format date correctly
  const formatDate = useCallback((dateValue: any) => {
    if (!dateValue) return "-";
    
    // Handle Firebase Timestamp
    if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString();
    }
    
    // Handle string dates
    if (typeof dateValue === 'string') {
      return new Date(dateValue).toLocaleDateString();
    }
    
    // Handle Date objects
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString();
    }
    
    return "-";
  }, []);

  return (
    <TableRow>
      <TableCell className="font-medium">{expense.description}</TableCell>
      <TableCell>{expense.category}</TableCell>
      <TableCell>{formatDate(expense.date)}</TableCell>
      <TableCell className="hidden md:table-cell">
        {expense.animalName || "-"}
      </TableCell>
      <TableCell className="hidden md:table-cell">{expense.paymentMethod || "-"}</TableCell>
      <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-destructive h-8 w-8"
        >
          <Trash className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </TableCell>
    </TableRow>
  );
});

ExpenseRow.displayName = 'ExpenseRow';

export default memo(function OptimizedExpenseTable({ 
  expenses, 
  deleteExpense, 
  isFiltered = false,
  onLoadMore,
  hasMore = false,
  loading = false
}: OptimizedExpenseTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-white overflow-x-auto max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10 border-b">
            <TableRow>
              <TableHead className="whitespace-nowrap">Description</TableHead>
              <TableHead className="whitespace-nowrap">Category</TableHead>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="whitespace-nowrap hidden md:table-cell">Animal</TableHead>
              <TableHead className="whitespace-nowrap hidden md:table-cell">Payment Method</TableHead>
              <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <ExpenseRow 
                  key={expense.id} 
                  expense={expense} 
                  onDelete={deleteExpense} 
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  {isFiltered 
                    ? "No expenses found for the selected period" 
                    : "No expenses have been recorded yet"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            className="min-w-32"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
});
