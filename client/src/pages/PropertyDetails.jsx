import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import MapComponent from '../components/MapComponent';
import { AuthContext } from '../context/AuthContext';
import { MapPin, IndianRupee, Bed, Home as HomeIcon, Phone, User, Loader2 } from 'lucide-react';

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await api.get(`/property/${id}`);
        setProperty(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (!property) return <div className="text-center py-20">Property not found</div>;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="h-[400px] w-full relative">
        <img src={property.images?.[activeImage] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} alt={property.title} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full font-semibold">
          {property.type}
        </div>
      </div>
      {property.images && property.images.length > 1 && (
        <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto border-b">
          {property.images.map((img, idx) => (
            <img 
              key={idx} 
              src={img} 
              alt={`thumbnail ${idx}`} 
              onClick={() => setActiveImage(idx)}
              className={`h-20 w-32 object-cover rounded cursor-pointer border-2 transition ${activeImage === idx ? 'border-blue-600' : 'border-transparent hover:border-gray-300'}`} 
            />
          ))}
        </div>
      )}
      
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
            <p className="flex items-center text-gray-500"><MapPin className="h-5 w-5 mr-1 shrink-0" /> {property.location}</p>
          </div>

          <div className="flex gap-6 border-y py-4 text-gray-700">
            <span className="flex items-center gap-2"><Bed className="h-5 w-5 text-blue-600" /> {property.bhk} BHK</span>
            <span className="flex items-center gap-2"><HomeIcon className="h-5 w-5 text-blue-600" /> {property.furnished}</span>
            <span className="flex items-center gap-1 font-bold text-xl text-blue-600 ml-auto">
              <IndianRupee className="h-6 w-6" /> {property.price.toLocaleString()}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">Description</h2>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{property.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">Location on Map</h2>
            <MapComponent lat={property.coordinates?.lat} lng={property.coordinates?.lng} title={property.title} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border">
            <h3 className="text-lg font-bold mb-4">Contact Owner</h3>
            <div className="space-y-4">
              <p className="flex items-center gap-3 text-gray-700"><User className="h-5 w-5 text-blue-600 shrink-0" /> {property.ownerId?.name || "Unknown Owner"}</p>
              <p className="flex items-center gap-3 text-gray-700 break-all"><Phone className="h-5 w-5 text-blue-600 shrink-0" /> {property.ownerId?.phone || "Phone not provided"}</p>
              
              {user ? (
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Send Message
                </button>
              ) : (
                <Link to="/login" className="block text-center w-full bg-blue-100 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-200 transition">
                  Login to Contact
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
