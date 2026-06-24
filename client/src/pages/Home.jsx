import { useState, useEffect } from 'react';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import FilterSidebar from '../components/FilterSidebar';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/property?${params}`);
      setProperties(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/4">
        <FilterSidebar onFilterChange={fetchProperties} />
      </div>
      <div className="w-full md:w-3/4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Discover Properties</h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : properties.length === 0 ? (
          <p className="text-gray-500 bg-white p-8 rounded-xl border text-center">No properties found matching your criteria.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
