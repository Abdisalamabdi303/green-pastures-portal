import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Vaccination } from '@/types';
import { 
  Syringe, 
  Calendar, 
  User2, 
  FileText, 
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const vaccinationSchema = z.object({
  animalId: z.string().min(1, { message: "Animal is required" }),
  animalName: z.string().min(1, { message: "Animal name is required" }),
  animalType: z.string().min(1, { message: "Animal type is required" }),
  vaccineName: z.string().min(1, { message: "Vaccine name is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  nextDueDate: z.string().min(1, { message: "Next due date is required" }),
  administered: z.boolean().default(false),
  notes: z.string().optional().default(""),
});

type VaccinationFormValues = z.infer<typeof vaccinationSchema>;

interface AddVaccinationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Vaccination, 'id' | 'createdAt'>) => Promise<void>;
  animals: Array<{ id: string; name: string; type: string; }>;
}

export default function AddVaccinationForm({ 
  open, 
  onOpenChange, 
  onSubmit,
  animals 
}: AddVaccinationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>("");

  const form = useForm<VaccinationFormValues>({
    resolver: zodResolver(vaccinationSchema),
    defaultValues: {
      animalId: "",
      animalName: "",
      animalType: "",
      vaccineName: "",
      date: new Date().toISOString().split('T')[0],
      nextDueDate: new Date().toISOString().split('T')[0],
      administered: false,
      notes: "",
    },
  });

  const handleSubmit = async (data: VaccinationFormValues) => {
    try {
      setIsSubmitting(true);
      const vaccination: Omit<Vaccination, 'id' | 'createdAt'> = {
        animalId: data.animalId,
        animalName: data.animalName,
        animalType: data.animalType,
        vaccineName: data.vaccineName,
        date: data.date,
        nextDueDate: data.nextDueDate,
        administered: data.administered,
        notes: data.notes || ""
      };
      await onSubmit(vaccination);
      form.reset();
      setSelectedAnimalId("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting vaccination:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white text-farm-600">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-farm-600">
            <Syringe className="h-5 w-5" />
            Add Vaccination Record
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Record a new vaccination for an animal
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="animalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User2 className="h-4 w-4 text-muted-foreground" />
                    Animal
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        const animal = animals.find(a => a.id === value);
                        if (animal) {
                          field.onChange(value);
                          form.setValue('animalName', animal.name);
                          form.setValue('animalType', animal.type);
                          setSelectedAnimalId(animal.id);
                        }
                      }}
                    >
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Select Animal" />
                      </SelectTrigger>
                      <SelectContent>
                        {animals.map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{animal.name}</span>
                              <span className="text-xs text-muted-foreground">ID: {animal.id}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {selectedAnimalId && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Selected Animal ID: {selectedAnimalId}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="animalType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Animal Type
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Animal type" 
                      className="border-gray-200"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vaccineName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Syringe className="h-4 w-4 text-muted-foreground" />
                    Vaccine Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter vaccine name" 
                      className="border-gray-200" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Date
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="border-gray-200" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextDueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Next Due Date
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="border-gray-200" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="administered"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2 p-2 rounded-md border border-gray-200">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300 text-farm-600 focus:ring-farm-500"
                    />
                    <FormLabel className="!mt-0 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      Already Administered
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Notes
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes"
                      className="resize-none border-gray-200 min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                type="button"
                className="border-gray-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-farm-600 hover:bg-farm-700 text-white gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Vaccination
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 