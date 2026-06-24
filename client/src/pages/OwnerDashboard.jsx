import { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { AuthContext } from '../context/AuthContext';
import { Plus, Loader2 } from 'lucide-react';

const OwnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user || user.role !== 'Owner') {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchOwnerProperties = async () => {
      try {
        const { data } = await api.get('/property/owner/all');
        setProperties(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOwnerProperties();
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this property?")) {
      try {
        await api.delete(`/property/${id}`);
        setProperties(properties.filter(p => p._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
        <Link to="/add-property" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium">
          <Plus className="h-5 w-5" /> Add Property
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <p className="text-xl text-gray-500 font-medium mb-4">You haven't listed any properties yet.</p>
          <Link to="/add-property" className="text-blue-600 hover:underline font-medium">List your first property</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <div key={property._id} className="relative group">
              <PropertyCard property={property} />
              <div className="absolute top-3 right-3 flex gap-2 z-20">
                <Link to={`/edit-property/${property._id}`} className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full shadow-sm hover:bg-white text-xs font-bold border border-blue-100">
                  Edit
                </Link>
                <button onClick={() => handleDelete(property._id)} className="px-3 py-1 bg-white/90 backdrop-blur-sm text-red-600 rounded-full shadow-sm hover:bg-white text-xs font-bold border border-red-100">
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
