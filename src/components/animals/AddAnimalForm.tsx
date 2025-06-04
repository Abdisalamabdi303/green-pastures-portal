import { Animal } from '@/types';
import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';

interface AddAnimalFormProps {
  onAddAnimal: (animal: Animal) => void;
  onClose: () => void;
  animalToEdit?: Animal;
}

const AddAnimalForm = ({ onAddAnimal, onClose, animalToEdit }: AddAnimalFormProps) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Animal>>({
    id: '',
    type: '',
    breed: '',
    age: 0,
    health: 'Good',
    weight: 0,
    gender: '',
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
      // For number inputs, use the value directly if it's a valid number
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

    if (!formData.purchasePrice || formData.purchasePrice <= 0) {
      alert('Purchase price is required and must be greater than 0');
      return;
    }

    // Remove any whitespace from ID
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
      gender: formData.gender,
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
      gender: '',
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
                  <PhotoUpload 
                    preview={photoPreview || formData.photoUrl} 
                    onFileChange={handlePhotoChange} 
                    onRemove={() => { 
                      setPhotoPreview(null); 
                      setFormData((prev) => ({ ...prev, photoUrl: '' })); 
                    }} 
                  />
                  
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
                      options={["Male", "Female"]} 
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

const PhotoUpload = ({ preview, onFileChange, onRemove }: { preview: string | null; onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onRemove: () => void }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">Animal Photo</label>
    <div className="mt-1 flex justify-center border-2 border-gray-300 border-dashed rounded-md">
      <div className="space-y-1 text-center p-4 w-full">
        {preview ? (
          <div className="mx-auto w-32 h-32 relative">
            <img src={preview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-md" />
            <button type="button" className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs" onClick={onRemove}>&times;</button>
          </div>
        ) : (
          <>
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="flex text-sm text-gray-600 justify-center">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-farm-600 hover:text-farm-500 focus-within:outline-none">
                <span>Upload a photo</span>
                <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={onFileChange} />
              </label>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </>
        )}
      </div>
    </div>
  </div>
);

export default AddAnimalForm;
