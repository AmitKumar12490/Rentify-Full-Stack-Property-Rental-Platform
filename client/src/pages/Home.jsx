import { useState, useEffect } from 'react';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import FilterSidebar from '../components/FilterSidebar';
import SemanticSearch from '../components/SemanticSearch';
import { Loader2, Sparkles, SlidersHorizontal, RotateCcw } from 'lucide-react';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [semanticResults, setSemanticResults] = useState(null);
  const [activeSemanticQuery, setActiveSemanticQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProperties = async (filters = {}) => {
    setLoading(true);
    // If traditional filters are adjusted, clear semantic mode to avoid conflicting states
    setSemanticResults(null);
    setActiveSemanticQuery('');
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/property?${params}`);
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSemanticSearchResults = ({ query, results }) => {
    setActiveSemanticQuery(query);
    setSemanticResults(results);
  };

  const handleClearSemanticSearch = () => {
    setSemanticResults(null);
    setActiveSemanticQuery('');
    fetchProperties();
  };

  // Determine which list to render: semantic search results or standard filter results
  const isSemanticMode = semanticResults !== null;
  const displayItems = isSemanticMode ? semanticResults : properties;

  return (
    <div className="space-y-6">
      {/* Hero & Semantic Search Section */}
      <div className="mb-2">
        <div className="max-w-4xl mx-auto text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-3 shadow-xs">
            <Sparkles className="h-3.5 w-3.5" /> Next-Gen AI Rental Search
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Find Your Dream Home with <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">AI Intelligence</span>
          </h1>
          <p className="mt-2.5 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            Search naturally in everyday language or use precision filters to discover the perfect verified rental.
          </p>
        </div>

        {/* Semantic Search Component */}
        <SemanticSearch
          onSearchResults={handleSemanticSearchResults}
          onClearSearch={handleClearSemanticSearch}
          activeQuery={activeSemanticQuery}
        />
      </div>

      {/* Main Content Layout: Filters + Property Grid */}
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <FilterSidebar onFilterChange={fetchProperties} />
        </aside>

        <section className="w-full md:w-3/4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {isSemanticMode ? (
                  <>
                    <Sparkles className="h-6 w-6 text-indigo-600" />
                    Semantic Search Results
                  </>
                ) : (
                  'Discover Properties'
                )}
              </h2>
              {isSemanticMode && activeSemanticQuery && (
                <p className="text-sm text-slate-500 mt-1">
                  Showing top recommendations for <span className="font-semibold text-slate-700">"{activeSemanticQuery}"</span>
                </p>
              )}
            </div>

            {isSemanticMode && (
              <button
                onClick={handleClearSemanticSearch}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset to All Properties
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500 font-medium">Loading properties...</p>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="text-center bg-white/80 backdrop-blur-md p-12 rounded-2xl border border-slate-200/80 shadow-sm">
              <p className="text-slate-600 font-semibold text-lg mb-2">No matching properties found.</p>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                {isSemanticMode
                  ? "Try broadening your query, increasing your budget limit, or checking nearby locations."
                  : "Try clearing some filters or exploring other locations."}
              </p>
              {isSemanticMode && (
                <button
                  onClick={handleClearSemanticSearch}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
                >
                  Browse All Available Rentals
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayItems.map((item) => {
                const property = isSemanticMode ? item.property : item;
                const score = isSemanticMode ? item.score : undefined;
                const matchReasons = isSemanticMode ? item.matchReasons : undefined;
                return (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    score={score}
                    matchReasons={matchReasons}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
