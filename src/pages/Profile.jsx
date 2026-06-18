import React, { useState } from 'react';
import { User, ShieldAlert, Lock, Save, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function Profile({ user, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'security'

  // Personal states representation
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');

  // Password modification states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handlePersonalSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await api.updateProfile({
        fullName,
        phone,
        address,
        profilePhoto
      });

      // Update client context state
      onProfileUpdate(response.user);
      setSuccessMsg('Personal contact registry successfully saved!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to sync modifications.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password confirmation mismatch.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await api.updateProfile({
        currentPassword,
        newPassword
      });

      setSuccessMsg('Security passwords successfully rotated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Current password authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left" id="client-settings-profile">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Personal Account Center</h1>
        <p className="text-xs text-gray-400">Handle personal avatars, delivery destinations, and rotate password combinations</p>
      </div>

      {/* Tabs list representation */}
      <div className="flex border-b border-gray-100 gap-3">
        <button
          onClick={() => { setActiveTab('personal'); setErrorMsg(''); setSuccessMsg(''); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition ${
            activeTab === 'personal' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-450 hover:text-emerald-500'
          }`}
        >
          Personal Credentials
        </button>
        <button
          onClick={() => { setActiveTab('security'); setErrorMsg(''); setSuccessMsg(''); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition ${
            activeTab === 'security' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-450 hover:text-emerald-500'
          }`}
        >
          Security & Security Passwords
        </button>
      </div>

      {/* Status boxes */}
      {errorMsg && (
        <div className="flex items-center space-x-2.5 p-4 bg-red-50 rounded-2xl text-xs text-red-650 border border-red-100 font-semibold animate-pulse">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center space-x-2.5 p-4 bg-emerald-50 rounded-2xl text-xs text-emerald-850 border border-emerald-100 font-bold">
          <CheckCircle size={18} className="shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form cards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-3xs">
        
        {/* Personal Form Tab */}
        {activeTab === 'personal' && (
          <form onSubmit={handlePersonalSave} className="space-y-5">
            {/* User Avatar */}
            <div className="flex items-center space-x-5 border-b border-gray-50 pb-5">
              <img
                src={profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt="avatar"
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/10 shrink-0"
              />
              <div className="space-y-1.5 flex-1 text-left">
                <label className="text-xs font-bold text-gray-700">Profile Image</label>
                <div className="flex items-center space-x-3 mt-1">
                  <label className="cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold transition shadow-3xs inline-block">
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setProfilePhoto(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <span className="text-[10px] text-gray-400">JPG, PNG or WEBP up to 5MB</span>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-750 block">Registered Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-gray-50 px-3.5 py-2.5 text-xs text-gray-400 border border-gray-150 rounded-xl cursor-not-allowed font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-750 block">Account Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Johnathan Doe"
                  className="w-full bg-transparent px-3.5 py-2.5 text-xs text-gray-850 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  id="profile-fullname-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-705 block">Account Phone Contact</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-transparent px-3.5 py-2.5 text-xs text-gray-850 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  id="profile-phone-input"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 block">House Delivery Street Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, suite, city zipcode..."
                  className="w-full bg-transparent px-3.5 py-2.5 text-xs text-gray-850 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  id="profile-address-textarea"
                ></textarea>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition flex items-center space-x-1 shadow-sm cursor-pointer"
              id="profile-personal-save"
            >
              <Save size={14} />
              <span>Save Personal contact</span>
            </button>
          </form>
        )}

        {/* Security / Password rotate forms */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSave} className="space-y-5">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Current Password credential</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent px-4 py-2.5 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Choose New Password Combination</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent px-4 py-2.5 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Confirm New Password Combination</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent px-4 py-2.5 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition flex items-center space-x-1 shadow-sm cursor-pointer"
            >
              <Lock size={14} />
              <span>Rotate Password combinations</span>
            </button>

          </form>
        )}

      </div>

    </div>
  );
}
