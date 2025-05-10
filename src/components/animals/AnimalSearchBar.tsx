
import React from 'react';

interface AnimalSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
}

const AnimalSearchBar = ({ searchTerm, onSearchChange, onAddClick }: AnimalSearchBarProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
      <h1 className="text-2xl font-semibold text-gray-900">Animals</h1>
      <div className="flex space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search animals..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-farm-500 focus:border-farm-500"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <button 
          className="bg-farm-600 text-white px-4 py-2 rounded-md hover:bg-farm-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500"
          onClick={onAddClick}
        >
          Add Animal
        </button>
      </div>
    </div>
  );
};

export default AnimalSearchBar;
