import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HealthRecord } from '@/types';
import { Timestamp } from 'firebase/firestore';

const healthRecordSchema = z.object({
  animalType: z.string().min(1, { message: "Animal type is required" }),
  animalId: z.string().min(1, { message: "Animal is required" }),
  condition: z.enum(["healthy", "sick", "injured", "pregnant"]),
  status: z.string().min(1, { message: "Status is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  treatment: z.string().min(1, { message: "Treatment is required" }),
  cost: z.number().min(0, { message: "Cost must be a positive number" }),
  notes: z.string().optional(),
});

type HealthRecordFormValues = z.infer<typeof healthRecordSchema>;

interface AddHealthRecordFormProps {
  onAddHealthRecord: (data: Omit<HealthRecord, 'id' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
  animals: Array<{ id: string; name: string; type: string; }>;
}

const AddHealthRecordForm = ({ onAddHealthRecord, onClose, animals }: AddHealthRecordFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HealthRecordFormValues>({
    resolver: zodResolver(healthRecordSchema),
    defaultValues: {
      animalType: "",
      animalId: "",
      condition: "",
      status: "",
      date: new Date().toISOString().split('T')[0],
      treatment: "",
      cost: 0,
      notes: "",
    },
  });

  const watchAnimalType = form.watch("animalType");

  // Filter animals by selected type
  const filteredAnimals = animals.filter(animal => animal.type === watchAnimalType);

  const onSubmit = async (data: HealthRecordFormValues) => {
    try {
      setIsSubmitting(true);
      console.log('Form submission started with data:', data);
      
      const animal = animals.find(a => a.id === data.animalId);
      console.log('Found animal:', animal);
      
      const healthRecordData = {
        ...data,
        animalName: animal?.name || '',
        animalType: animal?.type || '',
        date: Timestamp.fromDate(new Date(data.date)),
        createdAt: Timestamp.now(),
      };
      console.log('Processed health record data:', healthRecordData);
      
      await onAddHealthRecord(healthRecordData);
      console.log('Health record added successfully');
      
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unique animal types
  const animalTypes = [...new Set(animals.map(animal => animal.type))];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Add Health Record</DialogTitle>
          <DialogDescription>
            Enter the details of the health record below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="animalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Animal ID</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select an animal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {animals.map((animal) => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.id} - {animal.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="healthy">Healthy</SelectItem>
                      <SelectItem value="sick">Sick</SelectItem>
                      <SelectItem value="injured">Injured</SelectItem>
                      <SelectItem value="pregnant">Pregnant</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" className="bg-white" {...field} />
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
                  <FormLabel>Treatment</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter treatment details" className="bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter cost" 
                      className="bg-white"
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      className="mt-1 focus:ring-farm-500 focus:border-farm-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-white"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Health Record"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHealthRecordForm; 