import React from 'react';
import { Plus, Search, LayoutGrid, List, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnimalsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: () => void;
  viewMode: 'card' | 'list';
  onViewModeChange: (mode: 'card' | 'list') => void;
  onAddAnimal: () => void;
}

const AnimalsHeader = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
  onAddAnimal
}: AnimalsHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Animals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your farm animals and their records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={onAddAnimal}
            className="bg-farm-600 hover:bg-farm-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Animal
          </Button>
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={`flex items-center gap-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            >
              <List className="h-4 w-4" />
              <span className="text-sm">List</span>
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('card')}
              className={`flex items-center gap-2 ${viewMode === 'card' ? 'bg-gray-100' : ''}`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="text-sm">Grid</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search animals..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200">
              <SelectItem value="date">Date Added</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="gender">Gender</SelectItem>
              <SelectItem value="value">Value</SelectItem>
              <SelectItem value="age">Age</SelectItem>
              <SelectItem value="weight">Weight</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={onSortOrderChange}
            className="bg-white border-gray-200 flex items-center gap-2"
          >
            {sortOrder === 'asc' ? (
              <>
                <span>Ascending</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Descending</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnimalsHeader;
