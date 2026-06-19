import React, { useState, useEffect } from 'react';
import { CreditCard, Landmark, CheckCircle2, ShieldCheck, HelpCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate, useLocation } from "react-router-dom";
export default function Payments()  {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingId = location.state?.bookingId;
  const serviceId = location.state?.serviceId;
  const providerId = location.state?.providerId; 
  console.log("Booking ID received:", bookingId);
  if (!bookingId) {
  return (
    <div className="py-24 text-center text-red-600">
      Invalid payment request.

      <button
        onClick={() => navigate('/explore')}
        className="block mt-4 text-emerald-600 underline"
      >
        Back to Services
      </button>
    </div>
  );
}
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Card'); // 'Card', 'UPI', 'NetBanking'
  const [payLoading, setPayLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // Card fields mockup
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    async function loadBill() {
      try {
        const response = await api.getCustomerBookings();
        const found = response.bookings.find(b => b.id === Number(bookingId));
        if (found) {
          setBooking(found);
        } else {
          setErrorMsg('Specified order bills could not be located in database records.');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Error downloading booking ticket.');
      } finally {
        setLoading(false);
      }
    }
    loadBill();
  }, [bookingId]);
  const showError = (message) => {
  setErrorMsg(message);

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};
const handleExecutePayment = async (e) => {
  if (e) e.preventDefault();

  setErrorMsg('');

  if (paymentMethod === 'Card') {
     if (!cardNumber.trim()) {
  showError('Credit Card Number is required.');
  return;
}

const cleanCardNumber = cardNumber.replace(/\s/g, '');

if (!/^\d{16}$/.test(cleanCardNumber)) {
  showError('Credit Card Number must contain exactly 16 digits.');
  return;
}

if (!cardExpiry.trim()) {
  showError('Expiry Date is required.');
  return;
}

if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry.trim())) {
  showError('Expiry Date must be in MM/YY format.');
  return;
}

if (!cardCvv.trim()) {
  showError('CVV Code is required.');
  return;
}

if (!/^\d{3,4}$/.test(cardCvv.trim())) {
  showError('CVV Code must contain 3 or 4 digits.');
  return;
}
  }

  localStorage.setItem(`payment_${bookingId}`, 'paid');
  setSuccess(true);

  setTimeout(() => {
    navigate('/customer-dashboard');
  }, 2000);
};
  
  if (loading) {
    return (
      <div className="py-20 text-center animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto"></div>
        <div className="h-40 bg-gray-250 rounded-2xl max-w-sm mx-auto"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
          <CheckCircle2 size={44} className="text-emerald-500 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900">Payment Processed Successfully!</h2>
          <p className="text-xs text-gray-450 leading-relaxed">
            Your escrow transaction has been recorded. The specialist has been reserved. Redirecting to your active scheduling bookings board...
          </p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-24 text-center text-gray-500">
        <p className="font-bold">{errorMsg || "Booking item not found."}</p>
        <button onClick={() => navigate('/customer-bookings')} className="text-emerald-600 underline">Back to bookings</button>
      </div>
    );
  }

  // Calculate detailed billing breakdowns
  const originalWage = Number(booking.total_price);
  const platformAdminFee = 4.99;
  const govServiceTax = Number((originalWage * 0.08).toFixed(2));
  const invoiceTotal = Number((originalWage + platformAdminFee + govServiceTax).toFixed(2));

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left" id="secure-escrow-checkout">
      
      {/* Back button */}
      <div>
        <button
          onClick={() =>
    navigate('/book', {
      state: {
        serviceId,
        providerId
      }
    })
  }
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-emerald-600 transition tracking-wider uppercase mb-2"
        >
          <ArrowLeft size={14} />
          <span>Back to bookings ledger</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Payment selectors */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-black text-gray-950">Select Escrow Payment Channel</h2>

          {errorMsg && (
            <div className="flex items-center space-x-2.5 p-4 bg-red-50 rounded-2xl text-xs text-red-650 border border-red-100 font-semibold">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Toggle buttons */}
          <div className="grid grid-cols-3 gap-2 border-b border-gray-50 pb-4">
            {[
              { id: 'Card', label: 'Credit Card', icon: CreditCard },
              { id: 'UPI', label: 'UPI / Mobile QR', icon: Landmark },
              { id: 'NetBanking', label: 'NetBanking', icon: Landmark }
            ].map((method) => {
              const Icon = method.icon;
              const matches = paymentMethod === method.id;

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold select-none cursor-pointer transition ${
                    matches
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <Icon size={18} />
                  <span>{method.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleExecutePayment} className="space-y-5">
            
            {/* Card form rendering */}
            {paymentMethod === 'Card' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Credit Card Number</label>
                  <input
                    type="text"
                  
                    value={cardNumber}
                    onChange={(e) => {
  const value = e.target.value
    .replace(/\D/g, '')
    .slice(0, 16);

  const formatted = value.replace(/(.{4})/g, '$1 ').trim();

  setCardNumber(formatted);
}}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full bg-transparent px-4 py-2.5 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Expiry Date</label>
                    <input
                      type="text"
                    
                      value={cardExpiry}
                      onChange={(e) => {
  let value = e.target.value.replace(/\D/g, '');

  if (value.length >= 3) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4);
  }

  setCardExpiry(value);
}}
maxLength={5}
                      placeholder="MM/YY"
                      className="w-full bg-transparent px-4 py-2.5 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">CVV Code</label>
                    <input
                      type="password"
                    
                      value={cardCvv}
                      onChange={(e) => {
  setCardCvv(
    e.target.value.replace(/\D/g, '').slice(0, 4)
  );
}}
maxLength={4}
                      placeholder="xxx"
                      className="w-full bg-transparent px-4 py-2.5 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI QR Code mock */}
            {paymentMethod === 'UPI' && (
              <div className="p-5 bg-emerald-50/20 border border-emerald-100 rounded-2xl text-center space-y-3">
                <p className="text-xs text-emerald-800 font-bold">Standard UPI QR instant sync active</p>
                <div className="mx-auto w-28 h-28 bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
                    alt="Mock QR code placeholder"
                    className="w-full h-full object-cover grayscale brightness-90"
                  />
                </div>
                <p className="text-[10px] text-gray-400">Scan this code from any authorized UPI app. Escrow locks values automatically.</p>
              </div>
            )}

            {/* Netbanking option */}
            {paymentMethod === 'NetBanking' && (
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-gray-700 block">Choose authorized bank</label>
                <select className="w-full bg-white px-3 py-2.5 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold">
                  <option value="bank1">Chase Commercial Bank Group</option>
                  <option value="bank2">Bank of America Digital Corps</option>
                  <option value="bank3">Wells Fargo and Co Holdings</option>
                  <option value="bank4">Citigroup International Corp</option>
                </select>
              </div>
            )}

            {/* Submit Escrow Button */}
            <button
  type="button"
  onClick={handleExecutePayment}
  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-emerald-400 font-bold py-3 px-4 rounded-xl text-xs transition duration-150 flex items-center justify-center space-x-1 shadow-md shadow-emerald-500/10 cursor-pointer"
>
  Pay Now
</button>
          </form>
        </div>

        {/* Right Side: Bill invoice breakdowns receipt */}
        <div className="lg:col-span-5 bg-gray-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-450 uppercase tracking-widest pb-3 border-b border-gray-800">
              Escrow Invoice Summary
            </h3>

            {/* Particular service names */}
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold">RESERVED SERVICESpecialist</span>
              <p className="text-sm font-bold text-white line-clamp-1">{booking.service_title}</p>
              <p className="text-[10px] text-gray-450">Professional: {booking.provider_name}</p>
            </div>

            {/* Billing items */}
            <div className="divide-y divide-gray-800/60 pt-3 space-y-3.5 text-xs">
              
              {/* Item 1 */}
              <div className="flex justify-between items-center text-gray-300">
                <span>Certified Specialist Wages</span>
                <span className="font-extrabold text-white">${originalWage}</span>
              </div>

              {/* Item 2 */}
              <div className="flex justify-between items-center text-gray-350 pt-3.5">
                <span>UrbanServe Platform fee</span>
                <span className="font-mono text-white">${platformAdminFee}</span>
              </div>

              {/* Item 3 */}
              <div className="flex justify-between items-center text-gray-350 pt-3.5">
                <span>Gov. Service Taxes (8%)</span>
                <span className="font-mono text-white">${govServiceTax}</span>
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-gray-800/80 space-y-4">
            {/* Grand Total */}
            <div className="flex justify-between items-center font-bold text-gray-100">
              <span className="text-xs uppercase tracking-wider">Escrow Grand Total</span>
              <span className="text-2xl font-black text-emerald-400">${invoiceTotal}</span>
            </div>

            {/* Security stamp badge */}
            <div className="p-3 bg-gray-800 rounded-2xl flex items-start space-x-2.5 text-[10px] text-gray-400">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                UrbanServe Shield ensures checkout payments are stored safely dynamically. Specialists receive compensations only after client completion clicks.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
