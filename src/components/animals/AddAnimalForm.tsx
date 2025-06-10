import { Animal } from '@/types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, RotateCcw, X, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface AddAnimalFormProps {
  onAddAnimal: (animal: Animal) => Promise<void>;
  onClose: () => void;
  animalToEdit?: Animal | null;
}

const AddAnimalForm = ({ onAddAnimal, onClose, animalToEdit }: AddAnimalFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const imagePreview = useRef<string | null>(null);
  const imageFile = useRef<File | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<string>('environment');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  
  const [formData, setFormData] = useState<Partial<Animal>>({
    id: '',
    type: '',
    breed: '',
    age: 0,
    health: 'Good',
    weight: 0,
    gender: undefined,
    status: 'active',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 0,
    photoUrl: '',
    isVaccinated: false,
    notes: ''
  });

  // Initialize form with edit data if provided
  useEffect(() => {
    if (animalToEdit) {
      setFormData(animalToEdit);
      if (animalToEdit.photoUrl) {
        setPhotoPreview(animalToEdit.photoUrl);
      }
    }
  }, [animalToEdit]);

  const startCamera = useCallback(async () => {
    try {
      // Check if we're in a secure context
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        alert('Camera access requires a secure connection (HTTPS) or localhost');
        setShowCamera(false);
        return;
      }

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices) {
        alert('Camera access is not supported in this browser. Please try using Chrome, Firefox, or Safari.');
        setShowCamera(false);
        return;
      }

      // First get camera permissions
      const initialStream = await navigator.mediaDevices.getUserMedia({ video: true });
      initialStream.getTracks().forEach(track => track.stop());

      // Then get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);

      if (cameras.length === 0) {
        alert('No cameras found');
        setShowCamera(false);
        return;
      }

      // Find the back camera (environment) if available
      const backCamera = cameras.find(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('rear')
      );

      // Set initial camera
      const initialCamera = backCamera?.deviceId || cameras[0].deviceId;
      setSelectedCamera(initialCamera);

      // Start the camera with the selected device
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: initialCamera }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Please allow camera access to take a photo');
      setShowCamera(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        setPhotoPreview(imageData);
        setFormData(prev => ({ ...prev, photoUrl: imageData }));
        stopCamera();
        setShowCamera(false);
      }
    }
  }, [stopCamera]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setFormData(prev => ({ ...prev, photoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (imagePreview.current) {
        URL.revokeObjectURL(imagePreview.current);
      }
    };
  }, [stopCamera]);

  // Start camera when showing camera
  useEffect(() => {
    if (showCamera) {
      startCamera();
    }
  }, [showCamera, startCamera]);

  const handleFormChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (name === 'isVaccinated') {
      setFormData(prev => ({
        ...prev,
        isVaccinated: value === 'Yes'
      }));
    } else if (type === 'number') {
      const numValue = value === '' ? 0 : Number(value);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.id?.trim()) {
      toast({
        title: "Error",
        description: "Animal ID is required",
        variant: "destructive"
      });
      return false;
    }

    if (!photoPreview) {
      toast({
        title: "Error",
        description: "Animal photo is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.gender) {
      toast({
        title: "Error",
        description: "Gender is required",
        variant: "destructive"
      });
      return false;
    }

    if (formData.purchasePrice === undefined || formData.purchasePrice < 0) {
      toast({
        title: "Error",
        description: "Purchase price must be a non-negative number",
        variant: "destructive"
      });
      return false;
    }

    return true;
  }, [formData, photoPreview, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const cleanId = formData.id.trim();
      
      const newAnimal: Animal = {
        id: cleanId,
        type: formData.type || '',
        breed: formData.breed || '',
        age: formData.age || 0,
        health: formData.health || 'Good',
        weight: formData.weight || 0,
        gender: formData.gender as 'male' | 'female',
        status: formData.status || 'active',
        purchaseDate: formData.purchaseDate,
        purchasePrice: formData.purchasePrice || 0,
        photoUrl: photoPreview,
        isVaccinated: formData.isVaccinated || false,
        notes: formData.notes || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      await onAddAnimal(newAnimal);
      
      toast({
        title: "Success",
        description: animalToEdit ? "Animal updated successfully" : "Animal added successfully",
      });
      
      // Reset form
      setFormData({
        id: '',
        type: '',
        breed: '',
        age: 0,
        health: 'Good',
        weight: 0,
        gender: undefined,
        status: 'active',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: 0,
        photoUrl: '',
        isVaccinated: false,
        notes: ''
      });
      setPhotoPreview(null);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to save animal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Get current camera index
      const currentIndex = availableCameras.findIndex(cam => cam.deviceId === selectedCamera);
      // Get next camera index (loop back to start if at end)
      const nextIndex = (currentIndex + 1) % availableCameras.length;
      const nextCamera = availableCameras[nextIndex];

      setSelectedCamera(nextCamera.deviceId);

      // Start new stream with next camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: nextCamera.deviceId }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      alert('Failed to switch camera');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{animalToEdit ? 'Edit Animal' : 'Add New Animal'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Animal Photo</Label>
            <div className="relative">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Animal preview"
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPhotoPreview(null);
                      setFormData(prev => ({ ...prev, photoUrl: '' }));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : showCamera ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      {availableCameras.length > 1 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          onClick={switchCamera}
                          className="bg-white/90 hover:bg-white shadow-md"
                          title="Switch Camera"
                        >
                          <Camera className="h-5 w-5" />
                          <span className="sr-only">Switch Camera</span>
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={capturePhoto}
                        className="bg-white/90 hover:bg-white shadow-md"
                        title="Take Photo"
                      >
                        <Camera className="h-5 w-5" />
                        <span className="sr-only">Take Photo</span>
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {availableCameras.length > 1 ? 'Tap the camera icon to switch between front and back cameras' : ''}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        stopCamera();
                        setShowCamera(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <div className="flex justify-center gap-4">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                        <div className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-green-600">Upload Photo</span>
                        </div>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50"
                      >
                        <Camera className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-green-600">Take Photo</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <InputField 
            label="Animal ID" 
            name="id" 
            type="text" 
            value={formData.id || ''} 
            onChange={handleFormChange} 
            placeholder="Enter animal ID" 
            required 
          />
         
          <div className="grid grid-cols-2 gap-4">
            <SelectField 
              label="Type" 
              name="type" 
              value={formData.type || ''} 
              onChange={handleFormChange} 
              options={["Cow", "Goat", "Sheep", "Camel"]} 
            />
            <InputField 
              label="Breed" 
              name="breed" 
              type="text" 
              value={formData.breed || ''} 
              onChange={handleFormChange} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <InputField 
              label="Age (years)" 
              name="age" 
              type="number" 
              min={0} 
              step={0.1} 
              value={formData.age || 0} 
              onChange={handleFormChange} 
            />
            <InputField 
              label="Weight (kg)" 
              name="weight" 
              type="number" 
              min={0} 
              step={0.1} 
              value={formData.weight || 0} 
              onChange={handleFormChange} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField 
              label="Gender" 
              name="gender" 
              value={formData.gender || ''} 
              onChange={handleFormChange} 
              required 
              options={["male", "female"]} 
            />
            <InputField 
              label="Purchase Price" 
              name="purchasePrice" 
              type="number" 
              min={0} 
              step={0.01} 
              value={formData.purchasePrice || 0} 
              onChange={handleFormChange} 
              required 
            />
          </div>
          
          <SelectField 
            label="Health Status" 
            name="health" 
            value={formData.health || 'Good'} 
            onChange={handleFormChange} 
            options={["Excellent", "Good", "Fair", "Poor"]} 
          />
          
          <SelectField
            label="Is Vaccinated?"
            name="isVaccinated"
            value={formData.isVaccinated === true ? 'Yes' : 'No'}
            onChange={handleFormChange}
            options={["Yes", "No"]}
          />
          
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : animalToEdit ? 'Update Animal' : 'Add Animal'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose} 
              className="mt-3 w-full sm:mt-0 sm:w-auto"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium text-gray-700">{label}</label>
    <input {...props} className="mt-1 focus:ring-farm-500 focus:border-farm-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2" />
  </div>
);

const SelectField = ({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium text-gray-700">{label}</label>
    <select {...props} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-farm-500 focus:border-farm-500 sm:text-sm rounded-md">
      <option value="" disabled>Select {label.toLowerCase()}</option>
      {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default AddAnimalForm;
