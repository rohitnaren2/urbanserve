import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, CalendarOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function Availability() {
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadBlockedDates();
  }, []);

  const loadBlockedDates = async () => {
    setLoading(true);
    try {
      const response = await api.getProviderBlockedDates();
      setBlockedDates(response.blockedDates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newBlockedDate) {
      setErrorMsg('Choose a target rest calendar date calendar first.');
      return;
    }

    setSyncLoading(true);

    try {
      await api.addBlockedDate(newBlockedDate);
      alert('Calendar date successfully blocked! Customers cannot book you style on this date.');
      setNewBlockedDate('');
      loadBlockedDates();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error occurred appending rest date.');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleRemoveBlock = async (date) => {
    if (!window.confirm(`Unlock availability and remove holiday blocks on ${date}?`)) return;

    try {
      await api.removeBlockedDate(date);
      alert('Holiday block removed. Date is available again!');
      loadBlockedDates();
    } catch (err) {
      alert(err.message || 'Error unlocking date.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left" id="provider-availability-scheduler">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Holiday & Rest blocks</h1>
        <p className="text-xs text-gray-400">Add calendar dates where your team is off-service or enjoying resting times</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Form: Add rest calendar */}
        <div className="md:col-span-5 bg-white p-5 border border-gray-100 rounded-3xl space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900">Block New Off Date</h3>
          
          {errorMsg && (
            <div className="flex items-center space-x-1.5 p-3 bg-red-50 rounded-xl text-xs text-red-650 border border-red-100 font-semibold">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddBlock} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Choose Calendar Date</label>
              <input
                type="date"
                
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-transparent px-3 py-2.5 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                id="block-date-picker"
              />
            </div>

            <button
              type="submit"
              disabled={syncLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              id="block-date-submit"
            >
              {syncLoading ? 'Syncing...' : 'Lock Calendar Date'}
            </button>
          </form>

          <div className="p-3 bg-gray-50 rounded-xl flex items-start space-x-2 text-[10px] text-gray-400">
            <ShieldCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Blocking a calendar date locks clients from choosing it in booking portals. Pending work schedules are not altered.
            </p>
          </div>
        </div>

        {/* Right list: Blocked calendars */}
        <div className="md:col-span-7 bg-white p-5 border border-gray-100 rounded-3xl space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900">Locked Dates ledger</h3>

          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-10 bg-gray-100 rounded-xl"></div>
            </div>
          ) : blockedDates.length === 0 ? (
            <div className="py-12 text-center text-gray-450 space-y-2">
              <CalendarOff size={36} className="text-gray-300 mx-auto" />
              <p className="text-xs font-semibold">No holiday blocks configured yet.</p>
              <p className="text-[10px] text-gray-400">You are currently fully open to client scheduling bookings.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {blockedDates.map((date) => (
                <div key={date} className="p-3 bg-red-50/40 rounded-xl border border-red-100/40 flex justify-between items-center" id={`locked-date-item-${date}`}>
                  <span className="font-mono text-xs text-red-700 font-bold">{date}</span>
                  <button
                    onClick={() => handleRemoveBlock(date)}
                    className="p-1 px-2.5 border border-red-200 text-red-500 bg-white hover:bg-red-50 text-[10px] font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 size={11} />
                    <span>Unlock Date</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
