
import { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  Timestamp,
  orderBy,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bird, Plus, Trash } from "lucide-react";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const animalSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  type: z.string().min(1, { message: "Type is required" }),
  breed: z.string().optional(),
  age: z.number().min(0, { message: "Age must be a positive number" }),
  weight: z.number().min(0, { message: "Weight must be a positive number" }),
  purchaseDate: z.string(),
  purchasePrice: z.number().min(0, { message: "Price must be a positive number" }),
  notes: z.string().optional(),
  healthStatus: z.string().default("Healthy"),
});

type AnimalFormValues = z.infer<typeof animalSchema>;

interface Animal extends AnimalFormValues {
  id: string;
  createdAt: Timestamp;
  initialTreatment: {
    name: string;
    doses: number;
    completed: number;
  };
}

export default function Animals() {
  const { toast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  const form = useForm<AnimalFormValues>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      name: "",
      type: "",
      breed: "",
      age: 0,
      weight: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: 0,
      notes: "",
      healthStatus: "Healthy",
    },
  });

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "animals"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const animalList: Animal[] = [];
        querySnapshot.forEach((doc) => {
          animalList.push({ id: doc.id, ...doc.data() } as Animal);
        });
        
        setAnimals(animalList);
      } catch (error) {
        console.error("Error fetching animals:", error);
        toast({
          title: "Error",
          description: "Failed to load animal data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnimals();
  }, [toast]);

  const onSubmit = async (data: AnimalFormValues) => {
    try {
      const animalData = {
        ...data,
        createdAt: Timestamp.now(),
        initialTreatment: {
          name: "Siddha Talal",
          doses: 3,
          completed: 0,
        },
      };
      
      await addDoc(collection(db, "animals"), animalData);
      
      // Add initial treatment to health records
      await addDoc(collection(db, "health"), {
        animalName: data.name,
        treatment: "Siddha Talal",
        description: "Initial treatment protocol",
        startDate: Timestamp.now(),
        totalDoses: 3,
        completedDoses: 0,
        status: "In Progress",
        createdAt: Timestamp.now(),
      });
      
      toast({
        title: "Animal Added",
        description: `${data.name} has been registered successfully`,
      });
      
      // Reset form and close dialog
      form.reset();
      setOpen(false);
      
      // Refresh animal list
      const q = query(collection(db, "animals"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const animalList: Animal[] = [];
      querySnapshot.forEach((doc) => {
        animalList.push({ id: doc.id, ...doc.data() } as Animal);
      });
      
      setAnimals(animalList);
      
    } catch (error) {
      console.error("Error adding animal:", error);
      toast({
        title: "Error",
        description: "Failed to register animal",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnimal = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteDoc(doc(db, "animals", id));
        
        toast({
          title: "Animal Deleted",
          description: `${name} has been removed from the system`,
        });
        
        // Update local state
        setAnimals(animals.filter(animal => animal.id !== id));
        
      } catch (error) {
        console.error("Error deleting animal:", error);
        toast({
          title: "Error",
          description: "Failed to delete animal",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Animals</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="mt-2 sm:mt-0 bg-farm-600 hover:bg-farm-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Register New Animal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Register New Animal</DialogTitle>
                <DialogDescription>
                  Add a new animal to your livestock management system
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cow">Cow</SelectItem>
                                <SelectItem value="Buffalo">Buffalo</SelectItem>
                                <SelectItem value="Goat">Goat</SelectItem>
                                <SelectItem value="Sheep">Sheep</SelectItem>
                                <SelectItem value="Chicken">Chicken</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="breed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Breed</FormLabel>
                          <FormControl>
                            <Input placeholder="Breed" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="healthStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Health Status</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Healthy">Healthy</SelectItem>
                                <SelectItem value="Sick">Sick</SelectItem>
                                <SelectItem value="Recovering">Recovering</SelectItem>
                                <SelectItem value="Quarantined">Quarantined</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age (months)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="Age"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="Weight"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="purchaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="purchasePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Price (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="Price"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional notes about the animal"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-medium">Initial Treatment</p>
                    <p className="text-xs text-muted-foreground">
                      Siddha Talal (3 doses) will be automatically registered
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)} type="button">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-farm-600 hover:bg-farm-700 text-white">
                      Register Animal
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="cards">Card View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-farm-500 border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading animals...</p>
              </div>
            ) : animals.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/20">
                <Bird className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No animals registered</h3>
                <p className="text-sm text-muted-foreground">
                  Add your first animal by clicking the "Register New Animal" button
                </p>
              </div>
            ) : (
              <div className="rounded-md border bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Health Status</TableHead>
                      <TableHead>Age (months)</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead>Purchase Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {animals.map((animal) => (
                      <TableRow key={animal.id}>
                        <TableCell className="font-medium">{animal.name}</TableCell>
                        <TableCell>{animal.type}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            animal.healthStatus === 'Healthy' 
                              ? 'bg-green-100 text-green-800' 
                              : animal.healthStatus === 'Sick'
                              ? 'bg-red-100 text-red-800'
                              : animal.healthStatus === 'Recovering'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {animal.healthStatus}
                          </span>
                        </TableCell>
                        <TableCell>{animal.age}</TableCell>
                        <TableCell>{animal.purchaseDate}</TableCell>
                        <TableCell>₹{animal.purchasePrice.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAnimal(animal.id, animal.name)}
                            className="text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="cards" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-farm-500 border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading animals...</p>
              </div>
            ) : animals.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/20">
                <Bird className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No animals registered</h3>
                <p className="text-sm text-muted-foreground">
                  Add your first animal by clicking the "Register New Animal" button
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {animals.map((animal) => (
                  <Card key={animal.id} className="bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{animal.name}</CardTitle>
                          <CardDescription>{animal.type} - {animal.breed}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAnimal(animal.id, animal.name)}
                          className="text-destructive h-8 w-8"
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Health Status:</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            animal.healthStatus === 'Healthy' 
                              ? 'bg-green-100 text-green-800' 
                              : animal.healthStatus === 'Sick'
                              ? 'bg-red-100 text-red-800'
                              : animal.healthStatus === 'Recovering'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {animal.healthStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Age:</span>
                          <span>{animal.age} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Weight:</span>
                          <span>{animal.weight} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Purchase Date:</span>
                          <span>{animal.purchaseDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Purchase Price:</span>
                          <span>₹{animal.purchasePrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <div className="bg-muted/30 w-full p-2 rounded-md text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Initial Treatment:</span>
                          <span>{animal.initialTreatment?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Progress:</span>
                          <span>{animal.initialTreatment?.completed}/{animal.initialTreatment?.doses} doses</span>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
