import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!email || !password) {
      setErrorMsg('Mandatory email and password credentials are missing.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.login({ email, password });
      
      // Save token
      localStorage.setItem('token', response.token);
      
      // Fire success callback
      const user = response.user;

// Save user
     onLoginSuccess(user);

// Redirect based on role
     if (user.roleId === 1) navigate('/customer-dashboard');
     else if (user.roleId === 2) navigate('/provider-dashboard');
     else if (user.roleId === 3) navigate('/admin');
     else navigate('/');

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Login credentials invalid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex flex-col justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" id="login-authorization-page">
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 space-y-8 relative">
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 text-emerald-500 hover:text-emerald-600 transition">
          <Sparkles size={18} className="animate-pulse" />
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-gray-400">Securely sign into your UrbanServe dashboard account</p>
        </div>

        {/* Error Notification Toast Box */}
        {errorMsg && (
          <div className="flex items-center space-x-2.5 p-4 bg-red-50 rounded-2xl text-xs text-red-600 border border-red-100 font-semibold">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent pl-11 pr-4 py-3 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent pl-11 pr-4 py-3 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium"
              />
            </div>
          </div>

          {/* Options links */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <label className="flex items-center space-x-2 text-gray-500 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => alert("Please contact 'admin@marketplace.com' to reset credentials.")}
              className="font-bold text-emerald-600 hover:text-emerald-700"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit btn */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 px-4 rounded-xl text-xs transition duration-150 flex items-center justify-center space-x-1 shadow-md shadow-emerald-600/10"
            id="login-form-submit"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Sign In Securely</span>
            )}
          </button>
        </form>

        {/* Demo Credentials Section helper */}
        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-left space-y-1.5">
          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wide">💡 SEEDED DEMO CREDENTIALS:</p>
          <div className="grid grid-cols-1 gap-1 text-[10px] text-emerald-700 font-mono">
            <div>• <strong className="text-gray-700">Customer:</strong> customer@marketplace.com / customer123</div>
            <div>• <strong className="text-gray-700">Provider:</strong> provider@marketplace.com / provider123</div>
            <div>• <strong className="text-gray-700">Admin:</strong> admin@marketplace.com / admin123</div>
          </div>
        </div>

        {/* Trigger to registration */}
        <div className="text-center text-xs text-gray-400 font-medium">
          <span>New to UrbanServe? </span>
          <button
            onClick={() => navigate('/signup')}
            className="font-bold text-emerald-600 hover:text-emerald-700"
            id="login-to-signup-btn"
          >
            Create Account Now
          </button>
        </div>

      </div>
    </div>
  );
}
