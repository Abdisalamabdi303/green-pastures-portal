import React, { useState, useEffect, useCallback } from 'react';
import { Vaccination, BatchVaccinationFormProps } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const batchVaccinationSchema = z.object({
  vaccine: z.string().min(1, { message: "Vaccine is required" }),
  status: z.string().min(1, { message: "Status is required" }),
  cost: z.string().min(1, { message: "Cost is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  selectedAnimals: z.array(z.string()).min(1, { message: "Select at least one animal" }),
  notes: z.string().optional(),
});

type BatchVaccinationFormValues = z.infer<typeof batchVaccinationSchema>;

export const BatchVaccinationForm = ({ 
  open,
  onOpenChange,
  onSubmit,
  animals,
  isLoading
}: BatchVaccinationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BatchVaccinationFormValues>({
    resolver: zodResolver(batchVaccinationSchema),
    defaultValues: {
      vaccine: "",
      status: "",
      cost: "",
      date: new Date().toISOString().split('T')[0],
      selectedAnimals: [],
      notes: "",
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setIsSubmitting(false);
    }
  }, [open, form]);

  const handleClose = useCallback(() => {
    form.reset();
    onOpenChange(false);
  }, [form, onOpenChange]);

  const handleSubmit = async (data: BatchVaccinationFormValues) => {
    if (isSubmitting) return; // Prevent double submission
    
    try {
      setIsSubmitting(true);
      console.log('Batch vaccination form submission started with data:', data);
      
      // Validate that we have selected animals
      if (!data.selectedAnimals.length) {
        throw new Error('Please select at least one animal');
      }

      // Validate required fields
      if (!data.vaccine.trim()) {
        throw new Error('Vaccine is required');
      }

      if (!data.status.trim()) {
        throw new Error('Status is required');
      }

      if (!data.cost.trim()) {
        throw new Error('Cost is required');
      }

      if (!data.date) {
        throw new Error('Date is required');
      }

      // Process each vaccination
      const vaccinations = data.selectedAnimals.map(animalId => {
        // Find the animal in the animals array
        const animal = animals.find(a => a.id === animalId);
        if (!animal) {
          console.error('Animal not found:', animalId);
          throw new Error(`Animal with ID ${animalId} not found`);
        }

        console.log(`Processing vaccination for animal: ${animal.id} (${animal.type})`);
        
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

        const vaccinationData = {
          animalId: animal.id,
          animalName: animal.name || animal.id, // Use name if available, otherwise use ID
          animalType: animal.type,
          vaccine: data.vaccine.trim(),
          status: data.status.trim(),
          cost: parseFloat(data.cost),
          date: dateTimestamp,
          notes: data.notes?.trim() || '',
        };

        console.log('Created vaccination data:', vaccinationData);
        return vaccinationData;
      });

      console.log('Processed batch vaccinations:', vaccinations);
      
      // Submit the batch vaccinations
      await onSubmit(vaccinations);
      
      handleClose();
    } catch (error) {
      console.error('Error submitting batch vaccinations:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-50">
        <DialogHeader>
          <DialogTitle>Batch Vaccination</DialogTitle>
          <DialogDescription>
            Add vaccinations for multiple animals.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vaccine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vaccine</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter vaccine name" className="bg-white border-gray-200" {...field} />
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
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                    </SelectContent>
                  </Select>
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
                            {animal.name || animal.id} - {animal.type}
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
                onClick={handleClose}
                disabled={isLoading || isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isSubmitting} className="bg-farm-600 hover:bg-farm-700 text-white">
                {isSubmitting ? "Saving..." : "Save Vaccinations"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 