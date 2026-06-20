import React, { useState, useEffect } from 'react';
import { Calendar, Phone, MapPin, User, Check, X, Shield, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'accepted', 'completed', 'cancelled'
  const [confirmModal, setConfirmModal] = useState({
  isOpen: false,
  action: null,
  id: null,
  message: ''
});
  useEffect(() => {
    loadBookingsList();
  }, []);
  const triggerToast = (msg, isError = false) => {
  setNotification({ message: msg, isError });

  setTimeout(() => {
    setNotification((curr) =>
      curr && curr.message === msg ? null : curr
    );
  }, 4500);
};

  const loadBookingsList = async () => {
    setLoading(true);
    try {
      const response = await api.getProviderBookings();
      setBookings(response.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleConfirmAction = async () => {
  const actionMap = {
    accepted: 'accept',
    cancelled: 'reject',
    completed: 'complete',
  };

  try {
    await api.updateBookingStatus(
      confirmModal.id,
      actionMap[confirmModal.action]
    );

    triggerToast(`Booking ${confirmModal.action.toUpperCase()} successful`);
    loadBookingsList();
  } catch (err) {
    triggerToast(err.message || 'Action failed', true);
  } finally {
    setConfirmModal({ isOpen: false, action: null, id: null, message: '' });
  }
};

const handleUpdateStatus = async (id, status) => {
  const actionMap = {
    accepted: 'accept',
    cancelled: 'reject',
    completed: 'complete',
  };

  const action = actionMap[status];

  try {
    await api.updateBookingStatus(id, action);

    triggerToast(`Booking ${status.toUpperCase()} successfully`);
    loadBookingsList();
  } catch (err) {
    triggerToast(err.message || 'Error updating booking status', true);
  }
};

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  const tabsInfo = [
    { id: 'pending', label: 'Incoming Bids' },
    { id: 'accepted', label: 'Accepted Scheduled' },
    { id: 'completed', label: 'Completed Ledger' },
    { id: 'cancelled', label: 'Declined' }
  ];

  return (
    <div className="space-y-6 text-left" id="provider-booking-controls">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage Job queue</h1>
        <p className="text-xs text-gray-400">Accept requests, coordinate arrivals, and file completed job tickets</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabsInfo.map((tab) => (
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

      {/* Bookings queue list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-gray-50 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-gray-100 max-w-sm mx-auto space-y-3">
          <Calendar size={40} className="text-emerald-500/30 mx-auto animate-bounce" />
          <h3 className="font-extrabold text-gray-900 text-sm">Queue is empty</h3>
          <p className="text-xs text-gray-400 px-4 leading-relaxed">
            No active jobs in category "{activeTab.toUpperCase()}" registered.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col md:flex-row justify-between gap-5" id={`provider-booking-${b.id}`}>
              
              {/* Left specifications block */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide">
                    {b.service_duration} Min Duration
                  </span>
                  <h3 className="text-sm font-black text-gray-950">{b.service_title}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-1 border-t border-dashed border-gray-100/80">
                  {/* Client Info */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-black text-gray-400 block">Customer Clienт</span>
                    <p className="font-bold text-gray-800 flex items-center space-x-1.5">
                      <User size={13} className="text-emerald-600" />
                      <span>{b.customer_name}</span>
                    </p>
                    <p className="text-gray-500 font-mono text-[11px] flex items-center space-x-1.5">
                      <Phone size={13} />
                      <span>{b.customer_phone || "+1 (555) 0192-384"}</span>
                    </p>
                  </div>

                  {/* Arrival Date and Slot */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-black text-gray-400 block">Arrival Schedule</span>
                    <p className="font-extrabold text-gray-800 flex items-center space-x-1.5">
                      <Calendar size={13} className="text-emerald-600" />
                      <span>{b.booking_date}</span>
                    </p>
                    <p className="text-emerald-700 font-bold">{b.booking_time}</p>
                  </div>
                </div>

                {b.address && (
                  <div className="text-xs text-left text-gray-500 space-y-0.5">
                    <span className="text-[9px] font-black text-gray-400 block uppercase">Transit destination address</span>
                    <p className="flex items-center space-x-1.5">
                      <MapPin size={12} className="text-red-500" />
                      <span>{b.address}</span>
                    </p>
                  </div>
                )}

                {b.notes && (
                  <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 leading-relaxed max-w-lg">
                    💡 <strong className="text-gray-700">Client Guidelines:</strong> "{b.notes}"
                  </div>
                )}
              </div>

              {/* Right Billing and active triggers buttons */}
              <div className="flex flex-row md:flex-col justify-between items-end shrink-0 md:pl-5 md:border-l md:border-gray-100 gap-4">
                <div className="text-left md:text-right">
                  <span className="text-[9px] text-gray-450 uppercase block font-black">Wage escrow</span>
                  <span className="text-lg font-black text-gray-900">${b.total_price}</span>
                  <span className="text-[10px] leading-none block font-semibold text-emerald-605 text-emerald-600">Secure Escrow Wallet</span>
                </div>

                {/* Status modifier CTA */}
                <div className="flex space-x-2">
                  
                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() =>
  setConfirmModal({
    isOpen: true,
    action: 'cancelled',
    id: b.id,
    message: 'Are you sure you want to cancel this booking?'
  })
}
                        className="p-2 border border-gray-200 hover:border-red-200 text-red-500 hover:bg-red-50/50 rounded-xl transition cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={() =>
  setConfirmModal({
    isOpen: true,
    action: 'accepted',
    id: b.id,
    message: 'Confirm this booking request?'
  })
}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Check size={14} />
                        <span>Confirm Request</span>
                      </button>
                    </>
                  )}

                  {b.status === 'accepted' && (
                    <button
                      onClick={() =>
  setConfirmModal({
    isOpen: true,
    action: 'completed',
    id: b.id,
    message: 'Mark this job as completed?'
  })
}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-sm shadow-indigo-505"
                    >
                      <Check size={14} />
                      <span>Job Completed / File invoice</span>
                    </button>
                  )}

                  {b.status === 'completed' && (
                    <span className="text-emerald-700 bg-emerald-50 text-[10px] uppercase font-bold px-3 py-1 rounded-full select-none">
                      Job Completed ✓
                    </span>
                  )}

                  {b.status === 'cancelled' && (
                    <span className="text-gray-450 bg-gray-50 text-[10px] uppercase font-bold px-3 py-1 rounded-full select-none">
                      Rejected Slots
                    </span>
                  )}

                </div>
              </div>

            </div>
          ))}
        </div>
      )}
      {notification && (
  <div
    className={`fixed bottom-5 right-5 flex items-center space-x-2.5 p-4 rounded-2xl shadow-xl border ${
      notification.isError
        ? 'bg-red-50 text-red-700 border-red-100'
        : 'bg-emerald-50 text-emerald-900 border-emerald-100'
    }`}
    style={{ zIndex: 1000 }}
  >
    <div
      className={`w-2 h-2 rounded-full ${
        notification.isError ? 'bg-red-500' : 'bg-emerald-500'
      }`}
    />
    <span className="text-xs font-bold font-mono">
      {notification.message}
    </span>
  </div>
)}
{confirmModal.isOpen && (
  <div
    className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
    style={{ zIndex: 999 }}
  >
    <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-150/50 shadow-2xl space-y-4">

      {/* Title */}
      <div className="space-y-1.5 text-center sm:text-left">
        <h3 className="text-sm font-black text-slate-950 font-sans tracking-tight block">
          ⚠️ Confirm Action
        </h3>

        <p className="text-[11px] text-gray-600 leading-relaxed font-semibold">
          {confirmModal.message}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2.5 pt-2">
        <button
          onClick={() =>
            setConfirmModal({
              isOpen: false,
              action: null,
              id: null,
              message: ''
            })
          }
          className="flex-1 bg-gray-50 active:bg-gray-100 text-gray-650 text-[10px] font-bold py-2.5 rounded-xl border border-gray-200"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            setConfirmModal({
              ...confirmModal,
              isOpen: false
            });

            if (handleConfirmAction) {
              handleConfirmAction();
            }
          }}
          className="flex-1 bg-slate-950 hover:bg-slate-800 text-white text-[10px] font-extrabold py-2.5 rounded-xl shadow-md"
        >
          Proceed Confirm
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}
