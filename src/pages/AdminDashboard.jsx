import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Briefcase, Landmark, Calendar, Star, Search, Check, X, Trash2, ArrowUpRight, BarChart2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'providers', 'bookings', 'analytics'
  
  // Platform wide datasets state
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, customersCount: 0, providersCount: 0, bookingsCount: 0 });
  const [loading, setLoading] = useState(true);

  // Search filter modifiers
  const [userSearch, setUserSearch] = useState('');
  const [providerSearch, setProviderSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');

  // Custom non-blocking alert & confirm systems (work inside iframe sands)
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const triggerToast = (msg, isError = false) => {
    setNotification({ message: msg, isError });
    setTimeout(() => {
      setNotification((curr) => curr && curr.message === msg ? null : curr);
    }, 4500);
  };

  useEffect(() => {
    loadAdminIntelligence();
  }, []);

  const loadAdminIntelligence = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, providersRes, bookingsRes] = await Promise.all([
        api.getAdminStats().catch(err => ({ stats: {} })),
        api.getAdminUsers().catch(err => ({ users: [] })),
        api.getAdminProviders().catch(err => ({ providers: [] })),
        api.getAdminBookings().catch(err => ({ bookings: [] }))
      ]);

      const fetchedUsers = usersRes.users || [];
      const fetchedProviders = providersRes.providers || [];
      const fetchedBookings = bookingsRes.bookings || [];

      setUsers(fetchedUsers);
      setProviders(fetchedProviders);
      setBookings(fetchedBookings);

      // Calculate summaries
      const customersCount = fetchedUsers.filter(u => u.role_id === 1 || u.role === 1).length;
      const providersCount = fetchedProviders.length;
      const bookingsCount = fetchedBookings.length;

      // sum completed bookings total
      const completedJobs = fetchedBookings.filter(b => b.status === 'completed');
      const totalRevenue = completedJobs.reduce((sum, b) => sum + Number(b.total_price || b.price || b.amount || 0), 0).toFixed(2);

      setStats({
        totalRevenue: statsRes.stats?.totalRevenue || totalRevenue,
        customersCount,
        providersCount,
        bookingsCount
      });

    } catch (err) {
      console.error("Dashboard detailed fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // CLIENT REGISTRY OPERATORS
  const handleDeleteUser = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Purge User Account Permanently',
      message: 'Wipe this user account permanently from database logs? All corresponding records and credentials will be purged.',
      onConfirm: async () => {
        try {
          await api.adminDeleteUser(id);
          triggerToast('Representative account purged.');
          loadAdminIntelligence();
        } catch (err) {
          triggerToast(err.message || 'Purging failed.', true);
        }
      }
    });
  };

  // PROVIDERS APPROVAL STATUS OPERATORS
  const handleToggleProviderApproval = (id, currentStatus) => {
    const nextStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    const dialogMessage = nextStatus === 'approved' 
      ? 'Approve and activate this service provider portfolio? They will be allowed to receive bookings immediately.' 
      : 'Suspend this provider portfolio? They will no longer appear in search listings.';
    
    setConfirmModal({
      isOpen: true,
      title: nextStatus === 'approved' ? 'Approve & Verify Partner Specialist' : 'Suspend Partner Specialist Portfolio',
      message: dialogMessage,
      onConfirm: async () => {
        try {
          await api.adminToggleProviderStatus(id, nextStatus);
          triggerToast(`Provider status successfully shifted to ${nextStatus.toUpperCase()}!`);
          loadAdminIntelligence();
        } catch (err) {
          triggerToast(err.message || 'Modification failed.', true);
        }
      }
    });
  };

  // BOOKING FORCE OPERATORS
  const handleForceCancelBooking = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Force Cancel Active Reservation',
      message: 'Force administrative cancellation of this booking trade? Refund triggers will execute automatically.',
      onConfirm: async () => {
        try {
          await api.adminCancelBooking(id);
          triggerToast('Order cancelled.');
          loadAdminIntelligence();
        } catch (err) {
          triggerToast(err.message || 'Action failed.', true);
        }
      }
    });
  };

  const handleForceCompleteBooking = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Force Job Finish Trade',
      message: 'Force administrative completion of this job? Escrow release triggers will fire.',
      onConfirm: async () => {
        try {
          await api.adminCompleteBooking(id);
          triggerToast('Order force-completed.');
          loadAdminIntelligence();
        } catch (err) {
          triggerToast(err.message || 'Action failed.', true);
        }
      }
    });
  };

  // FILTERED DATASETS FOR OUTLET LISTS
  const filteredUsers = users.filter(usr => 
    (usr.fullName || usr.full_name || '').toLowerCase().includes(userSearch.toLowerCase()) || 
    (usr.email || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredProviders = providers.filter(prov => 
    (prov.fullName || prov.full_name || '').toLowerCase().includes(providerSearch.toLowerCase()) || 
    (prov.business_name || '').toLowerCase().includes(providerSearch.toLowerCase()) ||
    (prov.category || '').toLowerCase().includes(providerSearch.toLowerCase())
  );

  const filteredBookings = bookings.filter(b => 
    b.service_title.toLowerCase().includes(bookingSearch.toLowerCase()) || 
    b.customer_name.toLowerCase().includes(bookingSearch.toLowerCase()) || 
    b.provider_name.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  // CATEGORY POPULARITY ANALYTICS VALUES
  const acBookings = bookings.filter(b => b.service_title.toLowerCase().includes('ac') || b.service_title.toLowerCase().includes('condit')).length;
  const cleanBookings = bookings.filter(b => b.service_title.toLowerCase().includes('clean') || b.service_title.toLowerCase().includes('sanit')).length;
  const plumberBookings = bookings.filter(b => b.service_title.toLowerCase().includes('plumb') || b.service_title.toLowerCase().includes('leak')).length;
  const plasterBookings = bookings.filter(b => b.service_title.toLowerCase().includes('wall') || b.service_title.toLowerCase().includes('plaster')).length;
  const otherBookings = Math.max(0, bookings.length - (acBookings + cleanBookings + plumberBookings + plasterBookings));

  const popularityLogs = [
    { label: 'Air Conditioning (AC) repair', count: acBookings, pct: bookings.length ? (acBookings / bookings.length) * 100 : 25, color: 'bg-teal-500' },
    { label: 'Sanitizing deep cleaner services', count: cleanBookings, pct: bookings.length ? (cleanBookings / bookings.length) * 100 : 35, color: 'bg-indigo-500' },
    { label: 'Piping & Plumbing leak services', count: plumberBookings, pct: bookings.length ? (plumberBookings / bookings.length) * 100 : 20, color: 'bg-orange-500' },
    { label: 'General Wall plastering renovate', count: plasterBookings, pct: bookings.length ? (plasterBookings / bookings.length) * 100 : 15, color: 'bg-amber-500' },
    { label: 'Miscellaneous Support catalogs', count: otherBookings, pct: bookings.length ? (otherBookings / bookings.length) * 100 : 5, color: 'bg-gray-400' },
  ];

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 animate-pulse">
        <ShieldCheck size={48} className="text-gray-250 mx-auto" />
        <p className="font-extrabold text-sm text-gray-500">Retrieving system registries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left" id="administrative-defense-suite">
      
      {/* Hero Banner Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="space-y-2 relative z-10">
          <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest">
            🛡️ Administrative Panel
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">Platform Management Console</h1>
          <p className="text-xs text-gray-400 max-w-lg leading-relaxed font-semibold">
            Evaluate global revenue metrics, override pending specialist certificate licenses, delete profiles, or complete outstanding escrow ledgers dynamically.
          </p>
        </div>
      </div>

      {/* GLOBAL BILLS STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Total Volume Escrow', value: `$${stats.totalRevenue}`, icon: Landmark, color: 'text-emerald-500 bg-emerald-50' },
          { label: 'Verified Patrons', value: stats.customersCount, icon: Users, color: 'text-teal-600 bg-teal-50' },
          { label: 'Partner listings', value: stats.providersCount, icon: Briefcase, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Global Service Orders', value: stats.bookingsCount, icon: Calendar, color: 'text-amber-600 bg-amber-50' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-150/70 shadow-2xs flex items-center space-x-3.5">
              <div className={`p-3 rounded-xl shrink-0 ${item.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <span className="text-[9px] text-gray-400 uppercase font-black tracking-wider block">{item.label}</span>
                <span className="text-lg font-black text-gray-900">{item.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CORE CONTROL NAVIGATION TAB PANEL */}
      <div className="flex border-b border-gray-100 gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Dashboard Control' },
          { id: 'users', label: 'Manage Users (Clients)' },
          { id: 'providers', label: 'Verify Providers' },
          { id: 'bookings', label: 'Bookings Override' },
          { id: 'analytics', label: 'Category Analytics' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB DETAILS OUTLET DRAWER */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-3xs min-h-[22rem]">
        
        {/* OVERVIEW TAB OUTLET */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-sm font-black text-gray-950 border-b border-gray-50 pb-2">Platform Quick Summary Reports</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 bg-teal-50/30 rounded-2xl border border-teal-100/50 space-y-2">
                <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider block">Compliance Approvals Queue</h4>
                <p className="text-2xl font-black text-teal-950">
                  {providers.filter(p => p.status === 'pending').length} Specialists Pending
                </p>
                <p className="text-[11px] text-gray-550 leading-relaxed">
                  Review licensing qualifications and business cards to authenticate partner access to explore catalogs.
                </p>
                <button
                  onClick={() => setActiveTab('providers')}
                  className="mt-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold"
                >
                  Verify Partners Now
                </button>
              </div>

              <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-101/50 space-y-2">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">Escrow Ledger Status</h4>
                <p className="text-2xl font-black text-indigo-950">
                  {bookings.filter(b => b.status === 'pending').length} Trades in Pending Escrow
                </p>
                <p className="text-[11px] text-gray-550 leading-relaxed">
                  Platform secure escrow funds will rest locked until customer completes arrival/completion reviews.
                </p>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="mt-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold"
                >
                  Audit Bookings
                </button>
              </div>

            </div>
          </div>
        )}

        {/* RECOGNIZED PATRONS (USERS PAGE) TAB OUTLET */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-sm font-black text-gray-950 block">Customer Client Registry</h3>
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Filter users name or emails..."
                  className="w-full bg-transparent pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No matching clients found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-gray-50">
                  <thead>
                    <tr className="text-gray-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-2">Client Details</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Contact phone</th>
                      <th className="py-2 text-right">Administrative</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    {filteredUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-gray-50/50" id={`admin-user-row-${usr.id}`}>
                        <td className="py-3 font-bold text-gray-900">{usr.fullName || usr.full_name}</td>
                        <td className="py-3 text-gray-600 font-mono text-[11px]">{usr.email}</td>
                        <td className="py-3 text-gray-550 font-mono">{usr.phone || "+1 (555) 0192-384"}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            className="p-1 px-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-[10px] font-bold"
                          >
                            <Trash2 size={11} className="inline mr-1" />
                            <span>Purge Record</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PROVIDERS PAGE VERIFICATION TAB OUTLET */}
        {activeTab === 'providers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-sm font-black text-gray-950 block">Partners Compliance Statuses</h3>
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-450 font-bold">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={providerSearch}
                  onChange={(e) => setProviderSearch(e.target.value)}
                  placeholder="Filter by business, name or specialty..."
                  className="w-full bg-transparent pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            {filteredProviders.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No matching service providers located.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-gray-50">
                  <thead>
                    <tr className="text-gray-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-2">Partner Representative</th>
                      <th className="py-2">Business Trade & specialty</th>
                      <th className="py-2">License Credentials file</th>
                      <th className="py-2">Status Compliance</th>
                      <th className="py-2 text-right">Verify Triggers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    {filteredProviders.map((prov) => (
                      <tr key={prov.id} className="hover:bg-gray-50/50" id={`admin-prov-row-${prov.id}`}>
                        <td className="py-3">
                          <div className="font-bold text-gray-900">{prov.fullName || prov.full_name}</div>
                          <div className="text-[10px] text-gray-400 leading-none">{prov.email}</div>
                        </td>
                        <td className="py-3">
                          <div className="font-black text-gray-800">{prov.business_name}</div>
                          <div className="text-[10px] text-teal-650 bg-teal-50 px-1.5 py-0.5 rounded w-fit capitalize block font-extrabold">
                            {prov.category} ({prov.experience} yrs)
                          </div>
                        </td>
                         <td className="py-3">
  <div className="flex items-center space-x-2">

    {/* File name (clean + truncated) */}
    <span
      className="font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded text-[11px] max-w-[140px] truncate"
      title={
        prov.verification_document
          ? prov.verification_document.startsWith('data:')
            ? 'Uploaded Document'
            : prov.verification_document
          : 'trade_license.pdf'
      }
    >
      📎 {prov.verification_document
        ? prov.verification_document.startsWith('data:')
          ? 'Uploaded Document'
          : prov.verification_document.split('/').pop()
        : 'trade_license.pdf'}
    </span>

    {/* Download Button */}
    {prov.verification_document && (
      <a
        href={prov.verification_document}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      >
        Download
      </a>
    )}

  </div>
</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black tracking-widest ${
                            prov.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {prov.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleToggleProviderApproval(prov.id, prov.status)}
                            className={`p-1 px-2 text-[10px] font-black rounded-lg transition ${
                              prov.status === 'approved'
                                ? 'border border-amber-250 text-amber-700 bg-amber-50/20'
                                : 'border border-emerald-250 text-emerald-700 bg-emerald-50/20'
                            }`}
                          >
                            {prov.status === 'approved' ? 'Suspend' : 'Approve Verify'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS PAGE TAB OUTLET */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-sm font-black text-gray-950 block font-sans">Global Platform Booking Ledger Override</h3>
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Filter by service name, customer..."
                  className="w-full bg-transparent pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No transaction matches found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-gray-50">
                  <thead>
                    <tr className="text-gray-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-2">Service Specs</th>
                      <th className="py-2">Customer & Partner pairing</th>
                      <th className="py-2">Date Slots</th>
                      <th className="py-2">Wage Billed</th>
                      <th className="py-2 text-right">Override action triggers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/50" id={`admin-booking-row-${b.id}`}>
                        <td className="py-3 font-semibold">
                          <div className="text-gray-900 font-bold">{b.service_title}</div>
                          <div className="text-[10px] text-gray-400 uppercase font-black">ST: {b.status}</div>
                        </td>
                        <td className="py-3">
                          <div className="text-gray-900">Patron: <strong className="text-gray-700">{b.customer_name}</strong></div>
                          <div className="text-[11px] text-emerald-800 font-semibold">Specialist: {b.provider_name}</div>
                        </td>
                        <td className="py-3 text-gray-650 font-mono">
                          <div>{b.booking_date}</div>
                          <div className="text-[10px]">{b.booking_time}</div>
                        </td>
                        <td className="py-3 font-extrabold text-gray-900">${b.total_price}</td>
                        <td className="py-3 text-right space-x-1 whitespace-nowrap">
                          {b.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleForceCancelBooking(b.id)}
                                className="p-1 px-1.5 border border-red-200 text-red-650 rounded hover:bg-red-50 text-[10px]"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleForceCompleteBooking(b.id)}
                                className="p-1 px-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-[10px]"
                              >
                                Complete Escrow
                              </button>
                            </>
                          )}
                          {b.status === 'accepted' && (
                            <button
                              onClick={() => handleForceCompleteBooking(b.id)}
                              className="p-1 px-2 border border-indigo-200 text-indigo-700 bg-indigo-50/10 rounded hover:bg-indigo-50 text-[10px]"
                            >
                              Force Complete
                            </button>
                          )}
                          {b.status === 'completed' && (
                            <span className="text-emerald-700 bg-emerald-50 text-[10px] px-2 py-0.5 rounded font-black uppercase">
                              Settled ✓
                            </span>
                          )}
                          {b.status === 'cancelled' && (
                            <span className="text-gray-400 bg-gray-50 text-[10px] px-2 py-0.5 rounded">
                              Cancelled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS PAGE TAB OUTLET */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-sm font-black text-gray-950 border-b border-gray-50 pb-2">Category booking demand distribution</h3>
            
            <div className="space-y-4 max-w-xl">
              {popularityLogs.map((log, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-gray-800">
                    <span>{log.label}</span>
                    <span>{log.count} trades ({Math.round(log.pct)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${log.color} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${log.pct || 1}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl flex items-start space-x-2.5 text-[10px] text-gray-505 border border-gray-100">
              <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="leading-snug">
                This dynamic chart counts order requests matching specific categorical sub-terms in listed services. Air Conditioning (AC) repair and deep sanitizing sanitization cleaning are historic peak drivers.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Toast Notification Container */}
      {notification && (
        <div className={`fixed bottom-5 right-5 flex items-center space-x-2.5 p-4 rounded-2xl shadow-xl border animate-bounce ${
          notification.isError ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-900 border-emerald-100'
        }`} style={{ zIndex: 1000 }}>
          <div className={`w-2 h-2 rounded-full ${notification.isError ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
          <span className="text-xs font-bold font-mono">{notification.message}</span>
        </div>
      )}

      {/* Confirmation Custom Modal Popup dialog */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" style={{ zIndex: 999 }}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-150/50 shadow-2xl space-y-4">
            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="text-sm font-black text-slate-950 font-sans tracking-tight block">
                ⚠️ {confirmModal.title}
              </h3>
              <p className="text-[11px] text-gray-600 leading-relaxed font-semibold">
                {confirmModal.message}
              </p>
            </div>
            
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="flex-1 bg-gray-50 active:bg-gray-100 text-gray-650 text-[10px] font-bold py-2.5 rounded-xl border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmModal({ ...confirmModal, isOpen: false });
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                }}
                className="flex-1 bg-slate-950 hover:bg-slate-800 text-white text-[10px] font-extrabold py-2.5 rounded-xl shadow-md"
              >
                Proceed Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
