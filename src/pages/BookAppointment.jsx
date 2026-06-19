import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, Clock, MapPin, Notebook, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
export default function BookAppointment({ user }){
  const navigate = useNavigate();
  const location = useLocation();
  const { serviceId, providerId } = location.state || {};
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking forms states
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [address, setAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');

  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM'
  ];
  if (!serviceId || !providerId) {
  return (
    <div className="p-6 text-center text-red-600">
      Invalid booking request. Please select service again.

      <button
        onClick={() => navigate('/explore')}
        className="block mt-4 text-emerald-600 underline"
      >
        Back to catalog
      </button>
    </div>
  );
}

  useEffect(() => {
  if (!serviceId) return;

  async function loadServiceSpecs() {
    try {
      const response = await api.getServiceById(serviceId);
      setService(response.service);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error loading target service specifications.');
    } finally {
      setLoading(false);
    }
  }

  loadServiceSpecs();
}, [serviceId]);
const showError = (message) => {
  setErrorMsg(message);

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!bookingDate) {
       showError('Choose a date first');
      return;
    }

    if (!bookingTime) {
       showError('Please select an active hourly time slot.');
      return;
    }

    if (!address) {
       showError('Client physical delivery address is mandatory.');
      return;
    }

    setBookingLoading(true);

    try {
      const response = await api.createBooking({
        serviceId,
         providerId,
        bookingDate,
        bookingTime,
        address,
        notes
      });

      // Shift straight to Checkout payment page passing the newly created Booking ID!
       navigate('/payment', {
  state: {
    bookingId: response.bookingId,
    serviceId,
    providerId
  }
});
    } catch (err) {
      console.error(err);
      showError(err.message || 'The selected slot has already been booked. Please pick another date or hour.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 mx-auto"></div>
        <div className="h-32 bg-gray-200 rounded-xl max-w-md mx-auto"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="py-24 text-center text-gray-500">
        <p className="font-bold">Specified service specifications could not be parsed.</p>
        <button onClick={() => navigate('/explore')} className="text-emerald-600 underline">Back to catalog</button>
      </div>
    );
  }

  // Get current date string in YYYY-MM-DD for native input minimum checks
  const todayString = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-left" id="scheduling-picker-session">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Confirm Your Slot</h1>
        <p className="text-xs text-gray-450">Complete scheduling hours, notes & finalize task orders</p>
      </div>

      {/* Target service snapshot card */}
      <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100/50 p-5 flex items-center space-x-4">
        <img
          src={service.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150'}
          alt={service.title}
          className="w-16 h-16 rounded-xl object-cover ring-2 ring-emerald-500/10 shrink-0 border border-white"
        />
        <div className="space-y-1">
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
            Order item
          </span>
          <h3 className="font-extrabold text-gray-900 text-sm leading-snug">{service.title}</h3>
          <div className="flex space-x-2 text-[11px] text-gray-500 font-semibold">
            <span>Duration: {service.duration} mins</span>
            <span>•</span>
            <span>Total: <strong className="text-emerald-700">${service.price}</strong></span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center space-x-2.5 p-4 bg-red-50 rounded-2xl text-xs text-red-600 border border-red-100 font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Booking scheduling form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-3xs space-y-6">
        
        {/* Date picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
            <Calendar size={14} className="text-emerald-600" />
            <span>Select Calendar Date</span>
          </label>
          <input
            type="date"
          
            min={todayString}
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            className="w-full bg-transparent px-4 py-2.5 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
            id="scheduler-date-input"
          />
        </div>

        {/* Time hour slots */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
            <Clock size={14} className="text-emerald-600" />
            <span>Choose Preferred Hour Slot</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {timeSlots.map((slot) => {
              const works = bookingTime === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setBookingTime(slot)}
                  className={`p-3 text-left rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    works
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/15'
                      : 'border-gray-200 hover:border-emerald-250 text-gray-600 hover:bg-gray-50/50'
                  }`}
                  id={`slot-${slot.replace(/\s+/g, '-')}`}
                >
                  <span>{slot}</span>
                  {works && <span className="h-2 w-2 rounded-full bg-emerald-600"></span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Physical field Address */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
            <MapPin size={14} className="text-emerald-600" />
            <span>Service Delivery Address</span>
          </label>
          <textarea
          
            rows={2.5}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Input delivery street, flat number, city zipcode..."
            className="w-full bg-transparent px-4 py-3 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            id="scheduler-address-textarea"
          ></textarea>
        </div>

        {/* Narrative additional notes */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-750 flex items-center space-x-1.5">
            <Notebook size={14} className="text-emerald-600" />
            <span>Special Guidelines / Entry instructions (Optional)</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Ring double bell, dog inside, parking spots behind garage..."
            className="w-full bg-transparent px-4 py-3 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
          ></textarea>
        </div>

        {/* ESCROW ASSURANCES POLICY */}
        <div className="p-4 bg-emerald-50/20 text-[10px] text-gray-500 rounded-2xl border border-dashed border-emerald-100 flex items-start space-x-2.5">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-semibold">
            By booking, you reserve a dedicated workspace slot with the certified expert. Cancellations up to 24 hours prior carry zero penalties. Escrows securely release wages upon completed task confirmations.
          </p>
        </div>

        {/* Submit panel */}
        <button
          type="submit"
          disabled={bookingLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-emerald-400 font-bold py-3.5 px-6 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
          id="scheduler-confirm-btn"
        >
          {bookingLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Lock Slot & Proceed to Pay</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>

      </form>

    </div>
  );
}
