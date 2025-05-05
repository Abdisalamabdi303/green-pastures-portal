import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud } from "lucide-react";
import { useState } from "react";

// Mock vaccine types
const vaccines = [
  { name: "FMD Vaccine", days: 0 },
  { name: "Brucellosis Vaccine", days: 30 },
  { name: "Anthrax Vaccine", days: 60 }
];

export default function AnimalEntryForm() {
  const [animalType, setAnimalType] = useState("");
  const [weight, setWeight] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is just a demo, so we're not actually submitting anything
    console.log("Animal form submitted:", { animalType, weight, photoPreview });
    
    // Reset form (but keep the photo for demo purposes)
    setAnimalType("");
    setWeight("");
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Photo Upload */}
            <div className="grid gap-2">
              <Label htmlFor="animal-photo">Animal Photo</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  id="animal-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <label htmlFor="animal-photo" className="cursor-pointer">
                  {photoPreview ? (
                    <div className="relative mx-auto w-40 h-40 overflow-hidden rounded">
                      <img 
                        src={photoPreview} 
                        alt="Animal preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
                      <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Animal Type Field */}
            <div className="grid gap-2">
              <Label htmlFor="animal-type">Animal Type</Label>
              <Select value={animalType} onValueChange={setAnimalType}>
                <SelectTrigger id="animal-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cow">Cow</SelectItem>
                  <SelectItem value="bull">Bull</SelectItem>
                  <SelectItem value="calf">Calf</SelectItem>
                  <SelectItem value="goat">Goat</SelectItem>
                  <SelectItem value="sheep">Sheep</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Weight Field */}
            <div className="grid gap-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="Enter weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                min="0"
              />
            </div>

            {/* Vaccine Schedule */}
            <div className="grid gap-2">
              <Label>Auto-assigned Vaccines</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vaccine</TableHead>
                    <TableHead>Schedule (days)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vaccines.map((vaccine) => (
                    <TableRow key={vaccine.name}>
                      <TableCell>{vaccine.name}</TableCell>
                      <TableCell>
                        {vaccine.days === 0 ? 'Immediate' : `After ${vaccine.days} days`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button type="submit" className="w-full bg-farm-600 hover:bg-farm-700">
              Register Animal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
