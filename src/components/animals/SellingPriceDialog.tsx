import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/utils/format';

interface SellingPriceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (price: number) => void;
  animalCount: number;
}

export function SellingPriceDialog({ isOpen, onClose, onConfirm, animalCount }: SellingPriceDialogProps) {
  const [price, setPrice] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice) && numericPrice > 0) {
      onConfirm(numericPrice);
      setPrice('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Selling Price</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price">Selling Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter selling price"
                required
              />
            </div>
            {price && (
              <p className="text-sm text-gray-500">
                Total for {animalCount} animal{animalCount > 1 ? 's' : ''}: {formatPrice(parseFloat(price) * animalCount)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!price || parseFloat(price) <= 0}>
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 