import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, User, Bell, LogOut, Menu, X, Landmark, Compass, CalendarCheck } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({
  user,
  onLogout,
  notifications = [],
  fetchNotifications,
  navigate
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadNotifsCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async () => {
    try {
      await api.markNotificationsAsRead();
      if (fetchNotifications) fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-xs" id="global-navigation-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <button
               onClick={() => navigate('/')}
              className="flex items-center space-x-2 font-extrabold text-2xl tracking-tight text-emerald-600 focus:outline-none"
              id="navbar-logo-trigger"
            >
              <Sparkles className="h-7 w-7 text-emerald-600 animate-pulse" />
              <span>Urban<span className="text-gray-900 font-light text-base ml-1">Serve</span></span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-emerald-600 text-sm font-medium transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => {
                if (user && user.roleId === 1) navigate('/explore');
                else navigate('/explore') // Public can view too
              }}
              className="text-gray-600 hover:text-emerald-600 text-sm font-medium transition-colors"
            >
              Services
            </button>
            {!user && (
              <button
                onClick={() => navigate('/signup?asProvider=true')}
                className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              >
                Become Provider
              </button>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notification Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
  setShowNotifMenu(prev => !prev);
  setShowProfileMenu(false);

  if (!showNotifMenu) {
    setTimeout(() => {
      handleMarkAsRead();
    }, 0);
  }
}}
                    className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all focus:outline-none"
                    id="notif-dropdown-btn"
                  >
                    <Bell size={20} />
                    {unreadNotifsCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                        {unreadNotifsCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Overlay Dropdown */}
                        {showNotifMenu && (
                         <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                         onClick={(e) => e.stopPropagation()} > 
                        <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                        <span className="font-bold text-xs text-gray-700">Notifications</span>
                        <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                          {notifications.length} Total
                        </span>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-gray-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className="px-4 py-2.5 hover:bg-gray-50 transition border-b border-gray-50/50">
                              <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">{n.message}</p>
                              <span className="text-[9px] text-gray-400 font-mono inline-block mt-1">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifMenu(false);
                    }}
                    className="flex items-center space-x-2 p-1.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all focus:outline-none"
                    id="user-avatar-menu-btn"
                  >
                    <img
                      src={user.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt="avatar"
                      className="h-8 w-8 rounded-lg object-cover ring-2 ring-emerald-500/20"
                    />
                    <div className="hidden lg:block text-left pr-2">
                      <p className="text-xs font-bold text-gray-800 leading-tight">{user.fullName}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                        {user.roleId === 3 ? 'Admin' : user.roleId === 1 ? 'Customer' : 'Provider'}
                      </span>
                    </div>
                  </button>

                   {showProfileMenu && (
                       <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50"
                      onClick={(e) => e.stopPropagation()}>
                      <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/30">
                        <p className="text-xs font-bold text-gray-800 truncate">{user.fullName}</p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{user.email}</p>
                      </div>

                      <button
                         onClick={() => {
  setShowProfileMenu(false);
  setShowNotifMenu(false);
  navigate(
  user.roleId === 3
    ? '/admin'
    : user.roleId === 2
    ? '/provider-dashboard'
    : '/customer-dashboard'
);
}}
                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 font-medium transition"
                      >
                        Control Dashboard
                      </button>

                      <button
                         onClick={() => {
  setShowProfileMenu(false);
  setShowNotifMenu(false);

  if (user.roleId === 2) {
    navigate('/profile');
  } else {
   navigate(user.roleId === 2 ? '/provider-profile' : '/profile')
  }
}}
                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 font-medium transition"
                      >
                        Personal Profile
                      </button>

                      {user.roleId === 2 && (
                        <>
                          <button
                            onClick={() => {
  setShowProfileMenu(false);
  setShowNotifMenu(false);
  navigate('/provider-profile');
}}
                            className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 font-medium transition"
                          >
                            Professional Profile
                          </button>
                          <button
                            onClick={() => {
  setShowProfileMenu(false);
  setShowNotifMenu(false);
  navigate('/provider/services');
}}
                            className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 font-medium transition"
                          >
                            Manage Services
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
  setShowProfileMenu(false);
  setShowNotifMenu(false);
  onLogout();
  navigate('/');
}}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold flex items-center space-x-1 border-t border-gray-50 mt-1 transition"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-700 hover:text-emerald-600 px-3 py-1.5 text-sm font-medium transition"
                  id="navbar-login-btn"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all"
                  id="navbar-signup-btn"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
              id="mobile-menu-btn"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-3 px-4 space-y-2">
          <button
            onClick={() => { setIsOpen(false);  navigate('/'); }}
            className="block w-full text-left px-4 py-2 rounded-xl text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 font-medium"
          >
            Home
          </button>
          <button
            onClick={() => { setIsOpen(false); navigate('/explore'); }}
            className="block w-full text-left px-4 py-2 rounded-xl text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 font-medium"
          >
            Explore Services
          </button>

          {!user && (
            <>
              <button
                onClick={() => { setIsOpen(false); navigate('/signup?asProvider=true'); }}
                className="block w-full text-left px-4 py-2 rounded-xl text-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-100 font-medium"
              >
                Become Provider
              </button>
              <div className="border-t border-gray-100 pt-3 flex items-center space-x-2">
                <button
                  onClick={() => { setIsOpen(false); navigate('/login'); }}
                  className="flex-1 text-center py-2 border border-gray-200 rounded-xl text-sm text-gray-700"
                >
                  Log In
                </button>
                <button
                  onClick={() => { setIsOpen(false); navigate('/signup'); }}
                  className="flex-1 text-center py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Sign Up
                </button>
              </div>
            </>
          )}

          {user && (
            <div className="border-t border-gray-100 pt-2 space-y-1">
              <div className="px-4 py-2 bg-gray-55 text-xs font-semibold text-gray-500">
                Logged in as {user.fullName} ({user.roleId === 3 ? 'Admin' : user.roleId === 1 ? 'Customer' : 'Provider'})
              </div>
              <button
                onClick={() => { setIsOpen(false); navigate(
  user.roleId === 3
    ? '/admin'
    : user.roleId === 2
    ? '/provider-dashboard'
    : '/customer-dashboard'
); }}
                className="block w-full text-left px-4 py-2 rounded-xl text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 font-medium"
              >
                My Dashboard
              </button>
              <button
                onClick={() => {
 setIsOpen(false);

 if (user.roleId === 2) {
   navigate('/profile');
 } else {
   navigate(user.roleId === 2 ? '/provider-profile' : '/profile');
 }
}}
                className="block w-full text-left px-4 py-2 rounded-xl text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 font-medium"
              >
                Personal Profile
              </button>
              {user.roleId === 2 && (
                <>
                  <button
                    onClick={() => { setIsOpen(false); navigate('/provider-profile'); }}
                    className="block w-full text-left px-4 py-2 rounded-xl text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 font-medium"
                  >
                    Professional Profile
                  </button>
                  <button
                    onClick={() => { setIsOpen(false); navigate('/provider/services'); }}
                    className="block w-full text-left px-4 py-2 rounded-xl text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 font-medium"
                  >
                    Manage Services
                  </button>
                </>
              )}
              <button
                onClick={() => { setIsOpen(false); onLogout(); navigate('/'); }}
                className="block w-full text-left px-4 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 font-bold"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
