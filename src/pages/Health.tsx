import { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  Timestamp,
  orderBy,
  updateDoc,
  doc,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, Heart, Plus, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const healthSchema = z.object({
  animalName: z.string().min(1, { message: "Animal name is required" }),
  treatment: z.string().min(1, { message: "Treatment name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  startDate: z.string(),
  totalDoses: z.number().min(1, { message: "Total doses must be at least 1" }),
  status: z.string(),
});

type HealthFormValues = z.infer<typeof healthSchema>;

interface HealthRecord extends Omit<HealthFormValues, 'startDate'> {
  id: string;
  startDate: Timestamp;
  completedDoses: number;
  createdAt: Timestamp;
}

interface Animal {
  id: string;
  name: string;
}

export default function Health() {
  const { toast } = useToast();
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const form = useForm<HealthFormValues>({
    resolver: zodResolver(healthSchema),
    defaultValues: {
      animalName: "",
      treatment: "",
      description: "",
      startDate: new Date().toISOString().split('T')[0],
      totalDoses: 1,
      status: "In Progress",
    },
  });

  useEffect(() => {
    const fetchHealthRecords = async () => {
      try {
        setLoading(true);
        
        // Fetch animals first
        const animalsQuery = query(collection(db, "animals"));
        const animalsSnapshot = await getDocs(animalsQuery);
        
        const animalsList: Animal[] = [];
        animalsSnapshot.forEach((doc) => {
          const animal = doc.data();
          animalsList.push({ id: doc.id, name: animal.name });
        });
        
        setAnimals(animalsList);
        
        // Then fetch health records
        const q = query(collection(db, "health"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const records: HealthRecord[] = [];
        querySnapshot.forEach((doc) => {
          records.push({ id: doc.id, ...doc.data() } as HealthRecord);
        });
        
        setHealthRecords(records);
      } catch (error) {
        console.error("Error fetching health records:", error);
        toast({
          title: "Error",
          description: "Failed to load health data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealthRecords();
  }, [toast]);

  const onSubmit = async (data: HealthFormValues) => {
    try {
      const healthData = {
        ...data,
        startDate: Timestamp.fromDate(new Date(data.startDate)),
        completedDoses: 0,
        createdAt: Timestamp.now(),
      };
      
      const docRef = await addDoc(collection(db, "health"), healthData);
      
      if (docRef.id) {
        toast({
          title: "Health Record Added",
          description: `Treatment for ${data.animalName} has been registered`,
        });
        
        // Reset form and close dialog
        form.reset();
        setOpenDialog(false);
        
        // Refresh health records
        const q = query(collection(db, "health"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const records: HealthRecord[] = [];
        querySnapshot.forEach((doc) => {
          records.push({ id: doc.id, ...doc.data() } as HealthRecord);
        });
        
        setHealthRecords(records);
      } else {
        throw new Error("Failed to add health record");
      }
    } catch (error) {
      console.error("Error adding health record:", error);
      toast({
        title: "Error",
        description: "Failed to register health record",
        variant: "destructive",
      });
      throw error; // Re-throw to let the form handle the error state
    }
  };

  const markDoseComplete = async (record: HealthRecord) => {
    try {
      if (record.completedDoses >= record.totalDoses) {
        return;
      }
      
      const healthRef = doc(db, "health", record.id);
      const newCompletedDoses = record.completedDoses + 1;
      
      await updateDoc(healthRef, {
        completedDoses: newCompletedDoses,
        status: newCompletedDoses >= record.totalDoses ? "Completed" : "In Progress",
      });
      
      // Update animals initial treatment if it's Siddha Talal
      if (record.treatment === "Siddha Talal") {
        const animalQuery = query(
          collection(db, "animals"), 
          where("name", "==", record.animalName)
        );
        
        const animalSnapshot = await getDocs(animalQuery);
        
        animalSnapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, {
            "initialTreatment.completed": newCompletedDoses
          });
        });
      }
      
      toast({
        title: "Treatment Updated",
        description: `Dose ${newCompletedDoses} of ${record.totalDoses} completed`,
      });
      
      // Update local state
      setHealthRecords(prevRecords => 
        prevRecords.map(r => 
          r.id === record.id 
            ? {
                ...r,
                completedDoses: newCompletedDoses,
                status: newCompletedDoses >= record.totalDoses ? "Completed" : "In Progress"
              } 
            : r
        )
      );
      
    } catch (error) {
      console.error("Error updating health record:", error);
      toast({
        title: "Error",
        description: "Failed to update treatment progress",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Health Management</h1>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="mt-2 sm:mt-0 bg-farm-600 hover:bg-farm-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Treatment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Treatment</DialogTitle>
                <DialogDescription>
                  Record a new health treatment for an animal
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="animalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Animal</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Animal" />
                            </SelectTrigger>
                            <SelectContent>
                              {animals.map((animal) => (
                                <SelectItem key={animal.id} value={animal.name}>
                                  {animal.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="treatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Treatment Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Treatment name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="totalDoses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Doses</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="Total doses"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Scheduled">Scheduled</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Treatment details"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpenDialog(false)} type="button">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-farm-600 hover:bg-farm-700 text-white">
                      Add Treatment
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Health Overview</CardTitle>
              <CardDescription>
                Summary of ongoing treatments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Treatments</span>
                  <span className="text-2xl font-bold">{healthRecords.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">In Progress</span>
                  <span className="text-lg font-semibold">
                    {healthRecords.filter(r => r.status === "In Progress").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completed</span>
                  <span className="text-lg font-semibold text-green-600">
                    {healthRecords.filter(r => r.status === "Completed").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {loading ? (
            <Card className="bg-white">
              <CardContent className="flex justify-center items-center h-[150px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-farm-500 border-t-transparent"></div>
              </CardContent>
            </Card>
          ) : (
            <>
              {healthRecords
                .filter(record => record.status === "In Progress")
                .slice(0, 3)
                .map((record) => (
                  <Card key={record.id} className="bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{record.animalName}</CardTitle>
                          <CardDescription>{record.treatment}</CardDescription>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : record.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {record.completedDoses} of {record.totalDoses} doses
                            </span>
                          </div>
                          <Progress 
                            value={(record.completedDoses / record.totalDoses) * 100}
                            className="h-2 bg-muted"
                          />
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Started: </span>
                          <span>
                            {record.startDate.toDate().toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className={`w-full ${
                          record.completedDoses >= record.totalDoses
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-farm-600 hover:bg-farm-700'
                        } text-white`}
                        onClick={() => markDoseComplete(record)}
                        disabled={record.completedDoses >= record.totalDoses}
                      >
                        {record.completedDoses >= record.totalDoses ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Mark Dose Complete
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              }
            </>
          )}
        </div>
        
        <h2 className="text-xl font-semibold mt-6">All Health Records</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-farm-500 border-t-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading health records...</p>
          </div>
        ) : healthRecords.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-muted/20">
            <Heart className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No health records found</h3>
            <p className="text-sm text-muted-foreground">
              Add your first health record by clicking the "Add Treatment" button
            </p>
          </div>
        ) : (
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.animalName}</TableCell>
                    <TableCell>{record.treatment}</TableCell>
                    <TableCell>{record.startDate.toDate().toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(record.completedDoses / record.totalDoses) * 100}
                          className="h-2 w-[100px] bg-muted"
                        />
                        <span className="text-xs">
                          {record.completedDoses}/{record.totalDoses}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : record.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markDoseComplete(record)}
                        disabled={record.completedDoses >= record.totalDoses}
                      >
                        {record.completedDoses >= record.totalDoses ? 
                          "Complete" : "Mark Dose"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
}
