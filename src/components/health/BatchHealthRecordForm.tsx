import React, { useState } from 'react';
import { HealthRecord } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const batchHealthRecordSchema = z.object({
  condition: z.string().min(1, { message: "Condition is required" }),
  treatment: z.string().min(1, { message: "Treatment is required" }),
  cost: z.string().min(1, { message: "Cost is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  selectedAnimals: z.array(z.string()).min(1, { message: "Select at least one animal" }),
  notes: z.string().optional(),
});

type BatchHealthRecordFormValues = z.infer<typeof batchHealthRecordSchema>;

interface BatchHealthRecordFormProps {
  onAddBatchHealthRecords: (records: Omit<HealthRecord, 'id' | 'createdAt'>[]) => Promise<void>;
  onClose: () => void;
  animals: Array<{ id: string; name: string; type: string; }>;
  healthData?: { records: HealthRecord[] };
}

export const BatchHealthRecordForm = ({ 
  onAddBatchHealthRecords, 
  onClose, 
  animals,
  healthData 
}: BatchHealthRecordFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BatchHealthRecordFormValues>({
    resolver: zodResolver(batchHealthRecordSchema),
    defaultValues: {
      condition: "",
      treatment: "",
      cost: "",
      date: new Date().toISOString().split('T')[0],
      selectedAnimals: [],
      notes: "",
    },
  });

  const onSubmit = async (data: BatchHealthRecordFormValues) => {
    try {
      setIsSubmitting(true);
      console.log('Batch health record form submission started with data:', data);
      
      // Validate that we have selected animals
      if (!data.selectedAnimals.length) {
        throw new Error('Please select at least one animal');
      }

      // Validate required fields
      if (!data.condition.trim()) {
        throw new Error('Condition is required');
      }

      if (!data.treatment.trim()) {
        throw new Error('Treatment is required');
      }

      if (!data.cost.trim()) {
        throw new Error('Cost is required');
      }

      if (!data.date) {
        throw new Error('Date is required');
      }

      // Check for duplicates and prepare health records
      const existingRecords = healthData?.records || [];
      const duplicateAnimals: string[] = [];
      const uniqueAnimals: string[] = [];

      // Separate duplicates and unique animals
      data.selectedAnimals.forEach(animalId => {
        const hasRecord = existingRecords.some(record => 
          record.animalId === animalId && 
          record.condition.toLowerCase() === data.condition.toLowerCase() &&
          new Date(record.date).toDateString() === new Date(data.date).toDateString()
        );
        
        if (hasRecord) {
          duplicateAnimals.push(animalId);
        } else {
          uniqueAnimals.push(animalId);
        }
      });

      // If all animals are duplicates, show error
      if (uniqueAnimals.length === 0) {
        const duplicateIds = duplicateAnimals.join(', ');
        throw new Error(`All selected animals (${duplicateIds}) already have a health record for this condition on this date`);
      }

      // If some animals are duplicates, show warning but continue with unique ones
      if (duplicateAnimals.length > 0) {
        const duplicateIds = duplicateAnimals.join(', ');
        console.warn(`Skipping duplicate health records for animals: ${duplicateIds}`);
        // You might want to show a toast or alert here
      }

      // Process each unique health record
      const healthRecords = uniqueAnimals.map(animalId => {
        // Find the animal in the animals array
        const animal = animals.find(a => a.id === animalId);
        if (!animal) {
          console.error('Animal not found:', animalId);
          throw new Error(`Animal with ID ${animalId} not found`);
        }

        console.log(`Processing health record for animal: ${animal.id} (${animal.type})`);
        
        // Ensure date is properly formatted
        const date = new Date(data.date);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date format');
        }

        // Create Timestamp object
        const dateTimestamp = Timestamp.fromDate(date);

        // Validate animal data
        if (!animal.type) {
          console.error('Invalid animal data:', animal);
          throw new Error(`Invalid animal data for ID ${animalId}: Missing type`);
        }

        const healthRecordData = {
          animalId: animal.id,
          animalName: animal.id, // Use ID as name if name is not available
          animalType: animal.type,
          condition: data.condition.trim(),
          treatment: data.treatment.trim(),
          cost: parseFloat(data.cost),
          date: dateTimestamp,
          notes: data.notes?.trim() || '',
          createdAt: Timestamp.now(),
        };

        console.log('Created health record data:', healthRecordData);
        return healthRecordData;
      });

      console.log('Processed batch health records:', healthRecords);
      
      // Submit the batch health records
      await onAddBatchHealthRecords(healthRecords);
      
      // Show success message with details
      const successMessage = `Successfully added ${healthRecords.length} health record${healthRecords.length > 1 ? 's' : ''}`;
      if (duplicateAnimals.length > 0) {
        const duplicateIds = duplicateAnimals.join(', ');
        console.log(`${successMessage}. Skipped ${duplicateAnimals.length} duplicate record${duplicateAnimals.length > 1 ? 's' : ''} for animals: ${duplicateIds}`);
      } else {
        console.log(successMessage);
      }
      
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error submitting batch health records:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-50">
        <DialogHeader>
          <DialogTitle>Batch Health Record</DialogTitle>
          <DialogDescription>
            Add health records for multiple animals.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="healthy">Healthy</SelectItem>
                      <SelectItem value="sick">Sick</SelectItem>
                      <SelectItem value="injured">Injured</SelectItem>
                      <SelectItem value="underTreatment">Under Treatment</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Input placeholder="Enter treatment" className="bg-white border-gray-200" {...field} />
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
                      step="0.01" 
                      placeholder="Enter cost" 
                      className="bg-white border-gray-200" 
                      {...field} 
                    />
                  </FormControl>
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
                    <Input type="date" className="bg-white border-gray-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selectedAnimals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Animals</FormLabel>
                  <FormControl>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
                      {animals.map((animal) => (
                        <div key={animal.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.value.includes(animal.id)}
                            onChange={(e) => {
                              const newValue = e.target.checked
                                ? [...field.value, animal.id]
                                : field.value.filter(id => id !== animal.id);
                              field.onChange(newValue);
                            }}
                            className="h-4 w-4 text-farm-600 focus:ring-farm-500 border-gray-300 rounded"
                          />
                          <label className="text-sm">
                            {animal.id} - {animal.type}
                          </label>
                        </div>
                      ))}
                    </div>
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
                      className="mt-1 focus:ring-farm-500 focus:border-farm-500 block w-full shadow-sm sm:text-sm border-gray-200 rounded-md p-2 bg-white"
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
              <Button type="submit" disabled={isSubmitting} className="bg-farm-600 hover:bg-farm-700 text-white">
                {isSubmitting ? "Saving..." : "Save Records"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 