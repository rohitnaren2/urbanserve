import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CustomerDashboard from './pages/CustomerDashboard';
import ExploreServices from './pages/ExploreServices';
import ProviderDetailPage from './pages/ProviderDetailPage';
import BookAppointment from './pages/BookAppointment';
import MyBookings from './pages/MyBookings';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import ProviderDashboard from './pages/ProviderDashboard';
import ManageServices from './pages/ManageServices';
import ManageBookings from './pages/ManageBookings';
import Availability from './pages/Availability';
import ProviderProfile from "./pages/ProviderProfile";
import AdminDashboard from './pages/AdminDashboard';

import { api } from './services/api';

/* =========================
   MAIN APP WRAPPER
========================= */
export default function App() {
  return (
    <Router>
      <AppCore />
    </Router>
  );
}

/* =========================
   CORE LOGIC APP
========================= */
function AppCore() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [appLoading, setAppLoading] = useState(true);
  const fetchNotifications = async () => {
  try {
    const data = await api.getNotifications();
    setNotifications(data.notifications || []);
  } catch (err) {
    console.error(err);
  }
};

  /* =========================
     AUTH LOAD
  ========================= */
  const loadUserAndNotifs = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      setAppLoading(false);
      return;
    }

    try {
      const data = await api.getProfile();

      if (data?.user) {
        setUser(data.user);

        await fetchNotifications();
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setAppLoading(false);
    }
  };

  useEffect(() => {
    loadUserAndNotifs();
  }, []);
  useEffect(() => {
  if (!user) return;

  fetchNotifications();

  const interval = setInterval(() => {
    fetchNotifications();
  }, 5000);

  return () => clearInterval(interval);
}, [user]);
  
  /* =========================
     NAVIGATION WRAPPER (OLD SYSTEM COMPATIBLE)
  ========================= */
  
  const onLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  /* =========================
     LOADING SCREEN
  ========================= */
  if (appLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-xs text-gray-500">Initializing UrbanServe...</p>
      </div>
    );
  }

  return (
 
    <div className="min-h-screen flex flex-col">
         <Navbar
  user={user}
  onLogout={onLogout}
  notifications={notifications}
  fetchNotifications={fetchNotifications}
  navigate={navigate}
/>
     

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<LandingPage />} />
<Route path="/login" element={<Login onLoginSuccess={setUser} />} />
<Route path="/signup" element={<Signup onSignupSuccess={setUser} />} />

<Route path="/explore" element={<ExploreServices />} />
<Route path="/customer-dashboard" element={<CustomerDashboard user={user} />} />
<Route path="/bookings" element={<MyBookings />} />

<Route path="/book" element={<BookAppointment user={user} />} />
<Route path="/payment" element={<Payments />} />

<Route path="/provider-dashboard" element={<ProviderDashboard user={user} />} />
<Route path="/provider/services" element={<ManageServices />} />
<Route path="/provider/bookings" element={<ManageBookings />} />
<Route path="/provider/availability" element={<Availability />} />

<Route path="/profile" element={<Profile user={user} />} />
<Route path="/provider-profile" element={<ProviderProfile user={user} />} />
<Route path="/provider/:id" element={<ProviderDetailPage />} />

<Route path="/admin" element={<AdminDashboard user={user} />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}