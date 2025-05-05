
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { useState } from "react";

// Mock expense types
const expenseTypes = [
  "Feed",
  "Medicine",
  "Veterinary Services",
  "Equipment",
  "Labor",
  "Other"
];

export default function ExpenseForm() {
  const [date, setDate] = useState("");
  const [animalId, setAnimalId] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is just a demo, so we're not actually submitting anything
    console.log("Expense form submitted:", { date, animalId, expenseType, quantity, amount });
    
    // Reset form
    setDate("");
    setAnimalId("");
    setExpenseType("");
    setQuantity("");
    setAmount("");
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Date Field */}
            <div className="grid gap-2">
              <Label htmlFor="expense-date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="expense-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Animal ID Field */}
            <div className="grid gap-2">
              <Label htmlFor="animal-id">Animal ID</Label>
              <Input
                id="animal-id"
                type="text"
                placeholder="Enter animal ID"
                value={animalId}
                onChange={(e) => setAnimalId(e.target.value)}
                required
              />
            </div>

            {/* Expense Type Field */}
            <div className="grid gap-2">
              <Label htmlFor="expense-type">Expense Type</Label>
              <Select value={expenseType} onValueChange={setExpenseType}>
                <SelectTrigger id="expense-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {expenseTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Field */}
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="0"
              />
            </div>

            {/* Amount Field */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
              />
            </div>

            <Button type="submit" className="w-full bg-farm-600 hover:bg-farm-700">
              Save Expense
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
