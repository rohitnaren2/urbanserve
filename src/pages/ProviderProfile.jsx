import React, { useState } from 'react';
import { Camera, Save, Briefcase, FileText, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function ProviderProfile({ user, onProfileUpdate }) {
  const [businessName, setBusinessName] = useState(user?.provider?.business_name || '');
  const [category, setCategory] = useState(user?.provider?.category || 'AC Repair');
  const [experience, setExperience] = useState(String(user?.provider?.experience || '2'));
  const [verificationDocument, setVerificationDocument] = useState(user?.provider?.verification_document || '');
  const [description, setDescription] = useState(user?.provider?.description || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await api.updateProviderProfile({
        businessName,
        category,
        experience: Number(experience),
        verificationDocument,
        description,
        profilePhoto
      });

      // Update parent credentials context
      onProfileUpdate(response.user);
      setSuccessMsg('Business Specialist details successfully saved!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error occurred syncing business parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left" id="provider-profile-editor">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Business Settings</h1>
        <p className="text-xs text-gray-400">Configure business card parameters, primary trade specialties and verify compliance documents</p>
      </div>

      {successMsg && (
        <div className="flex items-center space-x-2 p-4 bg-emerald-50 rounded-2xl text-xs text-emerald-850 border border-emerald-100 font-bold">
          <CheckCircle size={18} className="shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 rounded-2xl text-xs text-red-650 border border-red-150 font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Inputs card */}
      <form onSubmit={handleProfileSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-3xs space-y-6">
        
        {/* Profile photo Upload */}
        <div className="flex items-center space-x-4 border-b border-gray-50 pb-5">
          <img
            src={profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
            alt="Business Representative"
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/10 shrink-0"
          />
          <div className="flex-1 space-y-1.5 text-left">
            <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Company Representative Photo</label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold transition shadow-3xs inline-block">
                Upload Photo
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
              <span className="text-[10px] text-gray-400 font-medium">JPG, PNG or WEBP formats</span>
            </div>
          </div>
        </div>

        {/* Info inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          {/* Owner Fullname (Disabled) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">Registered Proprietor name</label>
            <input
              type="text"
              disabled
              value={user?.fullName || ''}
              className="w-full bg-gray-50 px-3.5 py-2.5 text-xs text-gray-400 border border-gray-150 rounded-xl cursor-not-allowed font-medium"
            />
          </div>

          {/* Business / Trade Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">Business / Trade Name</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. AC Repair Pros Corp"
              className="w-full bg-transparent px-3.5 py-2.5 text-xs text-gray-850 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              id="business-name-input"
            />
          </div>

          {/* Primary Specialty select option */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">Category Trade specialty</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white px-3 py-2.5 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
            >
              <option value="AC Repair">Air Conditioning (AC) Repair & Installation</option>
              <option value="Cleaning">Sanitizing deep Cleaning Services</option>
              <option value="Plumbing">Piping & Plumbing Leak services</option>
              <option value="Plastering">General Wall Plastering / Renovation</option>
            </select>
          </div>

          {/* Experience */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-750 block">Trade Experience (Years)</label>
            <input
              type="number"
              required
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 5"
              className="w-full bg-transparent px-3.5 py-2.5 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
              id="business-exp-input"
            />
          </div>

          {/* Compliance doc upload */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-gray-750 block">Compliance File Document (Trade License / ID)</label>
            <div className="relative text-left">
              <label className="flex items-center justify-between w-full bg-transparent px-4 py-2.5 text-xs text-gray-800 border border-gray-200 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/5 transition duration-150">
                <span className="truncate max-w-[300px] font-mono text-gray-650 flex items-center">
                  <FileText size={15} className="mr-2 text-gray-400 shrink-0" />
                  {verificationDocument ? (verificationDocument.startsWith('data:') ? '📄 Document Uploaded' : verificationDocument) : 'Select compliance document file...'}
                </span>
                <span className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-[10px] font-bold shrink-0 transition">
                  Browse
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setVerificationDocument(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            <p className="text-[10px] text-gray-400 text-left">PDF, DOC, JPG or PNG format supported</p>
          </div>

          {/* Description */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-gray-700 block">Company bio guidelines & summary (Visible to patrons)</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail your staff sizing, custom certifications, arrival speed averages and machinery tool specialties..."
              className="w-full bg-transparent p-3 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              id="business-desc-textarea"
            ></textarea>
          </div>

        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-450 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition flex items-center space-x-1 shadow-sm cursor-pointer"
          id="business-profile-save"
        >
          <Save size={14} />
          <span>Save Company parameters</span>
        </button>

      </form>

    </div>
  );
}
