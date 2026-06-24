import { useState } from 'react';

const FilterSidebar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    location: '',
    bhk: '',
    furnished: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-8">
      <h2 className="text-lg font-bold mb-6 text-gray-900">Filters</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input 
            type="text" 
            name="location"
            onChange={handleChange}
            placeholder="e.g. Mumbai, Delhi"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">BHK</label>
          <select name="bhk" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="">Any</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
          <select name="furnished" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="">Any</option>
            <option value="Furnished">Furnished</option>
            <option value="Semi-Furnished">Semi-Furnished</option>
            <option value="Unfurnished">Unfurnished</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              name="minPrice"
              onChange={handleChange}
              placeholder="Min"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input 
              type="number" 
              name="maxPrice"
              onChange={handleChange}
              placeholder="Max"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
