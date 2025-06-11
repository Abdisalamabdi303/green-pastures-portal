import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice } from '@/utils/format';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Animal } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, DollarSign, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useDashboardRefresh } from '@/pages/DashboardPage';

interface SellAnimalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[], totalPrice: number, paymentMethod: string) => void;
}

const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Mobile Money',
  'Check',
  'Credit Card'
];

export function SellAnimalDialog({ isOpen, onClose, onConfirm }: SellAnimalDialogProps) {
  const [price, setPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimals, setSelectedAnimals] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { refreshDashboard } = useDashboardRefresh();

  // Filter animals based on search term
  const filteredAnimals = useMemo(() => {
    if (!searchTerm) return animals;
    
    const term = searchTerm.toLowerCase();
    return animals.filter(animal => 
      animal.id.toLowerCase().includes(term) ||
      animal.type?.toLowerCase().includes(term) ||
      animal.breed?.toLowerCase().includes(term) ||
      animal.name?.toLowerCase().includes(term)
    );
  }, [animals, searchTerm]);

  // Calculate total estimated value based on purchase prices
  const estimatedValue = useMemo(() => {
    const selectedAnimalsList = animals.filter(animal => selectedAnimals.has(animal.id));
    return selectedAnimalsList.reduce((total, animal) => total + (animal.purchasePrice || 0), 0);
  }, [animals, selectedAnimals]);

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
        
        const animalsData = snapshot.docs.map(doc => {
          const data = doc.data();
          // Validate gender
          const gender = data.gender === 'female' ? 'female' : 'male';
          // Validate status
          const status = ['active', 'sold', 'deceased'].includes(data.status) ? data.status : 'active';
          
          // Ensure all required fields are present and of correct type
          const animal: Animal = {
            id: doc.id,
            name: typeof data.name === 'string' ? data.name : '',
            type: String(data.type || ''),
            breed: String(data.breed || ''),
            gender,
            weight: Number(data.weight || 0),
            status,
            purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : undefined,
            notes: data.notes ? String(data.notes) : undefined,
            imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
            age: Number(data.age || 0),
            purchaseDate: data.purchaseDate?.toDate() || undefined
          };
          
          return animal;
        });
        
        // Sort animals by ID
        animalsData.sort((a, b) => a.id.localeCompare(b.id));
        
        console.log('Fetched animals:', animalsData.length);
        setAnimals(animalsData);
      } catch (error) {
        console.error('Error fetching animals:', error);
        toast.error('Error fetching animals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchAnimals();
      // Reset form when dialog opens
      setPrice('');
      setPaymentMethod('Cash');
      setSelectedAnimals(new Set());
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice) && numericPrice > 0 && selectedAnimals.size > 0) {
      await onConfirm(Array.from(selectedAnimals), numericPrice, paymentMethod);
      refreshDashboard(); // Refresh dashboard after successful sale
      handleClose();
    }
  };

  const handleClose = () => {
    setPrice('');
    setPaymentMethod('Cash');
    setSelectedAnimals(new Set());
    setSearchTerm('');
    onClose();
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

  const selectAllFiltered = () => {
    const newSelected = new Set(selectedAnimals);
    filteredAnimals.forEach(animal => newSelected.add(animal.id));
    setSelectedAnimals(newSelected);
  };

  const clearSelection = () => {
    setSelectedAnimals(new Set());
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl bg-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Sell Animals
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 space-y-4 py-4 overflow-hidden">
            {/* Search and selection controls */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search animals by ID, type, breed, or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllFiltered}
                  disabled={filteredAnimals.length === 0}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  disabled={selectedAnimals.size === 0}
                >
                  Clear
                </Button>
              </div>

              {/* Selection summary */}
              {selectedAnimals.size > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">
                          {selectedAnimals.size} animal{selectedAnimals.size > 1 ? 's' : ''} selected
                        </span>
                      </div>
                      {estimatedValue > 0 && (
                        <span className="text-blue-700">
                          Estimated value: {formatPrice(estimatedValue)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Animals list */}
            <div className="space-y-2">
              <Label>Select Animals to Sell</Label>
              <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading animals...</p>
                  </div>
                ) : filteredAnimals.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {searchTerm ? 'No animals found matching your search' : 'No active animals found'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAnimals.map((animal) => (
                      <div 
                        key={animal.id} 
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                          selectedAnimals.has(animal.id) 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        <Checkbox
                          id={animal.id}
                          checked={selectedAnimals.has(animal.id)}
                          onCheckedChange={() => toggleAnimal(animal.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono text-xs">
                              {animal.id}
                            </Badge>
                            <span className="font-medium">
                              {animal.type} {animal.breed ? `(${animal.breed})` : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {animal.name && <span>Name: {animal.name}</span>}
                            {animal.weight > 0 && <span>Weight: {animal.weight}kg</span>}
                            {animal.purchasePrice && (
                              <span>Purchase: {formatPrice(animal.purchasePrice)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pricing and payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Total Selling Price *</Label>
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

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price breakdown */}
            {price && selectedAnimals.size > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total for {selectedAnimals.size} animal{selectedAnimals.size > 1 ? 's' : ''}:</span>
                      <span className="font-medium">{formatPrice(parseFloat(price))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price per animal:</span>
                      <span className="font-medium">{formatPrice(parseFloat(price) / selectedAnimals.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment method:</span>
                      <span className="font-medium">{paymentMethod}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!price || parseFloat(price) <= 0 || selectedAnimals.size === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Sale ({selectedAnimals.size} animal{selectedAnimals.size !== 1 ? 's' : ''})
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 