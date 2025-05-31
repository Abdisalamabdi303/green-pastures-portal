import React, { useState } from 'react';
import { Vaccination } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const batchVaccinationSchema = z.object({
  vaccineName: z.string().min(1, { message: "Vaccine name is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  nextDueDate: z.string().min(1, { message: "Next due date is required" }),
  selectedAnimals: z.array(z.string()).min(1, { message: "Select at least one animal" }),
  notes: z.string().optional(),
});

type BatchVaccinationFormValues = z.infer<typeof batchVaccinationSchema>;

interface BatchVaccinationFormProps {
  onAddBatchVaccinations: (vaccinations: Omit<Vaccination, 'id' | 'createdAt'>[]) => Promise<void>;
  onClose: () => void;
  animals: Array<{ id: string; name: string; type: string; }>;
}

export const BatchVaccinationForm = ({ onAddBatchVaccinations, onClose, animals }: BatchVaccinationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BatchVaccinationFormValues>({
    resolver: zodResolver(batchVaccinationSchema),
    defaultValues: {
      vaccineName: "",
      date: new Date().toISOString().split('T')[0],
      nextDueDate: new Date().toISOString().split('T')[0],
      selectedAnimals: [],
      notes: "",
    },
  });

  const onSubmit = async (data: BatchVaccinationFormValues) => {
    try {
      setIsSubmitting(true);
      const vaccinations = data.selectedAnimals.map(animalId => {
        const animal = animals.find(a => a.id === animalId);
        return {
          animalId,
          animalName: animal?.name || '',
          animalType: animal?.type || '',
          vaccineName: data.vaccineName,
          date: Timestamp.fromDate(new Date(data.date)),
          nextDueDate: Timestamp.fromDate(new Date(data.nextDueDate)),
          administered: false,
          notes: data.notes,
          createdAt: Timestamp.now(),
        };
      });
      
      await onAddBatchVaccinations(vaccinations);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error submitting batch vaccinations:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Batch Vaccination</DialogTitle>
          <DialogDescription>
            Add vaccination records for multiple animals.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vaccineName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vaccine Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter vaccine name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Next Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="selectedAnimals"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Select Animals</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {animals.map((animal) => (
                      <FormField
                        key={animal.id}
                        control={form.control}
                        name="selectedAnimals"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={animal.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(animal.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, animal.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== animal.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {animal.name} ({animal.type})
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      className="mt-1 focus:ring-farm-500 focus:border-farm-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
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
                {isSubmitting ? "Saving..." : "Save Vaccinations"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 