import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Calendar, MessageSquare, CreditCard, XCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
export default function MyBookings(){
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'accepted', 'completed', 'cancelled'

  // MODAL STATES
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTargetId, setReviewTargetId] = useState(null); // booking ID
  const [statusMsg, setStatusMsg] = useState(null);

  const triggerStatus = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => {
      setStatusMsg(null);
    }, 4500);
  };


   useEffect(() => {
  loadBookingsList();
}, [activeTab]);

  const loadBookingsList = async () => {
    setLoading(true);
    try {
      const response = await api.getCustomerBookings();
      setBookings(response.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    let proceed = true;
    try {
      proceed = window.confirm('Are you sure you want to cancel this scheduled appointment?');
    } catch (e) {
      proceed = true; // safe fallback for sandboxed iFrames
    }
    if (!proceed) return;

    try {
      await api.cancelBooking(id);
      triggerStatus('Appointment successfully cancelled.');
      loadBookingsList();
    } catch (err) {
      triggerStatus(err.message || 'Error cancelling booking.');
    }
  };
  // REVIEW MODAL HANDLING
  const openReviewModal = (booking) => {
    setReviewTargetId(booking.id);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewTargetId) return;

    try {
      await api.submitReview({
        bookingId: reviewTargetId,
        rating: reviewRating,
        comment: reviewComment
      });
      triggerStatus('Review successfully published! Thanks for the rating.');
      setReviewModalOpen(false);
      loadBookingsList();
    } catch (err) {
      triggerStatus(err.message || 'Could not save review specifications.');
    }
  };

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  const tabLabels = [
    { id: 'pending', label: 'Pending Approval' },
    { id: 'accepted', label: 'Accepted Scheduled' },
    { id: 'completed', label: 'Completed Jobs' },
    { id: 'cancelled', label: 'Cancelled / Rejected' }
  ];

  return (
    <div className="space-y-6 text-left" id="customer-reservations-dashboard">
      
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Bookings Ledger</h1>
        <p className="text-xs text-gray-400">Track pending quotes, ongoing jobs, and leave ratings for specialists</p>
      </div>

      {/* Booking Tabs selectors */}
      <div className="flex border-b border-gray-100 gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabLabels.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
              {bookings.filter(b => b.status === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* APPOINTMENT CARDS LIST */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-gray-50 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-gray-100 max-w-sm mx-auto space-y-3">
          <ShoppingCart size={40} className="text-emerald-500/30 mx-auto animate-bounce" />
          <h3 className="font-extrabold text-gray-900 text-sm">No bookings found</h3>
          <p className="text-xs text-gray-450 px-4 leading-relaxed">
            No service orders located in current section "{activeTab.toUpperCase()}". Browse our explore center.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition"
          >
            Explore Services
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col md:flex-row justify-between gap-5" id={`booking-card-${b.id}`}>
              
              {/* Snapshot image + information */}
              <div className="flex items-start space-x-4">
                <img
                  src={b.service_image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150'}
                  alt={b.service_title}
                  className="w-16 h-16 rounded-xl object-cover ring-2 ring-emerald-500/10 shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="font-black text-gray-950 text-sm leading-snug">{b.service_title}</h3>
                  <p className="text-xs text-emerald-800 font-bold">Specialist: {b.provider_name}</p>
                  
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400 font-medium pt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{b.booking_date} at {b.booking_time}</span>
                    </span>
                    <span>•</span>
                    <span>Duration: {b.service_duration} mins</span>
                  </div>
                  
                  {b.address && (
                    <p className="text-[10px] text-gray-400 truncate max-w-sm pt-1">📍 Address: {b.address}</p>
                  )}
                </div>
              </div>

              {/* Status metrics + actions buttons */}
              <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-50">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-gray-450 uppercase block font-black">Amount billed</span>
                  <span className="text-base font-black text-gray-900">${b.total_price}</span>
                </div>

                {/* Conditional client controls buttons depending on state */}
                <div className="flex space-x-2">

  {/* 1. PAID STATE (HIGHEST PRIORITY) */}
   {(
  (b.payment_status === 'paid' ||
   localStorage.getItem(`payment_${b.id}`) === 'paid') &&
  (b.status === 'pending' || b.status === 'accepted')
) ? (
    <>
  <span className="inline-flex items-center justify-center text-emerald-700 bg-emerald-50 text-[10px] font-bold px-3 py-1 rounded-full">
    Paid ✓
  </span>

  {b.status === 'pending' && (
    <button
      onClick={() => handleCancelBooking(b.id)}
      className="text-gray-400 hover:text-red-600 border border-gray-200 p-2 rounded-xl text-xs font-semibold"
    >
      Cancel
    </button>
  )}

  {b.status === 'accepted' && (
    <button
      onClick={() => handleCancelBooking(b.id)}
      className="text-red-500 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold"
    >
      Cancel scheduled appointment
    </button>
  )}
</>
  ) : (
    <>
      {/* 2. BEFORE PAYMENT ONLY */}
      {b.status === 'pending' && (
  <>
    {(b.payment_status === 'paid' ||
      localStorage.getItem(`payment_${b.id}`) === 'paid') && (
      <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold px-3 py-1 rounded-full">
        Paid ✓
      </span>
    )}

    <button
      onClick={() => handleCancelBooking(b.id)}
      className="text-gray-400 hover:text-red-600 border border-gray-200 p-2 rounded-xl text-xs font-semibold"
    >
      Cancel
    </button>
  </>
)}

      {/* 3. ACCEPTED STATE */}
      {b.status === 'accepted' && (
        <>
    {(b.payment_status === 'paid' ||
      localStorage.getItem(`payment_${b.id}`) === 'paid') && (
      <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold px-3 py-1 rounded-full">
        Paid ✓
      </span>
    )}
        <button
          onClick={() => handleCancelBooking(b.id)}
          className="text-red-500 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold"
        >
          Cancel scheduled appointment
        </button>
          </>
      )}

      {/* 4. COMPLETED STATE */}
      {b.status === 'completed' && (
        <div className="flex items-center space-x-2">
          <span className="text-emerald-700 bg-emerald-50 text-[10px] font-black px-2.5 py-1 rounded-full">
            Archived
          </span>

          {!b.review_posted ? (
            <button
              onClick={() => openReviewModal(b)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1 transition shadow-xs"

            >
              Write Star Review
            </button>
          ) : (
            <span className="text-amber-600 bg-amber-50 text-[10px] font-bold px-3 py-1 rounded-full">
              ★ Rated {b.rating_given || 5}/5
            </span>
          )}
        </div>
      )}

      {/* 5. CANCELLED STATE */}
      {b.status === 'cancelled' && (
        <span className="text-gray-450 bg-gray-50 text-[10px] font-bold px-3 py-1 rounded-full">
          Cancelled Slot
        </span>
      )}
    </>
  )}

</div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* POPUP SUBMIT STAR REVIEW DIALOG MODAL */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Add star client appraisal report">
        <form onSubmit={handleReviewSubmit} className="space-y-5 text-left">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block">Overall Star Rating</label>
            <div className="flex items-center space-x-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((starsCount) => (
                <button
                  type="button"
                  key={starsCount}
                  onClick={() => setReviewRating(starsCount)}
                  className="p-1 rounded-full text-amber-450 focus:outline-none transition group"
                >
                  <Star
                    size={28}
                    fill={reviewRating >= starsCount ? 'currentColor' : 'none'}
                    className="text-amber-500 hover:scale-110 active:scale-95 transition"
                  />
                </button>
              ))}
            </div>
            <span className="text-[10px] text-gray-400 block pt-1">Selecting {reviewRating} stars of 5</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-750 block">Audit comment / feedback</label>
            <textarea
              required
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Outline your provider feedback e.g. 'Very clean, punctual, split AC jet works amazing'..."
              className="w-full bg-transparent p-3 text-xs text-gray-800 border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="text-gray-450 font-semibold px-4 py-2 hover:bg-gray-50 rounded-xl text-xs"
            >
              Close
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
            >
              Publish Review Report
            </button>
          </div>
        </form>
      </Modal>

      {/* Floating Status Notification Bar */}
      {statusMsg && (
        <div className="fixed bottom-5 right-5 bg-white text-slate-900 border border-gray-100 p-4 rounded-2xl shadow-xl space-x-2 flex items-center z-50 animate-bounce" style={{ zIndex: 1000 }}>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          <p className="text-xs font-semibold">{statusMsg}</p>
        </div>
      )}

    </div>
  );
}
