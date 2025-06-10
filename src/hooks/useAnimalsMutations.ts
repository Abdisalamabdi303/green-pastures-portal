
import { useCallback } from 'react';
import { Animal } from '@/types';
import { animalServices } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';

export const useAnimalsMutations = () => {
  const { toast } = useToast();

  const handleAddAnimal = useCallback(async (newAnimal: Animal, animalToEdit?: Animal | null) => {
    try {
      if (animalToEdit) {
        await animalServices.updateAnimal(animalToEdit.id, newAnimal);
        toast({
          title: "Success",
          description: "Animal updated successfully.",
        });
      } else {
        await animalServices.addAnimal(newAnimal);
        toast({
          title: "Success",
          description: "Animal added successfully.",
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error adding/updating animal:', error);
      toast({
        title: "Error",
        description: "Failed to add/update animal. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const handleDeleteAnimal = useCallback(async (id: string) => {
    try {
      await animalServices.deleteAnimal(id);
      toast({
        title: "Success",
        description: "Animal deleted successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast({
        title: "Error",
        description: "Failed to delete animal. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const handleBulkDelete = useCallback(async (selectedIds: string[]) => {
    try {
      for (const id of selectedIds) {
        await animalServices.deleteAnimal(id);
      }
      
      toast({
        title: "Success",
        description: "Selected animals deleted successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast({
        title: "Error",
        description: "Failed to delete some animals. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const handleBulkStatusChange = useCallback(async (selectedIds: string[], status: 'active' | 'deceased') => {
    try {
      console.log('Bulk updating animals:', { selectedIds, status });
      
      // Process each animal
      for (const id of selectedIds) {
        const updateData: Partial<Animal> = { 
          status,
          updatedAt: Timestamp.now()
        };

        // Update the animal
        await animalServices.updateAnimal(id, updateData);
      }
      
      toast({
        title: "Success",
        description: "Selected animals updated successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error in bulk status change:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update some animals. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  return {
    handleAddAnimal,
    handleDeleteAnimal,
    handleBulkDelete,
    handleBulkStatusChange
  };
};
