import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vaccination } from '@/types';
import { Timestamp } from 'firebase/firestore';

const vaccinationSchema = z.object({
  animalId: z.string().min(1, { message: "Animal is required" }),
  vaccineName: z.string().min(1, { message: "Vaccine name is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  nextDueDate: z.string().min(1, { message: "Next due date is required" }),
  administered: z.boolean().default(false),
  notes: z.string().optional(),
});

type VaccinationFormValues = z.infer<typeof vaccinationSchema>;

interface AddVaccinationFormProps {
  onAddVaccination: (data: Omit<Vaccination, 'id' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
  animals: Array<{ id: string; name: string; type: string; }>;
}

const AddVaccinationForm = ({ onAddVaccination, onClose, animals }: AddVaccinationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VaccinationFormValues>({
    resolver: zodResolver(vaccinationSchema),
    defaultValues: {
      animalId: "",
      vaccineName: "",
      date: new Date().toISOString().split('T')[0],
      nextDueDate: new Date().toISOString().split('T')[0],
      administered: false,
      notes: "",
    },
  });

  const watchAnimalType = form.watch("animalType");

  // Filter animals by selected type
  const filteredAnimals = animals.filter(animal => animal.type === watchAnimalType);

  const onSubmit = async (data: VaccinationFormValues) => {
    try {
      setIsSubmitting(true);
      console.log('Form submission started with data:', data);
      
      const animal = animals.find(a => a.id === data.animalId);
      console.log('Found animal:', animal);
      
      const vaccinationData = {
        ...data,
        animalName: animal?.name || '',
        animalType: animal?.type || '',
        date: Timestamp.fromDate(new Date(data.date)),
        nextDueDate: Timestamp.fromDate(new Date(data.nextDueDate)),
        createdAt: Timestamp.now(),
      };
      console.log('Processed vaccination data:', vaccinationData);
      
      await onAddVaccination(vaccinationData);
      console.log('Vaccination added successfully');
      
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
      <DialogContent className="sm:max-w-[425px] bg-gray-50">
        <DialogHeader>
          <DialogTitle>Add Vaccination</DialogTitle>
          <DialogDescription>
            Enter the details of the vaccination below.
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
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Select an animal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border border-gray-200">
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
              name="vaccineName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vaccine Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter vaccine name" className="bg-white border-gray-200" {...field} />
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
                      <Input type="date" className="bg-white border-gray-200" {...field} />
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
                      <Input type="date" className="bg-white border-gray-200" {...field} />
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-200 p-4 bg-white">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Administered</FormLabel>
                  </div>
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
                {isSubmitting ? "Saving..." : "Save Vaccination"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVaccinationForm; 