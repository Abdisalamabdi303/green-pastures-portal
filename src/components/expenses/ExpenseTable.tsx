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

interface ExpenseTableProps {
  expenses: Expense[];
  deleteExpense: (id: string, description: string) => Promise<boolean>;
  isFiltered?: boolean;
}

export default function ExpenseTable({ 
  expenses, 
  deleteExpense, 
  isFiltered = false 
}: ExpenseTableProps) {
  // Helper function to format date correctly
  const formatDate = (dateValue: any) => {
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
  };

  return (
    <div className="rounded-md border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
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
              <TableRow key={expense.id}>
                <TableCell className="font-medium">{expense.description}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {expense.animalName ? expense.animalName : "-"}
                </TableCell>
                <TableCell className="hidden md:table-cell">{expense.paymentMethod || "-"}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteExpense(expense.id, expense.description || "")}
                    className="text-destructive h-8 w-8"
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
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
  );
}
