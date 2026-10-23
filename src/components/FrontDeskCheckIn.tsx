import React, { useState } from 'react';
import {
  DoorOpen,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Printer,
  Sparkles,
  Key,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { Room, Reservation, HotelSettings } from '../types/hotel';
import { StorageService } from '../services/storage';

interface FrontDeskCheckInProps {
  rooms: Room[];
  reservations: Reservation[];
  settings: HotelSettings;
  onRefreshData: () => void;
  onViewInvoice: (reservation: Reservation) => void;
}

export const FrontDeskCheckIn: React.FC<FrontDeskCheckInProps> = ({
  rooms,
  reservations,
  settings,
  onRefreshData,
  onViewInvoice,
}) => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'checkout'>('checkin');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResForCheckIn, setSelectedResForCheckIn] = useState<Reservation | null>(null);
  const [selectedResForCheckOut, setSelectedResForCheckOut] = useState<Reservation | null>(null);
  const [incidentalFee, setIncidentalFee] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'cash' | 'bank_transfer'>('credit_card');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Eligible for check in: confirmed or pending, not cancelled or checked_in or checked_out
  const checkInCandidates = reservations.filter((r) => {
    if (r.status !== 'confirmed' && r.status !== 'pending') return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.guestName.toLowerCase().includes(q) ||
      r.bookingReference.toLowerCase().includes(q) ||
      r.guestEmail.toLowerCase().includes(q)
    );
  });

  // Eligible for check out: currently checked_in
  const checkOutCandidates = reservations.filter((r) => {
    if (r.status !== 'checked_in') return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.guestName.toLowerCase().includes(q) ||
      r.bookingReference.toLowerCase().includes(q) ||
      r.guestEmail.toLowerCase().includes(q)
    );
  });

  const handlePerformCheckIn = (res: Reservation) => {
    setMessage('');
    setErrorMessage('');

    const result = StorageService.checkInGuest(res.id);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to check in guest.');
      return;
    }

    setMessage(`Guest ${res.guestName} successfully checked in! Keycard activated for Room.`);
    setSelectedResForCheckIn(null);
    onRefreshData();
  };

  const handlePerformCheckOut = (res: Reservation) => {
    setMessage('');
    setErrorMessage('');

    const result = StorageService.checkOutGuest(res.id, Number(incidentalFee), paymentMethod);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to check out guest.');
      return;
    }

    setMessage(`Departure complete for ${res.guestName}. Room marked DIRTY and sent to housekeeping queue.`);
    setSelectedResForCheckOut(null);
    setIncidentalFee(0);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Front Desk Operations
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Arrivals & Departures Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Validate guest credentials, assign rooms, process keycards, settle incidental charges, and trigger housekeeping status updates.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('checkin');
              setMessage('');
              setErrorMessage('');
            }}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'checkin'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Arrivals Check-In ({checkInCandidates.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('checkout');
              setMessage('');
              setErrorMessage('');
            }}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'checkout'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            In-House Check-Out ({checkOutCandidates.length})
          </button>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Guest Name, Booking Reference (e.g. HP-94812-A), or Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs text-slate-900 bg-transparent focus:outline-hidden"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* TAB 1: ARRIVALS CHECK-IN */}
      {activeTab === 'checkin' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {checkInCandidates.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
                <DoorOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-900">No arrivals pending check-in</h3>
                <p className="text-xs text-slate-500 mt-1">
                  All expected guests are either checked in or no bookings match the search filter.
                </p>
              </div>
            ) : (
              checkInCandidates.map((res) => {
                const room = rooms.find((r) => r.id === res.roomId);
                const isRoomClean = room?.housekeepingStatus === 'clean' || room?.housekeepingStatus === 'inspected';
                const isMaintenanceBlocked = room?.maintenanceStatus === 'under_maintenance';

                return (
                  <div
                    key={res.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {res.bookingReference}
                        </span>
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Expected {res.checkInDate}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-1">{res.guestName}</h3>
                      <p className="text-xs text-slate-500 mb-3">{res.guestEmail} · {res.guestPhone}</p>

                      {/* Room Status Pill */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs mb-4">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Assigned Room</span>
                          <span className="font-bold text-slate-900">Room {room?.roomNumber} ({room?.type})</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Room Cleanliness</span>
                          <span
                            className={`font-semibold capitalize text-[11px] ${
                              isRoomClean ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {room?.housekeepingStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total Balance</span>
                          <span className="font-mono font-bold text-slate-900">${res.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Warning if room is dirty */}
                      {!isRoomClean && (
                        <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Room is {room?.housekeepingStatus}. Housekeeping inspection required before check-in.</span>
                        </div>
                      )}

                      {isMaintenanceBlocked && (
                        <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Room under maintenance! Cannot check in.</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onViewInvoice(res)}
                        className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 underline cursor-pointer"
                      >
                        Voucher
                      </button>

                      <button
                        onClick={() => handlePerformCheckIn(res)}
                        disabled={!isRoomClean || isMaintenanceBlocked}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          isRoomClean && !isMaintenanceBlocked
                            ? 'bg-slate-900 hover:bg-slate-800 text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        Confirm Check-In
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: IN-HOUSE CHECK-OUT */}
      {activeTab === 'checkout' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {checkOutCandidates.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
                <DoorOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-900">No guests currently in-house</h3>
                <p className="text-xs text-slate-500 mt-1">
                  There are no active checked-in guests matching the search filter.
                </p>
              </div>
            ) : (
              checkOutCandidates.map((res) => {
                const room = rooms.find((r) => r.id === res.roomId);
                const isSelected = selectedResForCheckOut?.id === res.id;

                return (
                  <div
                    key={res.id}
                    className={`p-5 bg-white rounded-2xl border transition-all shadow-xs flex flex-col justify-between ${
                      isSelected ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {res.bookingReference}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          In-House (Since {res.checkInDate})
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-1">{res.guestName}</h3>
                      <p className="text-xs text-slate-500 mb-3">{res.guestEmail}</p>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs mb-4">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Room</span>
                          <span className="font-bold text-slate-900">Room {room?.roomNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Departure Due</span>
                          <span className="font-semibold text-slate-700">{res.checkOutDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Paid Amount</span>
                          <span className="font-mono tabular-nums text-emerald-600">${res.paidAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* If selected for settlement, show incidental input */}
                      {isSelected && (
                        <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-3 mb-4">
                          <div className="font-bold text-slate-900">Check-out Settlement</div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">
                              Additional Incidentals (Minibar, Room Service, Late Checkout)
                            </label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-slate-500 font-mono">$</span>
                              <input
                                type="number"
                                min={0}
                                step={5}
                                value={incidentalFee}
                                onChange={(e) => setIncidentalFee(Number(e.target.value))}
                                className="w-full pl-6 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">
                              Payment Method for Balance
                            </label>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value as any)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                            >
                              <option value="credit_card">Credit Card (POS Terminal)</option>
                              <option value="cash">Cash / Reception Desk</option>
                              <option value="bank_transfer">Direct Bank Transfer</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onViewInvoice(res)}
                        className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 underline cursor-pointer"
                      >
                        Invoice
                      </button>

                      {isSelected ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedResForCheckOut(null)}
                            className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handlePerformCheckOut(res)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                          >
                            Complete Check-Out
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedResForCheckOut(res);
                            setIncidentalFee(0);
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          Process Departure
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
