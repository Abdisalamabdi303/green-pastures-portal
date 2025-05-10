
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { animalData } from '../data/mockData';
import { User, Animal } from '../types';

const AnimalsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    type: '',
    breed: '',
    age: 0,
    health: 'Good',
    weight: 0,
    photoUrl: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    setAnimals(animalData);
  }, [navigate]);

  const filteredAnimals = animals.filter(animal => 
    animal.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convert numeric values
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
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
        setFormData({
          ...formData,
          photoUrl: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new animal object
    const newAnimal: Animal = {
      id: formData.id || `a${animals.length + 1}`,
      ...formData,
      photoUrl: photoPreview || undefined
    };
    
    // Add to animals array
    setAnimals([...animals, newAnimal]);
    
    // Reset form
    setFormData({
      id: '',
      type: '',
      breed: '',
      age: 0,
      health: 'Good',
      weight: 0,
      photoUrl: ''
    });
    setPhotoPreview(null);
    setIsAddAnimalOpen(false);
  };

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h1 className="text-2xl font-semibold text-gray-900">Animals</h1>
            <div className="flex space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search animals..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-farm-500 focus:border-farm-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <button 
                className="bg-farm-600 text-white px-4 py-2 rounded-md hover:bg-farm-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500"
                onClick={() => setIsAddAnimalOpen(true)}
              >
                Add Animal
              </button>
            </div>
          </div>
          
          {/* Display animals as cards to show photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredAnimals.length > 0 ? (
              filteredAnimals.map((animal) => (
                <div key={animal.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                  <div className="h-48 w-full bg-gray-200 overflow-hidden">
                    {animal.photoUrl ? (
                      <img 
                        src={animal.photoUrl} 
                        alt={`${animal.type} - ${animal.breed}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{animal.type}</h3>
                        <p className="text-sm text-gray-600">ID: {animal.id}</p>
                        <p className="text-sm text-gray-600">Breed: {animal.breed}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                        animal.health === 'Excellent' ? 'bg-green-100 text-green-800' : 
                        animal.health === 'Good' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {animal.health}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Age:</span>
                        <span className="ml-2 text-gray-900">{animal.age} {animal.age === 1 ? 'year' : 'years'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Weight:</span>
                        <span className="ml-2 text-gray-900">{animal.weight ? `${animal.weight} kg` : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <button className="text-farm-600 hover:text-farm-900 text-sm font-medium">Edit</button>
                      <button className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 bg-white rounded-lg border border-gray-200">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No animals found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new animal.</p>
              </div>
            )}
          </div>
          
          {/* Animals Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Photo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Breed
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weight
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Health
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAnimals.length > 0 ? (
                    filteredAnimals.map((animal) => (
                      <tr key={animal.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {animal.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                            {animal.photoUrl ? (
                              <img 
                                src={animal.photoUrl} 
                                alt={`${animal.type}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {animal.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {animal.breed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {animal.age} {animal.age === 1 ? 'year' : 'years'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {animal.weight ? `${animal.weight} kg` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            animal.health === 'Excellent' ? 'bg-green-100 text-green-800' : 
                            animal.health === 'Good' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {animal.health}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-farm-600 hover:text-farm-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                        No animals found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add Animal Modal */}
      {isAddAnimalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsAddAnimalOpen(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Add New Animal
                    </h3>
                    
                    <form onSubmit={handleAddAnimal} className="mt-4 space-y-4">
                      {/* Animal ID */}
                      <div>
                        <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                          Animal ID
                        </label>
                        <input
                          type="text"
                          name="id"
                          id="id"
                          value={formData.id}
                          onChange={handleFormChange}
                          className="mt-1 focus:ring-farm-500 focus:border-farm-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          required
                          placeholder="Enter animal ID"
                        />
                      </div>
                      
                      {/* Photo Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Animal Photo
                        </label>
                        <div className="mt-1 flex justify-center border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center p-4 w-full">
                            {photoPreview ? (
                              <div className="mx-auto w-32 h-32 relative">
                                <img 
                                  src={photoPreview} 
                                  alt="Preview" 
                                  className="mx-auto h-32 w-32 object-cover rounded-md"
                                />
                                <button 
                                  type="button"
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                                  onClick={() => {
                                    setPhotoPreview(null);
                                    setFormData({...formData, photoUrl: ''});
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
                                <div className="flex text-sm text-gray-600 justify-center">
                                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-farm-600 hover:text-farm-500 focus-within:outline-none">
                                    <span>Upload a photo</span>
                                    <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
                                  </label>
                                </div>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG, GIF up to 10MB
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Type */}
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                            Type
                          </label>
                          <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleFormChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-farm-500 focus:border-farm-500 sm:text-sm rounded-md"
                            required
                          >
                            <option value="" disabled>Select type</option>
                            <option value="Cow">Cow</option>
                            <option value="Goat">Goat</option>
                            <option value="Sheep">Sheep</option>
                            <option value="Chicken">Chicken</option>
                            <option value="Duck">Duck</option>
                            <option value="Horse">Horse</option>
                          </select>
                        </div>

                        {/* Breed */}
                        <div>
                          <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
                            Breed
                          </label>
                          <input
                            type="text"
                            name="breed"
                            id="breed"
                            value={formData.breed}
                            onChange={handleFormChange}
                            className="mt-1 focus:ring-farm-500 focus:border-farm-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Age */}
                        <div>
                          <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                            Age (years)
                          </label>
                          <input
                            type="number"
                            name="age"
                            id="age"
                            min="0"
                            step="0.1"
                            value={formData.age}
                            onChange={handleFormChange}
                            className="mt-1 focus:ring-farm-500 focus:border-farm-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>

                        {/* Weight */}
                        <div>
                          <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            name="weight"
                            id="weight"
                            min="0"
                            step="0.1"
                            value={formData.weight}
                            onChange={handleFormChange}
                            className="mt-1 focus:ring-farm-500 focus:border-farm-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                      </div>

                      {/* Health Status */}
                      <div>
                        <label htmlFor="health" className="block text-sm font-medium text-gray-700">
                          Health Status
                        </label>
                        <select
                          id="health"
                          name="health"
                          value={formData.health}
                          onChange={handleFormChange}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-farm-500 focus:border-farm-500 sm:text-sm rounded-md"
                        >
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Poor">Poor</option>
                        </select>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-farm-600 text-base font-medium text-white hover:bg-farm-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Add Animal
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500 sm:mt-0 sm:w-auto sm:text-sm"
                          onClick={() => setIsAddAnimalOpen(false)}
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
      )}
    </div>
  );
};

export default AnimalsPage;
