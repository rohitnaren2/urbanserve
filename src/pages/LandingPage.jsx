import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ShieldCheck, HeartHandshake, UserCheck, Star, ArrowRight, Quote, Plus } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const srvResponse = await api.getAllServices();
        setServices(srvResponse.services.slice(0, 4)); // Get top 4 popular

        // Retrieve approved providers
        const pResponse = await api.getAllServices(); // Use services endpoint with aggregates
        const seenProviders = {};
        const uniqueProviders = [];
        
        srvResponse.services.forEach(s => {
          if (!seenProviders[s.provider_id]) {
            seenProviders[s.provider_id] = true;
            uniqueProviders.push({
              id: s.provider_id,
              name: s.provider_name,
              business: s.provider_business_name,
              photo: s.provider_photo,
              rating: s.provider_rating,
              category: s.category
            });
          }
        });

        setProviders(uniqueProviders.slice(0, 3));
      } catch (err) {
        console.error('Error seeding UI data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/explore', {
  state: { keyword: searchQuery }
});
  };

  const handleQuickCategory = (cat) => {
    navigate('/explore', {
  state: { category: cat }
});
  };

  return (
    <div className="bg-white min-h-screen pt-16" id="welcome-landing-screen">
      
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-gray-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Narrative Text */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
                <Sparkles size={14} className="text-emerald-600 animate-spin" />
                <span>Premium Quality Household Assistance</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-none">
                Elite Handyman & Wellness <span className="text-emerald-600">Services at Your Door</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
                Skip the directory hunting. Connect instantly with background-verified, high-rated local professionals for AC jet cleaning, sanitization housekeeping, plumbing repairs, and wellness services.
              </p>

              {/* Dynamic unified keyword search */}
              <form onSubmit={handleSearchSubmit} className="flex bg-white/90 backdrop-blur-sm shadow-xl p-2 rounded-2xl border border-gray-100 max-w-xl transition-all focus-within:ring-2 focus-within:ring-emerald-500/20">
                <div className="flex items-center flex-1 px-3">
                  <Search className="text-emerald-600" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search e.g. AC service, sofa cleaning..."
                    className="w-full bg-transparent pl-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                    id="hero-input-field"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3.5 rounded-xl transition"
                  id="search-explore-btn"
                >
                  Find Expert
                </button>
              </form>

              {/* Quick tags */}
              <div className="flex flex-wrap gap-2 pt-1 items-center">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Popular categories:</span>
                {['AC Repair', 'Cleaning', 'Plumbing', 'Plastering'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleQuickCategory(cat)}
                    className="text-xs bg-white hover:bg-emerald-50 hover:text-emerald-600 text-gray-600 px-3.5 py-1.5 rounded-full border border-gray-100 shadow-2xs font-medium cursor-pointer transition"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side Visual Graphic Illustration */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-[400px] lg:max-w-none">
                <div className="absolute inset-0 bg-emerald-200/30 rounded-3xl blur-3xl transform rotate-12"></div>
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600"
                  alt="Premium Cleaning Service"
                  className="relative rounded-3xl shadow-2xl object-cover h-[420px] w-full border border-gray-200"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center space-x-3 border border-gray-50">
                  <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900 leading-tight">100% Background Verified</p>
                    <span className="text-[10px] text-gray-400 font-medium">UrbanServe certified specialists</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. POPULAR SERVICES SECTION */}
      <section className="py-20 bg-white border-t border-gray-50 text-center relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-2">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Our Highly Requested Services</h2>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Book customized professional services directly online. Fully equipped experts arrive with specialized machinery.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-60 bg-gray-55/40 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {services.map((srv) => (
                <div key={srv.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-100 hover:shadow-xl transition-all duration-300" id={`popular-srv-${srv.id}`}>
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    <img
                      src={srv.image}
                      alt={srv.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-black text-emerald-600 uppercase tracking-widest shadow-xs">
                      {srv.category}
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-semibold">{srv.provider_name}</span>
                      <div className="flex items-center space-x-1 text-amber-500 font-bold">
                        <Star size={12} fill="currentColor" />
                        <span>{srv.provider_rating}</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{srv.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{srv.description}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                      <span className="text-lg font-black text-gray-900">${srv.price}</span>
                      <button
                        onClick={() => navigate(`/provider/${srv.provider_id}`, {
      state: { providerId: srv.provider_id }
    })}
                        className="bg-emerald-50 hover:bg-emerald-600 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        Inspect / Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10">
            <button
              onClick={() => navigate('/explore')}
              className="inline-flex items-center space-x-1 text-emerald-600 text-xs font-bold tracking-wide uppercase hover:text-emerald-700 border-b-2 border-emerald-500/20 hover:border-emerald-600 transition-all cursor-pointer pb-1"
            >
              <span>Explore All Household Services</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="py-20 bg-gray-50 text-center border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 space-y-2">
            <h2 className="text-3xl font-black text-gray-900">Seamless Flow: How It Works</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">Four simple steps to absolute restoration comfort.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="text-center space-y-3 relative">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-md border border-gray-100 text-emerald-600 font-bold text-xl relative">
                <span>01</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Choose Premium Service</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">Inspect custom catalog slots, read transparent professional quotes & rating reviews.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-3 relative">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-md border border-gray-100 text-emerald-600 font-bold text-xl relative">
                <span>02</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Schedule Calendar Slot</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">Select a preferred schedule and safely execute booking confirmation with ease.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-3 relative">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-md border border-gray-100 text-emerald-600 font-bold text-xl relative">
                <span>03</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Provider Arrives Promptly</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">Our fully equipped specialist reaches your address with specialized safety kits.</p>
            </div>

            {/* Step 4 */}
            <div className="text-center space-y-3 relative">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-md border border-gray-100 text-emerald-600 font-bold text-xl relative">
                <span>04</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Complete and Review</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">Safely pay for tasks completed, complete invoice checks, and drop a star review.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. TOP CERTIFIED PROVIDERS SECTION */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 space-y-2">
            <h2 className="text-3xl font-black text-gray-900">Highest Rated Service Specialists</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">Fully certified background verified technical crews who consistently score above 4.8 stars.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {providers.map((p) => (
              <div key={p.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-lg transition-transform duration-300 flex items-center space-x-4">
                <img
                  src={p.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={p.name}
                  className="w-16 h-16 rounded-xl object-cover ring-4 ring-emerald-500/10 shrink-0"
                />
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center space-x-1.5 text-amber-500 font-bold text-xs">
                    <Star size={12} fill="currentColor" />
                    <span>{p.rating} Stars</span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 truncate text-sm">{p.name}</h3>
                  <p className="text-xs text-gray-400 capitalize">{p.business || 'Certified Professional'}</p>
                  <span className="inline-block text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    {p.category} Specialist
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 bg-emerald-600 rounded-3xl p-8 sm:p-12 text-white text-left relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between">
            <div className="absolute right-0 bottom-0 opacity-10">
              <Sparkles size={250} />
            </div>
            <div className="relative z-10 space-y-2 max-w-lg">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-6">Are you an expert appliance repairer, certified electrician or specialist cleaner?</h3>
              <p className="text-xs text-emerald-100">Register as a partner. List services, choose slots, manage bookings, and enjoy automated payments weekly.</p>
            </div>
            <button
              onClick={() => navigate('/signup?asProvider=true')}
              className="mt-6 md:mt-0 relative z-10 bg-white text-emerald-600 hover:bg-emerald-50 text-xs font-bold tracking-wide uppercase px-6 py-4 rounded-xl shadow-lg transition duration-200 cursor-pointer self-start md:self-auto shrink-0"
            >
              Apply as Professional specialist
            </button>
          </div>
        </div>
      </section>

      {/* 5. CLIENT TESTIMONIALS */}
      <section className="py-20 bg-gray-50 border-t border-gray-100 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 space-y-2">
            <h2 className="text-3xl font-black text-gray-900">What Our Clients Are Saying</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">Real experiences from verified platform client reviewers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: 'The AC deep cleaning service was flawless. The jet spray washed off massive dust piles from the window panel. Friendly and highly professional specialists. Will definitely schedule again.',
                author: 'Rebecca Miller',
                role: 'Corporate Executive',
                stars: 5,
              },
              {
                text: 'The deep sanitization cleaning was spectacular. They steamed the sofa, vacuumed under heavy mattresses, and polished the stove. Extremely happy with the price quote!',
                author: 'David Vance',
                role: 'Resident Architect',
                stars: 5,
              },
              {
                text: 'Incredibly convenient layout. Found an AC repairer within moments who came and diagnosed a broken thermostat on the weekend, preventing high electric bills. Absolutely recommended.',
                author: 'Timothy Stone',
                role: 'Tech Consultant',
                stars: 5,
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs text-left space-y-4 relative">
                <div className="text-emerald-300">
                  <Quote size={28} />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed italic">{t.text}</p>
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-50 flex justify-between items-center text-xs">
                  <span className="font-extrabold text-gray-900">{t.author}</span>
                  <span className="text-gray-400 font-medium text-[10px]">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
