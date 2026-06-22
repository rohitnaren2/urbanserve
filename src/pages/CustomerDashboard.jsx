import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertCircle, Sparkles, Star, ChevronRight, Compass, ArrowRight, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard({ user }){
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ pending: 0, accepted: 0, completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await api.getCustomerBookings();
        setBookings(response.bookings);

        // calculate counters
        const pending = response.bookings.filter(b => b.status === 'pending').length;
        const accepted = response.bookings.filter(b => b.status === 'accepted').length;
        const completed = response.bookings.filter(b => b.status === 'completed').length;
        setStats({
          pending,
          accepted,
          completed,
          total: response.bookings.length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8" id="customer-dashboard-view">
      
      {/* Hello Board Greeting heading */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-500/10">
        <div className="absolute right-0 bottom-0 opacity-15 select-none pointer-events-none">
          <Sparkles size={160} />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest text-emerald-50">
            Client Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
            Hello, {user?.fullName || 'Valued Customer'}!
          </h1>
          <p className="text-xs text-emerald-100 max-w-md font-medium leading-relaxed">
            Need something fixed, installed, or cleaned today? Browse our premium listings or audit your upcoming household reservations below.
          </p>
        </div>
      </div>

      {/* METRIC COUNTERS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
            <AlertCircle size={20} />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Pending Actions</span>
            <span className="text-xl font-extrabold text-gray-900">{stats.pending || 0}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
            <Calendar size={20} />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Scheduled Jobs</span>
            <span className="text-xl font-extrabold text-gray-900">{stats.accepted || 0}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Completed Services</span>
            <span className="text-xl font-extrabold text-gray-900">{stats.completed || 0}</span>
          </div>
        </div>

      </div>

      {/* RECENT TIMELINE & QUICK ACTIONS BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Recent Activity Booking Timeline */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 space-y-6 text-left">
          <div className="flex justify-between items-center pb-3 border-b border-gray-50">
            <h3 className="font-extrabold text-gray-950 text-base">Active Reservation Tasks</h3>
            <button
              onClick={() => navigate('/bookings')}
              className="text-xs text-emerald-600 font-bold hover:text-emerald-700 hover:border-b hover:border-emerald-600 transition-all flex items-center"
            >
              <span>Manage ledger</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center text-gray-450 space-y-3">
              <Compass size={40} className="text-emerald-600/30 mx-auto animate-bounce" />
              <p className="text-xs font-semibold">You have no active pending bookings scheduled yet.</p>
              <button
                onClick={() => navigate('/explore')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs transition"
              >
                Schedule First Service
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 3).map((b) => (
                <div key={b.id} className="p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 border border-gray-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={b.service_image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150'}
                      alt={b.service_title}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/10 shrink-0"
                    />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-gray-900 leading-tight block">{b.service_title}</p>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                        <span>Provider: <strong className="text-gray-700">{b.provider_name}</strong></span>
                        <span>•</span>
                        <span>Date: {b.booking_date} at {b.booking_time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-sm font-black text-gray-800">${b.total_price}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-widest select-none ${
                      b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      b.status === 'accepted' ? 'bg-indigo-100 text-indigo-800' :
                      b.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Quick Action Bento Panels */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          {/* Quick links block */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4">
            <h3 className="font-extrabold text-gray-950 text-base">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => navigate('/explore')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white transition group cursor-pointer"
              >
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <Compass size={16} />
                  <span>Explore Service Catalog</span>
                </div>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/bookings')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-orange-50 text-orange-850 hover:bg-orange-600 hover:text-white transition group cursor-pointer"
              >
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <Calendar size={16} />
                  <span>My Active Bookings</span>
                </div>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-600 hover:text-white transition group cursor-pointer"
              >
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <UserCheck size={16} />
                  <span>Personal Settings</span>
                </div>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Secure Assurance Banner */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl text-white relative overflow-hidden">

  {/* Background symbol */}
  <div className="absolute top-4 right-4 opacity-5 font-bold select-none text-8xl pointer-events-none">
    $$
  </div>

  <h4 className="font-bold text-sm relative z-10">
    UrbanServe Certified Protection
  </h4>

  <p className="text-xs text-gray-300 leading-relaxed relative z-10 mt-2">
    Every appointment carries standard $1,000 property damages coverage and a
    30-day labor warranty. Payment remains securely in escrow until you approve
    the checkout!
  </p>

</div>

        </div>

      </div>

    </div>
  );
}
