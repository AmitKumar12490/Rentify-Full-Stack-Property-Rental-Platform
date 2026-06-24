import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, IndianRupee, Heart, Bed, Home as HomeIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const PropertyCard = ({ property }) => {
  const { user, wishlist, toggleWishlist } = useContext(AuthContext);
  const isWishlisted = wishlist.includes(property._id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return alert("Please login first");
    toggleWishlist(property._id);
  };

  return (
    <Link to={`/property/${property._id}`} className="block group bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 border border-white hover:-translate-y-1.5">
      <div className="relative h-56 overflow-hidden">
        <img 
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-indigo-700 shadow-sm border border-white/50">
          {property.type}
        </div>
        {user?.role !== 'Owner' && (
          <button 
            onClick={handleWishlistClick}
            className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full hover:bg-white hover:scale-110 transition-all shadow-sm z-10 border border-white/50"
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
          </button>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-extrabold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{property.title}</h3>
          <span className="flex items-center text-indigo-600 font-black text-lg whitespace-nowrap ml-3 bg-indigo-50 px-2 py-1 rounded-lg">
            <IndianRupee className="h-4 w-4" />{property.price.toLocaleString()}
          </span>
        </div>
        <p className="flex items-center text-slate-500 text-sm mb-5 font-medium">
          <MapPin className="h-4 w-4 mr-1.5 shrink-0 text-slate-400" /> <span className="line-clamp-1">{property.location}</span>
        </p>
        <div className="flex items-center gap-5 border-t border-slate-100 pt-5 text-sm font-semibold text-slate-600">
          <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-indigo-400" /> {property.bhk} BHK</span>
          <span className="flex items-center gap-1.5"><HomeIcon className="h-4 w-4 text-indigo-400" /> {property.furnished}</span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
