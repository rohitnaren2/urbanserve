import React, { useState } from 'react';
import { User, Briefcase, Camera, Mail, Phone, Lock, FileText, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Signup({ onSignupSuccess, initialAsProvider = false }){
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isProviderSignup = searchParams.get('asProvider') === 'true';
 const [step, setStep] = useState(
  initialAsProvider || isProviderSignup ? 2 : 1
);

const [roleSelection, setRoleSelection] = useState(
  initialAsProvider || isProviderSignup ? 'provider' : ''
);
  
  // Registration forms payloads
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [address, setAddress] = useState('');

  // Provider specific fields
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('AC Repair'); // Default category
  const [experience, setExperience] = useState('2');
  const [description, setDescription] = useState('');
  const [verificationDocument, setVerificationDocument] = useState('');

  // Schedulers controls
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleSelection = (role) => {
    setRoleSelection(role);
    setStep(2);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // client validity validations
    if (!email || !fullName || !phone || !password) {
      setErrorMsg('Mandatory specifications are missing.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Password confirmation mismatch. Correct matching fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password strength warning: minimum 6 characters required.');
      return;
    }

    setLoading(true);

    try {
      if (roleSelection === 'customer') {
  const response = await api.registerCustomer({
    fullName,
    email,
    phone,
    password,
    profilePhoto:
      profilePhoto ||
      'https://ui-avatars.com/api/?name=' +
      encodeURIComponent(fullName) +
      '&background=10b981&color=fff',
    address
  });

  localStorage.setItem('token', response.token);

  if (onSignupSuccess) {
    onSignupSuccess(response.user);
  }

  navigate('/customer-dashboard');
}
else {
  const response = await api.registerProvider({
    fullName,
    email,
    phone,
    password,
    businessName: businessName || `${fullName} Services`,
    category,
    experience: Number(experience),
    description,
    verificationDocument,
    profilePhoto:
      profilePhoto ||
      'https://ui-avatars.com/api/?name=' +
      encodeURIComponent(fullName) +
      '&background=10b981&color=fff'
  });

  localStorage.setItem('token', response.token);

  if (onSignupSuccess) {
    onSignupSuccess(response.user);
  }

  navigate('/provider-dashboard');
}
    
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error occurred during dynamic database registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex flex-col justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" id="unified-registration-flow">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 relative">
        <div className="absolute top-4 right-4 text-emerald-500">
          <Sparkles className="animate-pulse" size={18} />
        </div>

        {/* STEP 1: ROLE COMPONENT SELECTION */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create Your Account</h2>
              <p className="text-xs text-gray-400">Join the UrbanServe ecosystem to list or schedule task categories</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Card 1: Customer */}
              <div
                onClick={() => handleRoleSelection('customer')}
                className="group border border-gray-100 hover:border-emerald-500 rounded-3xl p-6 text-left cursor-pointer transition-all duration-200 bg-white hover:bg-emerald-50/20 active:scale-98"
                id="select-role-customer"
              >
                <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <User size={28} />
                </div>
                <h3 className="font-extrabold text-gray-900 mt-5 text-lg">I am a Customer</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Book verified appliance servicemen, deep sanitizing cleaners, plumbers, and wellness specialists on demand.
                </p>
                <div className="mt-6 flex items-center space-x-1 font-bold text-xs text-emerald-600 group-hover:text-emerald-700">
                  <span>Continue</span>
                  <span>→</span>
                </div>
              </div>

              {/* Card 2: Provider */}
              <div
                onClick={() => handleRoleSelection('provider')}
                className="group border border-gray-100 hover:border-emerald-500 rounded-3xl p-6 text-left cursor-pointer transition-all duration-200 bg-white hover:bg-emerald-50/20 active:scale-98"
                id="select-role-provider"
              >
                <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Briefcase size={28} />
                </div>
                <h3 className="font-extrabold text-gray-900 mt-5 text-lg">Become a Partner</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  List services, accept booking slots from local clients, manage calendars, and secure steady weekly earnings.
                </p>
                <div className="mt-6 flex items-center space-x-1 font-bold text-xs text-emerald-600 group-hover:text-emerald-700">
                  <span>Continue</span>
                  <span>→</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-2 text-xs text-gray-450 border-t border-gray-50">
              <span>Already registered? </span>
              <button onClick={() => navigate('/login')} className="font-bold text-emerald-600 hover:text-emerald-700">Sign In instead</button>
            </div>
          </div>
        )}

        {/* STEP 2: REGISTRATION FORM RENDER */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <button onClick={() => setStep(1)} className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition">
                  ← Back to Selection
                </button>
                <h3 className="text-2xl font-black text-gray-950 mt-1">
                  Register as {roleSelection === 'customer' ? 'Customer Client' : 'Approved Provider Specialist'}
                </h3>
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {roleSelection} Mode
              </span>
            </div>

            {errorMsg && (
              <div className="flex items-center space-x-2.5 p-4 bg-red-50 rounded-2xl text-xs text-red-600 border border-red-100 font-semibold">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              
              {/* Profile image Upload */}
              <div className="md:col-span-2 flex flex-col items-center sm:items-start space-y-3">
                <label className="text-xs font-bold text-gray-700">Profile Image</label>
                <div className="flex items-center space-x-4">
                  <div className="relative group w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-emerald-500/10 shrink-0 bg-gray-50 flex items-center justify-center border border-gray-200">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera size={20} className="text-gray-400" />
                    )}
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold transition shadow-3xs inline-block">
                      Choose Image File
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
                    <p className="text-[10px] text-gray-400">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Full name input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-transparent px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  id="reg-full-name"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-450">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent pl-9 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-450 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    id="reg-email"
                  />
                </div>
              </div>

              {/* Phone number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-450">
                    <Phone size={14} />
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-transparent pl-9 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-455 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    id="reg-phone"
                  />
                </div>
              </div>

              {/* Address (Customer optional placeholder) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Default Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, suite, city zipcode"
                  className="w-full bg-transparent px-4 py-2.5 text-xs text-gray-800 placeholder-gray-450 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  id="reg-address"
                />
              </div>

              {/* Passwords */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-450">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-transparent pl-9 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-450 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    id="reg-password"
                  />
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-450">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retype password"
                    className="w-full bg-transparent pl-9 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-450 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    id="reg-password-confirm"
                  />
                </div>
              </div>

              {/* PROVIDERS SPECIALIST SPECIFIC COLUMNS */}
              {roleSelection === 'provider' && (
                <>
                  <div className="border-t border-dashed border-gray-150 md:col-span-2 my-2"></div>

                  {/* Business Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Business / Trade Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="AC Specialist Clinic Ltd"
                      className="w-full bg-transparent px-4 py-2.5 text-xs text-gray-800 placeholder-gray-450 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {/* Category select option */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Primary Category Specialty</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white px-3 py-2.5 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="AC Repair">Air Conditioning (AC) Repair & Installation</option>
                      <option value="Cleaning">Sanitizing deep Cleaning Services</option>
                      <option value="Plumbing">Piping & Plumbing Leak services</option>
                      <option value="Plastering">General Wall Plastering / Renovation</option>
                    </select>
                  </div>

                  {/* Experience counter */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Years of Industry Experience</label>
                    <input
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. 4"
                      className="w-full bg-transparent px-4 py-2.5 text-xs text-gray-800 placeholder-gray-450 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {/* Verification document Upload */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Verification Document (Trade License / ID)</label>
                    <div className="relative">
                      <label className="flex items-center justify-between w-full bg-transparent px-4 py-2 text-xs text-gray-800 border border-gray-200 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/5 transition duration-150">
                        <span className="truncate max-w-[180px] font-mono text-gray-650">
                          {verificationDocument ? (verificationDocument.startsWith('data:') ? '📄 Document Uploaded' : verificationDocument) : 'Select verification file...'}
                        </span>
                        <span className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition ml-2">
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

                  {/* Narrative description */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Company Description & Bio</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Outline your crew qualifications, speed response timings and specialized tools..."
                      className="w-full bg-transparent px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    ></textarea>
                  </div>
                </>
              )}

              {/* Submit panel */}
              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-emerald-400 font-bold py-3 px-4 rounded-xl text-xs transition duration-150 flex items-center justify-center space-x-1 shadow-md shadow-emerald-500/10 cursor-pointer"
                  id="submit-register-submit"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Complete registration</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* STEP 3: PARTNER PENDING UNDER REVIEW CONFIRMED */}
        {step === 3 && (
          <div className="py-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
              <CheckCircle size={36} className="text-emerald-500" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-900">Partner Application Under Review</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-gray-800">{fullName}</strong>! Your registration payload is stored in the database. Our licensing team is reviewing your verification documents.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left max-w-md mx-auto">
              <h4 className="text-xs font-extrabold text-gray-800 mb-1.5 uppercase tracking-wide">💼 Current Registry Info:</h4>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• <strong className="text-gray-700">Service Category:</strong> {category}</li>
                <li>• <strong className="text-gray-700">Business Name:</strong> {businessName}</li>
                <li>• <strong className="text-gray-700">Approval Status:</strong> <span className="bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full text-[10px]">PENDING APPROVAL</span></li>
              </ul>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-xs font-bold transition"
              >
                Access Login Panel
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto text-gray-650 hover:bg-gray-100 border border-gray-250 px-6 py-3 rounded-xl text-xs font-semibold transition"
              >
                Back to Welcome Landing
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
