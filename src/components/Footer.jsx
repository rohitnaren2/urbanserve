import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Facebook, Twitter, Instagram, Send } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800" id="global-application-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand block */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <Sparkles className="h-6 w-6 text-emerald-500 animate-pulse" />
              <span className="font-extrabold text-xl tracking-tight">Urban<span className="text-emerald-400 font-light text-base ml-1">Serve</span></span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Your one-stop premium services destination. Connecting certified home, wellness, and technical professionals with discerning clients instantly.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="p-2 bg-gray-800 hover:bg-emerald-600 rounded-lg text-white transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-emerald-600 rounded-lg text-white transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-emerald-600 rounded-lg text-white transition-colors">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-emerald-400 transition-colors">Home Landing</button>
              </li>
              <li>
                <button onClick={() => navigate('/explore')} className="hover:text-emerald-400 transition-colors font-medium text-emerald-500">Explore Services</button>
              </li>
              <li>
                <button onClick={() => navigate('/signup?asProvider=true')} className="hover:text-emerald-400 transition-colors">Join as Approved Provider</button>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-emerald-400 transition-colors">Staff Login Portal</button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Top Categories</h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>• AC Jet Cleaning & Repair Specialist</li>
              <li>• Sofa Steam Laundering & Sanitizing</li>
              <li>• Living Room Carpet Floor Scrubbing</li>
              <li>• High-Tech Thermostat Diagnostics</li>
              <li>• Professional Housekeeping & Dusting</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Stay Informed</h3>
            <p className="text-xs text-gray-400">
              Subscribe to unlock periodic discount codes on appliance servicing.
            </p>
            <div className="flex bg-gray-800 rounded-xl overflow-hidden border border-gray-700 focus-within:border-emerald-500 transition-colors">
              <input 
                type="email" 
                placeholder="Enter email address" 
                className="w-full bg-transparent px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 transition-colors">
                <Send size={14} />
              </button>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} UrbanServe Marketplace Platform Inc. All rights reserved. Designed for excellence.</p>
        </div>
      </div>
    </footer>
  );
}
