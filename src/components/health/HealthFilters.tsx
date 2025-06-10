import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Animal } from '@/types';

interface HealthFiltersProps {
  onFilterChange: (filters: {
    search: string;
    animalType: string;
    condition: string;
  }) => void;
  animals: Animal[];
}

export const HealthFilters = ({ onFilterChange, animals }: HealthFiltersProps) => {
  const [search, setSearch] = useState('');
  const [animalType, setAnimalType] = useState('all');
  const [condition, setCondition] = useState('all');

  // Get unique animal types from animals array, filtering out empty or undefined types
  const animalTypes = Array.from(new Set(
    animals
      .map(animal => animal.type)
      .filter((type): type is string => !!type)
  ));

  useEffect(() => {
    onFilterChange({ 
      search, 
      animalType: animalType === 'all' ? '' : animalType,
      condition: condition === 'all' ? '' : condition 
    });
  }, [search, animalType, condition, onFilterChange]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleAnimalTypeChange = (value: string) => {
    setAnimalType(value);
  };

  const handleConditionChange = (value: string) => {
    setCondition(value);
  };

  return (
    <Card className="bg-white border-[#e8e8e0] p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-[#2c3e2d]">Search</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#4a6741]" />
            <Input
              id="search"
              placeholder="Search by animal name..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 bg-white border-[#e8e8e0] text-[#2c3e2d] placeholder:text-[#4a6741]/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="animalType" className="text-[#2c3e2d]">Animal Type</Label>
          <Select onValueChange={handleAnimalTypeChange} value={animalType}>
            <SelectTrigger id="animalType" className="bg-white border-[#e8e8e0] text-[#2c3e2d]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#e8e8e0]">
              <SelectItem value="all">All Types</SelectItem>
              {animalTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition" className="text-[#2c3e2d]">Condition</Label>
          <Select onValueChange={handleConditionChange} value={condition}>
            <SelectTrigger id="condition" className="bg-white border-[#e8e8e0] text-[#2c3e2d]">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#e8e8e0]">
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="sick">Sick</SelectItem>
              <SelectItem value="injured">Injured</SelectItem>
              <SelectItem value="pregnant">Pregnant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}; 