
import React, { memo } from 'react';
import { TableColumn, SortConfig, TableSelection } from '@/types';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const HEADER_HEIGHT = 48;

interface VirtualTableHeaderProps {
  columns: TableColumn[];
  sortConfig: SortConfig;
  selection: TableSelection;
  animalIds: string[];
  onSort: (key: string) => void;
  onToggleSelectAll: (allIds: string[]) => void;
}

export const VirtualTableHeader = memo(({ 
  columns, 
  sortConfig, 
  selection, 
  animalIds, 
  onSort, 
  onToggleSelectAll 
}: VirtualTableHeaderProps) => (
  <div className="flex items-center border-b border-gray-300 bg-gray-50 px-2 sm:px-4 font-medium text-gray-700 text-sm" style={{ height: HEADER_HEIGHT }}>
    <div className="w-8 sm:w-12 flex items-center justify-center">
      <Checkbox
        checked={selection.isAllSelected}
        onCheckedChange={() => onToggleSelectAll(animalIds)}
      />
    </div>
    
    <div className="flex-1 grid grid-cols-4 sm:grid-cols-9 gap-2 sm:gap-4 items-center">
      {columns.map((column) => (
        <div 
          key={column.key} 
          className={`flex items-center ${
            ['breed', 'purchasePrice', 'age', 'gender', 'weight'].includes(column.key) 
              ? 'hidden sm:block' 
              : ''
          }`}
        >
          {column.sortable ? (
            <button
              onClick={() => onSort(column.key)}
              className="flex items-center gap-1 hover:text-gray-900 transition-colors"
            >
              <span>{column.label}</span>
              {sortConfig.key === column.key && (
                sortConfig.direction === 'asc' ? 
                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /> : 
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </button>
          ) : (
            <span>{column.label}</span>
          )}
        </div>
      ))}
    </div>
  </div>
));

VirtualTableHeader.displayName = 'VirtualTableHeader';
