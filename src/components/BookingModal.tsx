import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Users,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Sparkles,
  BedDouble,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Room, Reservation, HotelSettings } from '../types/hotel';
import { StorageService } from '../services/storage';

interface BookingModalProps {
  room: Room | null;
  rooms: Room[];
  settings: HotelSettings;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (reservation: Reservation) => void;
  initialDates?: { checkIn: string; checkOut: string; adults: number; children: number };
}

export const BookingModal: React.FC<BookingModalProps> = ({
  room: initialRoom,
  rooms,
  settings,
  isOpen,
  onClose,
  onBookingSuccess,
  initialDates,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(initialRoom || (rooms.length > 0 ? rooms[0] : null));
  const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details');

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultCheckoutStr = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState(initialDates?.checkIn || todayStr);
  const [checkOutDate, setCheckOutDate] = useState(initialDates?.checkOut || defaultCheckoutStr);
  const [adults, setAdults] = useState(initialDates?.adults || 2);
  const [children, setChildren] = useState(initialDates?.children || 0);

  // Guest details
  const [guestName, setGuestName] = useState('Clara Oswald');
  const [guestEmail, setGuestEmail] = useState('clara.oswald@example.com');
  const [guestPhone, setGuestPhone] = useState('+1 (555) 321-7788');
  const [guestCountry, setGuestCountry] = useState('United States');
  const [specialRequests, setSpecialRequests] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Stripe test payment details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    if (initialRoom) {
      setSelectedRoom(initialRoom);
    } else if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0]);
    }
  }, [initialRoom, rooms]);

  if (!isOpen) return null;

  // Calculate nights
  const dIn = new Date(checkInDate);
  const dOut = new Date(checkOutDate);
  const nights = Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24)));

  const roomRate = selectedRoom?.pricePerNight || 200;
  const subtotal = roomRate * nights;
  const taxAmount = Number(((subtotal * settings.taxRatePercent) / 100).toFixed(2));
  const cleaningFee = settings.cleaningFee;
  const totalAmount = Number((subtotal + taxAmount + cleaningFee - discountAmount).toFixed(2));

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'HOTELPRO50') {
      setDiscountAmount(50);
      setErrorMessage('');
    } else if (promoCode.trim().toUpperCase() === 'WELCOME10') {
      setDiscountAmount(Number((subtotal * 0.1).toFixed(2)));
      setErrorMessage('');
    } else {
      setErrorMessage('Invalid promotion code. Try HOTELPRO50 or WELCOME10.');
    }
  };

  const handleFillTestCard = () => {
    setCardNumber('4242 •••• •••• 4242');
    setCardExpiry('12/28');
    setCardCvc('884');
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedRoom) {
      setErrorMessage('Please select a room.');
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setErrorMessage('Check-out date must be after check-in date.');
      return;
    }

    const totalGuests = Number(adults) + Number(children);
    if (totalGuests > selectedRoom.maxGuests) {
      setErrorMessage(`Total guests (${totalGuests}) exceeds room capacity of ${selectedRoom.maxGuests}.`);
      return;
    }

    // Check availability
    const isAvail = StorageService.isRoomAvailable(selectedRoom.id, checkInDate, checkOutDate);
    if (!isAvail) {
      setErrorMessage(`Room ${selectedRoom.roomNumber} is unavailable for these dates. Please choose another room or date.`);
      return;
    }

    setStep('payment');
  };

  const handleCompletePaymentAndBook = () => {
    if (!selectedRoom) return;
    setIsProcessingPayment(true);
    setErrorMessage('');

    // Simulate Stripe Payment processing delay
    setTimeout(() => {
      const result = StorageService.createReservation({
        roomId: selectedRoom.id,
        guestName,
        guestEmail,
        guestPhone,
        guestCountry,
        checkInDate,
        checkOutDate,
        adults: Number(adults),
        children: Number(children),
        specialRequests,
        discountAmount,
        paymentMethod: 'stripe',
        simulatePaymentSuccess: true,
      });

      setIsProcessingPayment(false);

      if (!result.success || !result.reservation) {
        setErrorMessage(result.error || 'Failed to complete reservation.');
        return;
      }

      setCreatedReservation(result.reservation);
      setStep('confirmed');
      onBookingSuccess(result.reservation);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold font-display leading-tight">
                {step === 'details' && 'Reserve Your Stay'}
                {step === 'payment' && 'Confirm & Secure Payment'}
                {step === 'confirmed' && 'Reservation Confirmed!'}
              </h2>
              <p className="text-xs text-slate-300">The Grand Luminaire · HotelPro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span className={step === 'details' ? 'text-amber-700 font-bold' : ''}>1. Dates & Guest Info</span>
          <span>→</span>
          <span className={step === 'payment' ? 'text-amber-700 font-bold' : ''}>2. Payment (Stripe Test Mode)</span>
          <span>→</span>
          <span className={step === 'confirmed' ? 'text-emerald-700 font-bold' : ''}>3. Confirmation</span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              {/* Room Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Room
                </label>
                <select
                  value={selectedRoom?.id || ''}
                  onChange={(e) => {
                    const r = rooms.find((rm) => rm.id === e.target.value);
                    if (r) setSelectedRoom(r);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                >
                  {rooms.map((rm) => (
                    <option key={rm.id} value={rm.id} disabled={rm.maintenanceStatus === 'under_maintenance'}>
                      Room {rm.roomNumber} - {rm.type} ({rm.bedType}) - ${rm.pricePerNight}/night {rm.maintenanceStatus === 'under_maintenance' ? '[Under Maintenance]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates & Guests Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    min={checkInDate}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Adults
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Adult' : 'Adults'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Children
                  </label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  >
                    {[0, 1, 2, 3].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Child' : 'Children'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guest Information */}
              <div className="pt-2 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Guest Contact Details
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                      placeholder="e.g. Eleanor Vance"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        required
                        placeholder="guest@example.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        required
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Country / Nationality</label>
                    <input
                      type="text"
                      value={guestCountry}
                      onChange={(e) => setGuestCountry(e.target.value)}
                      placeholder="United States"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Special Requests (Optional)</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={2}
                      placeholder="Quiet floor, late arrival, dietary preferences..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Price Estimation Bar */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5">
                  <span>${roomRate} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                  <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5">
                  <span>Estimated Hotel Tax ({settings.taxRatePercent}%)</span>
                  <span className="font-mono tabular-nums">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600 mb-2">
                  <span>Housekeeping Cleaning Fee</span>
                  <span className="font-mono tabular-nums">${cleaningFee.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-xs text-emerald-600 font-semibold mb-2">
                    <span>Discount Applied</span>
                    <span className="font-mono tabular-nums">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Total Estimated Cost</span>
                  <span className="font-mono tabular-nums text-lg text-amber-700">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  Continue to Payment
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              {/* Order Summary Pill */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Room {selectedRoom?.roomNumber} · {selectedRoom?.type}
                  </div>
                  <div className="text-xs text-slate-500">
                    {checkInDate} to {checkOutDate} ({nights} nights · {adults} adults)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase">Total Due</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                    ${totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. HOTELPRO50)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs flex-1 uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {/* Stripe Test Mode Card Form */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900">Credit / Debit Card</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-800 text-[11px] font-bold rounded-md border border-amber-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    Stripe Test Mode
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Fast test fill:</span>
                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                  >
                    Use Sample Test Card
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Expiration</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">CVC Security Code</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-normal">
                  HotelPro uses Stripe Test Mode for evaluation. No real charges are processed. Transactions are recorded idempotently in the local database.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCompletePaymentAndBook}
                  disabled={isProcessingPayment}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isProcessingPayment ? 'Authorizing Payment...' : `Pay $${totalAmount.toFixed(2)} & Confirm`}
                </button>
              </div>
            </div>
          )}

          {step === 'confirmed' && createdReservation && (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-bold font-display text-slate-900">
                  Reservation Confirmed
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Thank you, {createdReservation.guestName}. Your stay has been successfully reserved.
                </p>
              </div>

              {/* Booking Reference Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto text-center">
                <div className="text-xs uppercase font-semibold text-slate-500">Booking Reference</div>
                <div className="text-2xl font-bold font-mono tracking-wider text-slate-900 mt-0.5">
                  {createdReservation.bookingReference}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  A confirmation email was dispatched to{' '}
                  <span className="font-semibold text-slate-800">{createdReservation.guestEmail}</span>
                </div>
              </div>

              {/* Stay Summary */}
              <div className="max-w-md mx-auto p-4 bg-white rounded-xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Room</span>
                  <span className="font-semibold text-slate-900">Room {selectedRoom?.roomNumber} ({selectedRoom?.type})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dates</span>
                  <span className="font-semibold text-slate-900">{createdReservation.checkInDate} to {createdReservation.checkOutDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nights</span>
                  <span className="font-semibold text-slate-900">{createdReservation.nights} nights</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status</span>
                  <span className="font-semibold text-emerald-600 uppercase">Paid in Full (${createdReservation.totalAmount})</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  Print Voucher
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
