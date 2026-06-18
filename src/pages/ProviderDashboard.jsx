import React, { useState, useEffect } from 'react';
import { Landmark, TrendingUp, Calendar, AlertCircle, Star, BadgePercent, ChevronRight, Compass, ShieldAlert, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
export default function ProviderDashboard({ user }){
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, count: 0, pending: 0, rating: 5.0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await api.getProviderBookings();
        setBookings(response.bookings);

        // calculate parameters
        const completed = response.bookings.filter(b => b.status === 'completed');
        const revenue = completed.reduce((sum, b) => sum + Number(b.total_price), 0).toFixed(2);
        const pending = response.bookings.filter(b => b.status === 'pending').length;

        setStats({
          revenue,
          count: response.bookings.length,
          pending,
          rating: user?.provider?.rating || 4.8
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user]);

  // SVG Chart representation
  const performanceTrend = [
    { month: 'Jan', revenue: 120 },
    { month: 'Feb', revenue: 380 },
    { month: 'Mar', revenue: stats.revenue > 0 ? Number(stats.revenue) : 480 },
  ];

  return (
    <div className="space-y-8" id="provider-dashboard-view">
      
      {/* Hello Board Greeting heading */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-teal-500/10">
        <div className="space-y-2 relative z-10 text-left">
          <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest text-emerald-50">
            Specialist Partnership Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
            {user?.provider?.business_name || 'My Trade Enterprise'}
          </h1>
          <p className="text-xs text-emerald-55 max-w-sm leading-relaxed font-semibold">
            Partner status: <span className={`font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase ${
              user?.provider?.status === 'approved' 
                ? 'bg-emerald-800 text-white' 
                : 'bg-amber-500 text-white animate-pulse'
            }`}>{user?.provider?.status === 'approved' ? 'APPROVED ACTIVE' : 'PENDING REVIEW'}</span>
          </p>
        </div>
      </div>

      {/* STATS CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 text-left">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-55 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
            <Landmark size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Wallet Balance</span>
            <span className="text-xl font-black text-gray-900">${stats.revenue}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center space-x-3.5">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Completed Jobs</span>
            <span className="text-xl font-black text-gray-900">{bookings.filter(b => b.status === 'completed').length}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center space-x-3.5">
          <div className="p-3 bg-orange-50 rounded-xl text-orange-600 shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Pending Actions</span>
            <span className="text-xl font-black text-amber-600">{stats.pending}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center space-x-3.5">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500 shrink-0">
            <Star size={18} fill="currentColor" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Average Rating</span>
            <span className="text-xl font-black text-gray-900">{stats.rating} / 5</span>
          </div>
        </div>

      </div>

      {/* PERFORMANCE GRAPHS AND RESERVATIONS LIST GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left: SVG performance Revenue Graph */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-gray-100 space-y-4">
          <h3 className="font-extrabold text-gray-900 text-sm">Monthly Revenue Performance</h3>
          
          <div className="pt-6 h-40 flex items-end justify-between px-6 border-b border-gray-100 pb-1 relative">
            <div className="absolute top-0 right-0 text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Growth Trend
            </div>
            {performanceTrend.map((pt, i) => {
              const pct = Math.min((pt.revenue / 600) * 100, 100);
              return (
                <div key={i} className="flex flex-col items-center space-y-2 w-16">
                  <span className="text-[10px] font-extrabold text-gray-800">${pt.revenue}</span>
                  <div
                    className="w-8 bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-all"
                    style={{ height: `${pct || 10}%` }}
                  ></div>
                  <span className="text-[10px] font-semibold text-gray-400">{pt.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Urgent Incoming requests */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-gray-100 space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <h3 className="font-extrabold text-gray-950 text-sm">Actionable Bookings List</h3>
            <button
              onClick={() => navigate('/provider/bookings')}
              className="text-xs text-emerald-600 font-bold hover:text-emerald-700"
            >
              Manage Ledger
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              <div className="h-12 bg-gray-50 rounded-xl animate-pulse"></div>
            </div>
          ) : bookings.filter(b => b.status === 'pending').length === 0 ? (
            <div className="py-8 text-center text-gray-450 space-y-2.5">
              <CheckCircle size={36} className="text-emerald-500/40 mx-auto" />
              <p className="text-xs font-semibold">Excellent! You have processed all pending requests.</p>
              <span className="text-[10px] text-gray-400">Keep services configurations active to invite more client bookings.</span>
            </div>
          ) : (
            <div className="space-y-3.5">
              {bookings.filter(b => b.status === 'pending').slice(0, 2).map((b) => (
                <div key={b.id} className="p-3 rounded-xl bg-amber-50/40 border border-amber-100 flex items-center justify-between">
                  <div className="space-y-0.5 overflow-hidden text-left text-xs pr-2">
                    <p className="font-extrabold text-gray-900 truncate">{b.service_title}</p>
                    <p className="text-[10px] text-gray-500">Scheduled: {b.booking_date} at {b.booking_time}</p>
                  </div>
                  <button
                    onClick={() => navigate('/provider/bookings')}
                    className="bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] tracking-wide uppercase shrink-0 transition"
                  >
                    Action Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
