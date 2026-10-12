import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, IndianRupee, Heart, Bed, Home as HomeIcon, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const PropertyCard = ({ property, score, matchReasons = [] }) => {
  const { user, wishlist, toggleWishlist } = useContext(AuthContext);
  const isWishlisted = wishlist.includes(property._id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return alert("Please login first");
    toggleWishlist(property._id);
  };

  const percentageScore = typeof score === 'number' ? Math.round(score * 100) : null;

  return (
    <Link to={`/property/${property._id}`} className="block group bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 border border-slate-100 hover:border-indigo-200 hover:-translate-y-1.5 flex flex-col justify-between">
      <div>
        <div className="relative h-56 overflow-hidden">
          <img 
            src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <div className="absolute top-4 left-4 flex items-center gap-1.5">
            <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-indigo-700 shadow-sm border border-white/50">
              {property.type}
            </span>
            {percentageScore !== null && (
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-extrabold shadow-md flex items-center gap-1 border border-emerald-400/30 animate-pulse">
                <Sparkles className="h-3 w-3" /> {percentageScore}% Match
              </span>
            )}
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

          <p className="flex items-center text-slate-500 text-sm mb-4 font-medium">
            <MapPin className="h-4 w-4 mr-1.5 shrink-0 text-slate-400" /> <span className="line-clamp-1">{property.location}</span>
          </p>

          <div className="flex items-center gap-5 text-sm font-semibold text-slate-600 mb-4">
            <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-indigo-400" /> {property.bhk} BHK</span>
            <span className="flex items-center gap-1.5"><HomeIcon className="h-4 w-4 text-indigo-400" /> {property.furnished}</span>
          </div>

          {/* AI Match Reasons */}
          {matchReasons && matchReasons.length > 0 && (
            <div className="space-y-1 mb-4 pt-3 border-t border-slate-100">
              {matchReasons.slice(0, 2).map((reason, i) => (
                <div key={i} className="text-xs font-medium text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{reason}</span>
                </div>
              ))}
            </div>
          )}

          {/* Amenities Pills */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {property.amenities.slice(0, 3).map((am, i) => (
                <span key={i} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                  {am}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="text-[11px] font-medium text-slate-400 self-center">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-6 pb-5 pt-2 border-t border-slate-50 flex items-center justify-between text-indigo-600 group-hover:text-indigo-700 font-bold text-sm">
        <span>View Details</span>
        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};

export default PropertyCard;
