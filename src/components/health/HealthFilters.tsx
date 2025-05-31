import { useState } from 'react';
import { HealthRecord, Vaccination } from '@/types';

interface HealthFiltersProps {
  onFilterChange: (filters: {
    search: string;
    dateRange: { start: string; end: string };
    animalType: string;
    condition: string;
    vaccinationStatus: string;
  }) => void;
}

export const HealthFilters = ({ onFilterChange }: HealthFiltersProps) => {
  const [filters, setFilters] = useState({
    search: '',
    dateRange: {
      start: '',
      end: ''
    },
    animalType: '',
    condition: '',
    vaccinationStatus: ''
  });

  const handleFilterChange = (key: string, value: string | { start: string; end: string }) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search by animal ID or name..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-farm-500 focus:ring-farm-500 sm:text-sm"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={filters.dateRange.start}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-farm-500 focus:ring-farm-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={filters.dateRange.end}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-farm-500 focus:ring-farm-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Animal Type */}
        <div>
          <label htmlFor="animalType" className="block text-sm font-medium text-gray-700">
            Animal Type
          </label>
          <select
            id="animalType"
            value={filters.animalType}
            onChange={(e) => handleFilterChange('animalType', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-farm-500 focus:ring-farm-500 sm:text-sm"
          >
            <option value="">All Types</option>
            <option value="cow">Cow</option>
            <option value="sheep">Sheep</option>
            <option value="goat">Goat</option>
            <option value="chicken">Chicken</option>
          </select>
        </div>

        {/* Health Condition */}
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
            Health Condition
          </label>
          <select
            id="condition"
            value={filters.condition}
            onChange={(e) => handleFilterChange('condition', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-farm-500 focus:ring-farm-500 sm:text-sm"
          >
            <option value="">All Conditions</option>
            <option value="healthy">Healthy</option>
            <option value="sick">Sick</option>
            <option value="injured">Injured</option>
            <option value="pregnant">Pregnant</option>
          </select>
        </div>

        {/* Vaccination Status */}
        <div>
          <label htmlFor="vaccinationStatus" className="block text-sm font-medium text-gray-700">
            Vaccination Status
          </label>
          <select
            id="vaccinationStatus"
            value={filters.vaccinationStatus}
            onChange={(e) => handleFilterChange('vaccinationStatus', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-farm-500 focus:ring-farm-500 sm:text-sm"
          >
            <option value="">All Status</option>
            <option value="upToDate">Up to Date</option>
            <option value="due">Due</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Reset Filters Button */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setFilters({
              search: '',
              dateRange: { start: '', end: '' },
              animalType: '',
              condition: '',
              vaccinationStatus: ''
            });
            onFilterChange({
              search: '',
              dateRange: { start: '', end: '' },
              animalType: '',
              condition: '',
              vaccinationStatus: ''
            });
          }}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}; 