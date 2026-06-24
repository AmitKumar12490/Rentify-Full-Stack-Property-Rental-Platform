import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { AuthContext } from '../context/AuthContext';
import { Loader2, HeartCrack } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user || user.role !== 'User') {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await api.get('/wishlist');
        setProperties(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">My Wishlist</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <HeartCrack className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500 font-medium">Your wishlist is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
