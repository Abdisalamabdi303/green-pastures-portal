
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";

interface ExpensesHeaderProps {
  setOpenDialog: (open: boolean) => void;
}

export function ExpensesHeader({ setOpenDialog }: ExpensesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Expense Tracker</h1>
      
      <Button 
        className="mt-2 sm:mt-0 bg-farm-600 hover:bg-farm-700 text-white"
        onClick={() => setOpenDialog(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Record Expense
      </Button>
    </div>
  );
}
