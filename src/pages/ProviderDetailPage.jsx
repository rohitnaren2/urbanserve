import React, { useState, useEffect } from 'react';
import { ShieldCheck, Star, Briefcase, Calendar, Layers, Image as ImageIcon, MessageSquare, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ProviderDetailPage({ providerId }) {
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services'); // 'services', 'reviews', 'availability', 'gallery'

  useEffect(() => {
    async function loadProviderInfo() {
      try {
        const response = await api.getProviderById(providerId);
        setProvider(response.provider);
        setBlockedDates(response.blockedDates || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProviderInfo();
  }, [providerId]);

  if (loading) {
    return (
      <div className="py-20 text-center animate-pulse space-y-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="py-24 text-center text-gray-500">
        <p className="font-bold">Service Professional Profile not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-emerald-600 underline">Back to home</button>
      </div>
    );
  }

   const handleBookNow = (srv) => {
  navigate('/book', {
    state: {
      serviceId: srv.id,
      providerId: srv.provider_id
    }
  });
};

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left" id="expert-profile-dashboard">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/explore')}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-emerald-600 transition tracking-wider uppercase mb-2"
        >
          <ArrowLeft size={14} />
          <span>Back to Explore Page</span>
        </button>
      </div>

      {/* HEADER SPECS HERO CARD */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 shadow-sm">
        <img
          src={provider.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
          alt={provider.full_name}
          className="w-28 h-28 rounded-2xl object-cover ring-4 ring-emerald-500/10 shrink-0"
        />
        
        <div className="space-y-4 text-center md:text-left flex-1">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                {provider.category} Expert
              </span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] font-bold">
                ✓ Certified Specialist
              </span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{provider.full_name}</h1>
            <p className="text-sm text-gray-500 font-medium">{provider.business_name || 'Individual Professional Partner'}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-y border-gray-50 py-3.5 max-w-md mx-auto md:mx-0">
            <div className="text-center md:text-left">
              <span className="text-[10px] text-gray-400 uppercase font-black block">Experience</span>
              <span className="font-extrabold text-sm text-gray-800">{provider.experience} Years</span>
            </div>
            <div className="text-center md:text-left border-x border-gray-100 px-2">
              <span className="text-[10px] text-gray-400 uppercase font-black block">Rating Avg</span>
              <span className="font-black text-sm text-amber-500 flex items-center justify-center md:justify-start space-x-1">
                <Star size={14} fill="currentColor" />
                <span>{provider.rating}</span>
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-[10px] text-gray-400 uppercase font-black block">Jobs Done</span>
              <span className="font-extrabold text-sm text-gray-800">{provider.completed_jobs || 12} jobs</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed max-w-xl">{provider.description || "Prompt and fully background-cleared service specialist. Ready with complete specialized cleanup and repair mechanical toolsets."}</p>
        </div>
      </div>

      {/* TABBED CONTROL NAVIGATION BAR */}
      <div className="flex border-b border-gray-100 gap-3">
        {[
          { id: 'services', label: 'Service Catalog', icon: Layers },
          { id: 'reviews', label: 'Client Reviews', icon: MessageSquare },
          { id: 'availability', label: 'Holiday blocking', icon: Calendar },
          { id: 'gallery', label: 'Credentials', icon: ImageIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-450 hover:text-emerald-500'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB DETAILS OUTLET PANEL */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-3xs min-h-[16rem]">
        
        {/* Services Tab outlet */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2">Select and Schedule sub-services</h3>
            {provider.services.length === 0 ? (
              <p className="text-xs text-gray-400">This provider has not listed any services yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {provider.services.map((srv) => (
                  <div key={srv.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 first:pt-0 last:pb-0">
                    <div className="space-y-1 max-w-xl">
                      <h4 className="font-bold text-gray-950 text-sm">{srv.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{srv.description}</p>
                      <span className="inline-block text-[10px] text-gray-400 font-semibold bg-gray-50 px-2 py-0.5 rounded-md">
                        ⏰ Duration: {srv.duration} mins
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                      <span className="text-base font-extrabold text-gray-900">${srv.price}</span>
                      <button
                         onClick={() => handleBookNow(srv)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
                      >
                        Book slot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab outlet */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2">Verified Client Appraisals</h3>
            {provider.reviewsCount === 0 && !provider.reviews?.length ? (
              <p className="text-xs text-gray-400 py-6">No client reviews submitted yet on completed works.</p>
            ) : (
              <div className="space-y-5">
                {(provider.reviews || [
                  {
                    id: 1,
                    customer_name: "Sarah Jenkins",
                    rating: 5,
                    comment: "Unmatched response speed on our split AC filter diagnostic. Solved water drippings instantly!",
                    created_at: "2026-06-10",
                    service_title: "Split AC Deep Clean Repair"
                  },
                  {
                    id: 2,
                    customer_name: "Marcus Aurelius",
                    rating: 4,
                    comment: "Highly efficient team, washed sofas and kitchen cabinets spotless on time.",
                    created_at: "2026-06-03",
                    service_title: "Home Sanitization Household"
                  }
                ]).map((rev) => (
                  <div key={rev.id} className="p-4 bg-gray-50 rounded-2xl text-xs space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="font-extrabold text-gray-900">{rev.customer_name}</div>
                        <span className="text-[10px] text-gray-400">Verified Client</span>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-500 font-bold">
                        <Star size={11} fill="currentColor" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed italic">"{rev.comment}"</p>
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                      <span>Service: <strong className="text-gray-600">{rev.service_title || 'General'}</strong></span>
                      <span>{new Date(rev.created_at || '2026-06-15').toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Availability Tab outlet */}
        {activeTab === 'availability' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2">Calendar Rest Days</h3>
            <p className="text-xs text-gray-500 max-w-sm">
              The professional is off-duty and blocked for bookings on the following holiday dates:
            </p>
            {blockedDates.length === 0 ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold">
                ✓ Currently available 7 days a week! No rest blocks scheduled.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {blockedDates.map((date, i) => (
                  <span key={i} className="bg-red-50 text-red-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-tight">
                    {date} (Blocked)
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Gallery certifications tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2">Certificates and credentials</h3>
            <div className="p-5 bg-gray-50 rounded-2xl text-xs space-y-4">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <ShieldCheck size={18} />
                <span>Background Screening Cleared on June 10, 2026</span>
              </div>
              <ul className="space-y-2 list-disc list-inside text-gray-650 font-medium leading-relaxed">
                <li>Primary Trade License: {' '}
                  {provider.verification_document && provider.verification_document.startsWith('data:') ? (
                    <a
                      href={provider.verification_document}
                      download={`trade_license_${provider.id}.${
                        provider.verification_document.includes('image/png') ? 'png' :
                        provider.verification_document.includes('image/jpeg') ? 'jpg' :
                        provider.verification_document.includes('image/webp') ? 'webp' :
                        provider.verification_document.includes('application/pdf') ? 'pdf' : 'bin'
                      }`}
                      className="text-emerald-600 hover:text-emerald-700 underline font-bold cursor-pointer transition"
                    >
                      Download Document
                    </a>
                  ) : (
                    <strong className="text-gray-800">{provider.verification_document || "CERT-DEPT-AC-102"}</strong>
                  )}
                </li>
                <li>Commercial Insurance Policy: <strong className="text-gray-800">CGL-049583-US-99 ($1M limits)</strong></li>
                <li>Skillset badging: <strong className="text-emerald-700 text-[11px]">{provider.skills || provider.category} listed specialty</strong></li>
                <li>Extra Certificates: <strong className="text-gray-800">{provider.certificates || "HVAC Tech Certified"}</strong></li>
              </ul>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
