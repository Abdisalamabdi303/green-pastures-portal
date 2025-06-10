import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/utils/format';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Animal } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface SellAnimalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[], totalPrice: number) => void;
}

export function SellAnimalDialog({ isOpen, onClose, onConfirm }: SellAnimalDialogProps) {
  const [price, setPrice] = useState('');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimals, setSelectedAnimals] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch active animals
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setLoading(true);
        // Query for active animals only
        const animalsQuery = query(
          collection(db, 'animals'),
          where('status', '==', 'active')
        );
        const snapshot = await getDocs(animalsQuery);
        const animalsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Animal[];
        
        // Sort animals by ID in memory
        animalsData.sort((a, b) => a.id.localeCompare(b.id));
        setAnimals(animalsData);
      } catch (error) {
        console.error('Error fetching animals:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchAnimals();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice) && numericPrice > 0 && selectedAnimals.size > 0) {
      onConfirm(Array.from(selectedAnimals), numericPrice);
      setPrice('');
      setSelectedAnimals(new Set());
    }
  };

  const toggleAnimal = (animalId: string) => {
    const newSelected = new Set(selectedAnimals);
    if (newSelected.has(animalId)) {
      newSelected.delete(animalId);
    } else {
      newSelected.add(animalId);
    }
    setSelectedAnimals(newSelected);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>Sell Animals</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Animals to Sell</Label>
              <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                {loading ? (
                  <div className="text-center py-4">Loading animals...</div>
                ) : animals.length === 0 ? (
                  <div className="text-center py-4">No active animals found</div>
                ) : (
                  <div className="space-y-2">
                    {animals.map((animal) => (
                      <div key={animal.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          id={animal.id}
                          checked={selectedAnimals.has(animal.id)}
                          onCheckedChange={() => toggleAnimal(animal.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="font-mono">
                              {animal.id}
                            </Badge>
                            <Label htmlFor={animal.id} className="cursor-pointer">
                              {animal.type} {animal.breed ? `(${animal.breed})` : ''}
                            </Label>
                          </div>
                          {animal.name && (
                            <div className="text-sm text-gray-500 mt-1">
                              Name: {animal.name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Total Selling Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter total selling price"
                required
              />
            </div>

            {price && selectedAnimals.size > 0 && (
              <div className="text-sm text-gray-500">
                <p>Total for {selectedAnimals.size} animal{selectedAnimals.size > 1 ? 's' : ''}: {formatPrice(parseFloat(price))}</p>
                <p>Individual price: {formatPrice(parseFloat(price) / selectedAnimals.size)}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!price || parseFloat(price) <= 0 || selectedAnimals.size === 0}
            >
              Confirm Sale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 