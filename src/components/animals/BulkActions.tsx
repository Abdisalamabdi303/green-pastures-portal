import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkStatusChange: (selectedIds: string[], status: 'active' | 'deceased') => void;
  onClearSelection: () => void;
  selectedIds: string[];
  animals: Array<{ id: string; status: string }>;
}

const BulkActions = memo(({ 
  selectedCount, 
  onBulkDelete, 
  onBulkStatusChange, 
  onClearSelection,
  selectedIds,
  animals
}: BulkActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-blue-700 font-medium">
          {selectedCount} animal{selectedCount > 1 ? 's' : ''} selected
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          className="text-blue-700 border-blue-300 hover:bg-blue-100"
        >
          Clear Selection
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBulkStatusChange(selectedIds, 'active')}
          className="text-green-700 border-green-300 hover:bg-green-100"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Mark Active
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBulkStatusChange(selectedIds, 'deceased')}
          className="text-gray-700 border-gray-300 hover:bg-gray-100"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Mark Deceased
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          className="bg-red-600 hover:bg-red-700"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete Selected
        </Button>
      </div>
    </div>
  );
});

BulkActions.displayName = 'BulkActions';

export default BulkActions;
