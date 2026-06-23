import React, { useState, useEffect } from 'react';
import { Search, Compass, Star, SlidersHorizontal, ChevronsUpDown, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { CardSkeleton } from '../components/Skeleton';
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function ExploreServices({ initialKeyword = '', initialCategory = 'All' }) {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  // States for search and filter controls
  const [keyword, setKeyword] =
  useState(location.state?.keyword || '');

  const [category, setCategory] =
  useState(location.state?.category || 'All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('rating'); // Default sorting

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const categories = ['All', 'AC Repair', 'Cleaning', 'Plumbing', 'Plastering'];

  const fetchFilteredServices = async () => {
    setLoading(true);
    try {
      const response = await api.getAllServices({
        keyword,
        category,
        minPrice,
        maxPrice,
        rating,
        sort
      });
      setServices(response.services);

      // Count active locks
      let count = 0;
      if (category !== 'All') count++;
      if (minPrice) count++;
      if (maxPrice) count++;
      if (rating) count++;
      setActiveFiltersCount(count);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredServices();
  }, [category, rating, sort]); // Trigger query on selecting dropdowns or tabs

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFilteredServices();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSort('rating');
  };

  const handleBookRedirect = (srv) => {
    // Navigate straight to calendar booking appointment screen passing selected specs
    navigate('/book', {
  state: {
    serviceId: srv.id,
    providerId: srv.provider_id
  }
});
  };

  return (
    <div className="space-y-6 text-left" id="explore-listings-catalogue">
      
      {/* Header Panel */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center space-x-2">
          <span>Find Professional Services</span>
          <Compass className="text-emerald-500 animate-spin" size={24} style={{ animationDuration: '6s' }} />
        </h1>
        <p className="text-xs text-gray-400">Filter hundreds of background-verified, high-rated local specialists instantly</p>
      </div>

      {/* FILTER CONTROLS GRID */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs space-y-4">
        
        {/* Row 1: Search Form + Category selections */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by keywords e.g. 'clean', 'thermostat'..."
              className="w-full bg-transparent pl-11 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shrink-0 cursor-pointer"
          >
            Apply Keywords
          </button>
        </form>

        {/* Category Tabs list */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none border-b border-gray-50">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 whitespace-nowrap ${
                category === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filters and Sorting drawers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          
          {/* Price Minimum */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Min Price ($)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent px-3.5 py-2 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Price Maximum */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Max Price ($)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="150.00"
              className="w-full bg-transparent px-3.5 py-2 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Rating */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Min Provider Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full bg-white px-2.5 py-2 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
            >
              <option value="">Any Star rating</option>
              <option value="4.8">⭐⭐⭐⭐⭐ 4.8+ Top rating</option>
              <option value="4.5">⭐⭐⭐⭐ 4.5+ High rating</option>
              <option value="4.0">⭐⭐⭐ 4.0+ Satisfied</option>
            </select>
          </div>

          {/* Sorting controls */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Sort Services</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-white px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
            >
              <option value="rating">🏆 Highest Rated Specialist</option>
              <option value="low_to_high">💵 Price: Low to High</option>
              <option value="high_to_low">💰 Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* Actions panel */}
        {(activeFiltersCount > 0 || minPrice || maxPrice) && (
          <div className="flex justify-between items-center pt-2 text-xs">
            <span className="text-gray-500">
              Active configuration locks: <strong className="text-emerald-600">{activeFiltersCount} applied</strong>
            </span>
            <div className="space-x-2">
              <button
                onClick={handleResetFilters}
                className="text-gray-400 font-semibold hover:text-emerald-600 transition"
              >
                Clear all filters
              </button>
              <button
                onClick={fetchFilteredServices}
                className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
              >
                Apply Range Locks
              </button>
            </div>
          </div>
        )}

      </div>

      {/* CATALOG LOGS DISPLAY */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 max-w-lg mx-auto space-y-4">
          <ShieldAlert size={48} className="text-amber-500/40 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="font-extrabold text-gray-950">No Services Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto px-6">
              Your specific filter attributes on keyword "{keyword}" returned 0 records. Try broad search categories or clear filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="bg-emerald-600 text-white font-bold text-xs px-5 py-2 rounded-xl hover:bg-emerald-700 transition"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div key={srv.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-100 hover:shadow-xl transition-all duration-300" id={`service-item-${srv.id}`}>
              {/* Photo */}
              <div className="relative h-44 overflow-hidden bg-gray-55">
                <img
                  src={srv.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'}
                  alt={srv.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[9px] font-black text-emerald-650 uppercase tracking-widest shadow-2xs">
                  {srv.category}
                </span>
                
                {/* Duration badging */}
                <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-semibold px-2 py-1 rounded-md">
                  {srv.duration} mins
                </span>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center text-[11px]">
                  {/* Clicking provider profile */}
                  <button
                    onClick={() => navigate(`/provider/${srv.provider_id}`)}
                    className="text-gray-450 font-bold hover:text-emerald-600 transition"
                  >
                    Partner: <span className="text-gray-800 underline decoration-dotted">{srv.provider_name}</span>
                  </button>

                  <div className="flex items-center space-x-1 text-amber-500 font-bold">
                    <Star size={12} fill="currentColor" />
                    <span>{srv.provider_rating}</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-gray-950 group-hover:text-emerald-600 transition-colors line-clamp-1">{srv.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed min-h-8">{srv.description}</p>
                
                {/* Checkout pricing panel */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                  <div className="text-left">
                    <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Fixed wage</span>
                    <span className="text-lg font-black text-gray-900">${srv.price}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/provider/${srv.provider_id}`)}
                      className="border border-gray-200 hover:border-emerald-500 text-gray-600 hover:text-emerald-600 text-[11px] font-bold px-3 py-2 rounded-xl transition"
                    >
                      Audit Bio
                    </button>
                    <button
                      onClick={() => handleBookRedirect(srv)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold px-4 py-2 rounded-xl transition shadow-md shadow-emerald-500/10 cursor-pointer"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
