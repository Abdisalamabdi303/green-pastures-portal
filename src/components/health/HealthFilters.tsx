import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

interface HealthFiltersProps {
  onFilterChange: (filters: {
    search: string;
    animalType: string;
    condition: string;
  }) => void;
}

export const HealthFilters = ({ onFilterChange }: HealthFiltersProps) => {
  const handleSearchChange = (value: string) => {
    onFilterChange({
      search: value,
      animalType: "",
      condition: "",
    });
  };

  const handleAnimalTypeChange = (value: string) => {
    onFilterChange({
      search: "",
      animalType: value,
      condition: "",
    });
  };

  const handleConditionChange = (value: string) => {
    onFilterChange({
      search: "",
      animalType: "",
      condition: value,
    });
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
              className="pl-8 bg-white border-[#e8e8e0] text-[#2c3e2d] placeholder:text-[#4a6741]/50"
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="animalType" className="text-[#2c3e2d]">Animal Type</Label>
          <Select onValueChange={handleAnimalTypeChange}>
            <SelectTrigger id="animalType" className="bg-white border-[#e8e8e0] text-[#2c3e2d]">
              <SelectValue placeholder="Select animal type" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#e8e8e0]">
              <SelectItem value="cattle">Cattle</SelectItem>
              <SelectItem value="sheep">Sheep</SelectItem>
              <SelectItem value="goat">Goat</SelectItem>
              <SelectItem value="chicken">Chicken</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition" className="text-[#2c3e2d]">Condition</Label>
          <Select onValueChange={handleConditionChange}>
            <SelectTrigger id="condition" className="bg-white border-[#e8e8e0] text-[#2c3e2d]">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#e8e8e0]">
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