import { useState } from 'react';
import { Search, Sparkles, Loader2, X, BrainCircuit, CheckCircle2, SlidersHorizontal, ArrowRight } from 'lucide-react';
import api from '../services/api';

const EXAMPLE_QUERIES = [
  "2BHK near Chandigarh University under ₹20,000",
  "Furnished house with parking for a family",
  "Affordable studio near university with good connectivity",
  "Show me houses with 2 bedrooms and a balcony",
  "Find a pet-friendly rental with parking"
];

const SemanticSearch = ({ onSearchResults, onClearSearch, activeQuery }) => {
  const [query, setQuery] = useState(activeQuery || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [extractedFilters, setExtractedFilters] = useState(null);

  const handleSearch = async (searchQuery) => {
    const q = (searchQuery !== undefined ? searchQuery : query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setQuery(q);

    try {
      // Send natural language query to the RAG semantic search endpoint
      const { data } = await api.post('/property/semantic-search', { query: q });
      
      setAiSummary(data.aiResponse || null);
      setExtractedFilters(data.extractedConstraints || null);

      if (onSearchResults) {
        onSearchResults({
          query: q,
          results: data.results || [],
          aiResponse: data.aiResponse,
          extractedConstraints: data.extractedConstraints,
          count: data.count || 0
        });
      }
    } catch (err) {
      console.error('Semantic search error:', err);
      const errMsg = err.response?.data?.message || 'Failed to complete semantic search. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery('');
    setAiSummary(null);
    setExtractedFilters(null);
    setError(null);
    if (onClearSearch) {
      onClearSearch();
    }
  };

  const handleChipClick = (example) => {
    setQuery(example);
    handleSearch(example);
  };

  return (
    <div className="w-full mb-8">
      {/* Search Input Box */}
      <div className="relative rounded-2xl bg-white/90 backdrop-blur-xl shadow-lg shadow-indigo-500/5 border border-indigo-100/80 p-2 sm:p-3 transition-all focus-within:shadow-indigo-500/15 focus-within:border-indigo-300">
        <div className="flex items-center gap-2">
          <div className="pl-3 text-indigo-500 shrink-0">
            <BrainCircuit className="h-6 w-6 animate-pulse" />
          </div>

          <input
            type="text"
            id="semantic-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="🔎 Search naturally: '2BHK furnished apartment near university under ₹20,000'..."
            className="w-full py-2.5 px-2 bg-transparent text-slate-800 placeholder-slate-400 font-medium focus:outline-none text-base sm:text-lg"
          />

          {query && (
            <button
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              title="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-indigo-500/25 transition-all shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="hidden sm:inline">Searching...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span className="hidden sm:inline">AI Search</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 px-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="h-3 w-3 text-indigo-500" /> Try:
          </span>
          {EXAMPLE_QUERIES.map((example, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(example)}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-700 border border-indigo-200/50 transition-all text-left truncate max-w-xs sm:max-w-none hover:scale-[1.02] active:scale-[0.98]"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* AI RAG Response Card */}
      {aiSummary && !loading && (
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-indigo-900/95 via-slate-900 to-blue-950 text-white p-5 sm:p-6 shadow-xl border border-indigo-400/20 backdrop-blur-xl relative overflow-hidden animate-fadeIn">
          {/* Subtle background glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center p-1.5 rounded-lg bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-indigo-200">Rentify AI Property Insights</h3>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 border border-indigo-300/30">
                  RAG Powered
                </span>
              </div>

              <button
                onClick={handleClear}
                className="text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1 transition"
              >
                Reset to All Properties <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Extracted Query Constraints */}
            {extractedFilters && Object.keys(extractedFilters).length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-indigo-300/80 font-medium">Understood Intent:</span>
                {extractedFilters.maxPrice && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-white/10 text-emerald-300 border border-emerald-400/30">
                    Max Rent: ₹{extractedFilters.maxPrice.toLocaleString()}
                  </span>
                )}
                {extractedFilters.bhk && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-white/10 text-cyan-300 border border-cyan-400/30">
                    {extractedFilters.bhk} BHK
                  </span>
                )}
                {extractedFilters.furnished && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-white/10 text-purple-300 border border-purple-400/30">
                    {extractedFilters.furnished}
                  </span>
                )}
                {extractedFilters.type && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-white/10 text-amber-300 border border-amber-400/30">
                    {extractedFilters.type}
                  </span>
                )}
                {extractedFilters.amenities && extractedFilters.amenities.map((am, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-white/10 text-blue-300 border border-blue-400/30">
                    +{am}
                  </span>
                ))}
              </div>
            )}

            {/* Natural Language LLM Synthesis */}
            <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-normal">
              {aiSummary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemanticSearch;
