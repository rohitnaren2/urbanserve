import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Search,
  ShoppingCart,
  Calendar,
  Lock,
  User,
  LogOut,
  Sliders,
  Users,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  FileCheck2
} from 'lucide-react';

export default function Sidebar({ role, activeTab, onTabSelect, onLogout, user }) {
  // Define items config depending on roles

  const customerTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explore', label: 'Explore Services', icon: Search },
    { id: 'bookings', label: 'My Bookings', icon: ShoppingCart },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const providerTabs = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'services', label: 'Manage Services', icon: Layers },
    { id: 'bookings', label: 'Work Bookings', icon: Calendar },
    { id: 'calendar', label: 'Set Availability', icon: Sliders },
    { id: 'profile', label: 'Professional Profile', icon: Briefcase },
  ];

  const adminTabs = [
    { id: 'dashboard', label: 'Admin Panel', icon: LayoutDashboard },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'providers', label: 'Manage Providers', icon: FileCheck2 },
    { id: 'bookings', label: 'Global Booking Logs', icon: ShoppingCart },
  ];

  const getTabs = () => {
    if (role === 3) return adminTabs;
    if (role === 2) return providerTabs;
    return customerTabs;
  };

  const getRoleLabel = () => {
    if (role === 3) return 'System Admin';
    if (role === 2) return 'Service Provider';
    return 'Customer';
  };

  return (
    <aside className="w-68 bg-white border-r border-gray-100 flex flex-col min-h-screen text-gray-700 select-none shrink-0" id="dashboard-sidebar-navigation">
      {/* User Header Block */}
      <div className="p-6 border-b border-gray-100 flex items-center space-x-3 bg-gray-50/20">
        <img
          src={user?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
          alt="avatar"
          className="h-10 w-10 rounded-xl object-cover ring-4 ring-emerald-500/10"
        />
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-gray-800 leading-tight truncate">{user?.fullName}</p>
          <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-widest block mt-0.5">
            {getRoleLabel()}
          </span>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {getTabs().map((tab) => {
          const IconComponent = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabSelect(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-700'
                  : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
              }`}
              id={`sidebar-tab-${tab.id}`}
            >
              <div className="flex items-center space-x-3">
                <IconComponent size={16} />
                <span>{tab.label}</span>
              </div>
              <ChevronRight size={12} className={isSelected ? 'text-white' : 'text-gray-400'} />
            </button>
          );
        })}
      </div>

      {/* Logout bottom */}
      <div className="p-4 border-t border-gray-100 bg-gray-55/20">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-2 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
          id="sidebar-logout-btn"
        >
          <LogOut size={16} />
          <span>Exit Account</span>
        </button>
      </div>
    </aside>
  );
}
