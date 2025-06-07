import { Animal } from '@/types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, RotateCcw } from 'lucide-react';

interface AddAnimalFormProps {
  onAddAnimal: (animal: Animal) => void;
  onClose: () => void;
  animalToEdit?: Animal | null;
}

const AddAnimalForm = ({ onAddAnimal, onClose, animalToEdit }: AddAnimalFormProps) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setPhotoPreview(imageData);
        setFormData(prev => ({ ...prev, photoUrl: imageData }));
        stopCamera();
        setShowCamera(false);
      }
    }
  }, [stopCamera]);

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    startCamera();
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (showCamera) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showCamera, startCamera, stopCamera]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (name === 'isVaccinated') {
      setFormData({
        ...formData,
        isVaccinated: value === 'Yes'
      });
    } else if (type === 'number') {
      const numValue = value === '' ? 0 : Number(value);
      setFormData({
        ...formData,
        [name]: isNaN(numValue) ? 0 : numValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setFormData((prev) => ({ ...prev, photoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id) {
      alert('Animal ID is required');
      return;
    }

    if (!photoPreview) {
      alert('Animal photo is required');
      return;
    }

    if (!formData.gender) {
      alert('Gender is required');
      return;
    }

    if (formData.purchasePrice === undefined || formData.purchasePrice < 0) {
      alert('Purchase price must be a non-negative number');
      return;
    }

    const cleanId = formData.id.trim();
    
    if (!cleanId) {
      alert('Animal ID cannot be empty');
      return;
    }
    
    const newAnimal: Animal = {
      id: cleanId,
      type: formData.type || '',
      breed: formData.breed,
      age: formData.age || 0,
      health: formData.health || 'Good',
      weight: formData.weight || 0,
      gender: formData.gender as 'male' | 'female',
      status: formData.status || 'active',
      purchaseDate: formData.purchaseDate,
      purchasePrice: formData.purchasePrice,
      photoUrl: photoPreview,
      isVaccinated: formData.isVaccinated || false,
      notes: formData.notes || '',
      createdAt: Timestamp.now()
    };
    
    onAddAnimal(newAnimal);
    
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
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {animalToEdit ? 'Edit Animal' : 'Add New Animal'}
                </h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Animal Photo</label>
                    <div className="mt-1 flex justify-center border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center p-4 w-full">
                        {photoPreview ? (
                          <div className="mx-auto w-32 h-32 relative">
                            <img src={photoPreview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-md" />
                            <button 
                              type="button" 
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs" 
                              onClick={() => {
                                setPhotoPreview(null);
                                setFormData(prev => ({ ...prev, photoUrl: '' }));
                              }}
                            >
                              &times;
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="flex text-sm text-gray-600 justify-center gap-4">
                              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-farm-600 hover:text-farm-500 focus-within:outline-none">
                                <span>Upload a photo</span>
                                <input 
                                  id="file-upload" 
                                  name="file-upload" 
                                  type="file" 
                                  accept="image/*" 
                                  className="sr-only" 
                                  onChange={handlePhotoChange} 
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setShowCamera(true)}
                                className="relative cursor-pointer bg-white rounded-md font-medium text-farm-600 hover:text-farm-500 focus-within:outline-none"
                              >
                                Take a photo
                              </button>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {showCamera && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-4 max-w-lg w-full mx-4">
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex justify-center gap-4 mt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (isCameraOn) {
                                stopCamera();
                              } else {
                                startCamera();
                              }
                            }}
                            className="flex items-center gap-2"
                          >
                            {isCameraOn ? (
                              <>
                                <CameraOff className="h-4 w-4" />
                                Turn Off
                              </>
                            ) : (
                              <>
                                <Camera className="h-4 w-4" />
                                Turn On
                              </>
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={switchCamera}
                            className="flex items-center gap-2"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Switch Camera
                          </Button>
                          
                          <Button
                            onClick={capturePhoto}
                            disabled={!isCameraOn}
                            className="flex items-center gap-2"
                          >
                            <Camera className="h-4 w-4" />
                            Take Photo
                          </Button>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button 
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
                    </div>
                  )}
                  
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
                    <button 
                      type="submit" 
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-farm-600 text-base font-medium text-white hover:bg-farm-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {animalToEdit ? 'Update Animal' : 'Add Animal'}
                    </button>
                    <button 
                      type="button" 
                      onClick={onClose} 
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
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
