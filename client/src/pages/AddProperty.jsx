import { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const AddProperty = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    lat: '',
    lng: '',
    type: 'Apartment',
    bhk: '1',
    furnished: 'Unfurnished'
  });
  const [images, setImages] = useState(null);

  if (!user || user.role !== 'Owner') {
    return <Navigate to="/" />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    for (let key in formData) {
      data.append(key, formData[key]);
    }
    if (images) {
      for (let i = 0; i < images.length; i++) {
        data.append('images', images[i]);
      }
    }

    try {
      await api.post('/property', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">List a New Property</h2>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" required rows="4" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BHK</label>
            <select name="bhk" value={formData.bhk} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
              <option value="Studio">Studio</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
            <select name="furnished" value={formData.furnished} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="Furnished">Furnished</option>
              <option value="Semi-Furnished">Semi-Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address</label>
          <input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude (Optional)</label>
            <input type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude (Optional)</label>
            <input type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Images (Max 5)</label>
          <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold flex justify-center items-center">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'List Property'}
        </button>
      </form>
    </div>
  );
};

export default AddProperty;
