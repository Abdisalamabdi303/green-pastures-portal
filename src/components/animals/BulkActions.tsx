
import React, { memo } from 'react';
import { Trash2, Archive, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: 'active' | 'sold' | 'deceased') => void;
  onClearSelection: () => void;
  isProcessing?: boolean;
}

const BulkActions = memo(({
  selectedCount,
  onBulkDelete,
  onBulkStatusChange,
  onClearSelection,
  isProcessing = false
}: BulkActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <span className="text-blue-700 font-medium">
          {selectedCount} animal{selectedCount > 1 ? 's' : ''} selected
        </span>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onBulkStatusChange('active')}
            disabled={isProcessing}
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Mark Active
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onBulkStatusChange('sold')}
            disabled={isProcessing}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Archive className="h-4 w-4 mr-1" />
            Mark Sold
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onBulkDelete}
            disabled={isProcessing}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            disabled={isProcessing}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
});

BulkActions.displayName = 'BulkActions';

export default BulkActions;
