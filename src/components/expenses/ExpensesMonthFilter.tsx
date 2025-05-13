
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";

interface ExpensesMonthFilterProps {
  filterMonth: string;
  setFilterMonth: (month: string) => void;
}

export function ExpensesMonthFilter({ filterMonth, setFilterMonth }: ExpensesMonthFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <Input 
        type="month" 
        value={filterMonth}
        onChange={(e) => setFilterMonth(e.target.value)}
        className="w-40 h-8"
      />
    </div>
  );
}
