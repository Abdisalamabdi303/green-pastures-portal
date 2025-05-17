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
import { HealthRecord } from '@/types';
import { 
  Stethoscope, 
  Calendar, 
  AlertCircle, 
  Activity, 
  CheckCircle2, 
  FileText, 
  User2, 
  Pill,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const healthRecordSchema = z.object({
  animalId: z.string().min(1, { message: "Animal is required" }),
  animalName: z.string().min(1, { message: "Animal name is required" }),
  animalType: z.string().min(1, { message: "Animal type is required" }),
  condition: z.string().min(1, { message: "Condition is required" }),
  status: z.enum(['critical', 'stable', 'recovered']),
  date: z.string().min(1, { message: "Date is required" }),
  treatment: z.string().min(1, { message: "Treatment is required" }),
  notes: z.string().optional().default(""),
});

type HealthRecordFormValues = z.infer<typeof healthRecordSchema>;

interface AddHealthRecordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<HealthRecord, 'id' | 'createdAt'>) => Promise<void>;
  animals: Array<{ id: string; name: string; type: string; }>;
}

export default function AddHealthRecordForm({ 
  open, 
  onOpenChange, 
  onSubmit,
  animals 
}: AddHealthRecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>("");

  const form = useForm<HealthRecordFormValues>({
    resolver: zodResolver(healthRecordSchema),
    defaultValues: {
      animalId: "",
      animalName: "",
      animalType: "",
      condition: "",
      status: "stable",
      date: new Date().toISOString().split('T')[0],
      treatment: "",
      notes: "",
    },
  });

  const handleSubmit = async (data: HealthRecordFormValues) => {
    try {
      setIsSubmitting(true);
      const healthRecord: Omit<HealthRecord, 'id' | 'createdAt'> = {
        animalId: data.animalId,
        animalName: data.animalName,
        animalType: data.animalType,
        condition: data.condition,
        status: data.status,
        date: data.date,
        treatment: data.treatment,
        notes: data.notes || ""
      };
      await onSubmit(healthRecord);
      form.reset();
      setSelectedAnimalId("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting health record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'recovered':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-500 border-red-200 bg-red-50';
      case 'stable':
        return 'text-yellow-500 border-yellow-200 bg-yellow-50';
      case 'recovered':
        return 'text-green-500 border-green-200 bg-green-50';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white text-farm-600">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-farm-600">
            <Stethoscope className="h-5 w-5" />
            Add Health Record
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Record a new health condition or treatment for an animal
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

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      Condition
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Health condition" 
                        className="border-gray-200 dark:border-gray-700" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      Status
                    </FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={cn("border-gray-200 dark:border-gray-700", getStatusStyle(field.value))}>
                          <SelectValue 
                            placeholder="Select status"
                            className="flex items-center gap-2"
                          >
                            {getStatusIcon(field.value)}
                            <span>{field.value.charAt(0).toUpperCase() + field.value.slice(1)}</span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical" className="text-red-500">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Critical
                            </div>
                          </SelectItem>
                          <SelectItem value="stable" className="text-yellow-500">
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              Stable
                            </div>
                          </SelectItem>
                          <SelectItem value="recovered" className="text-green-500">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Recovered
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                        className="border-gray-200 dark:border-gray-700" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="treatment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-muted-foreground" />
                      Treatment
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Treatment given" 
                        className="border-gray-200 dark:border-gray-700" 
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
                      className="resize-none border-gray-200 dark:border-gray-700 min-h-[100px]"
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
                className="border-gray-200 dark:border-gray-700"
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
                    Add Record
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