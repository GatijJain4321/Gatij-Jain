import React, { useState } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Plus,
  Printer,
  XCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Reservation, Room, HotelSettings } from '../types/hotel';
import { StorageService } from '../services/storage';

interface ReservationManagementProps {
  reservations: Reservation[];
  rooms: Room[];
  settings: HotelSettings;
  onRefreshData: () => void;
  onOpenBookingModal: () => void;
  onViewInvoice: (reservation: Reservation) => void;
}

export const ReservationManagement: React.FC<ReservationManagementProps> = ({
  reservations,
  rooms,
  settings,
  onRefreshData,
  onOpenBookingModal,
  onViewInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [cancelModalRes, setCancelModalRes] = useState<Reservation | null>(null);
  const [cancelReason, setCancelReason] = useState('Guest requested schedule change');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const filteredReservations = reservations.filter((res) => {
    if (statusFilter !== 'all' && res.status !== statusFilter) return false;
    if (dateFilter && res.checkInDate !== dateFilter && res.checkOutDate !== dateFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRef = res.bookingReference.toLowerCase().includes(q);
      const matchName = res.guestName.toLowerCase().includes(q);
      const matchEmail = res.guestEmail.toLowerCase().includes(q);
      if (!matchRef && !matchName && !matchEmail) return false;
    }
    return true;
  });

  const handleConfirmCancel = () => {
    if (!cancelModalRes) return;
    setErrorMessage('');
    setMessage('');

    const res = StorageService.cancelReservation(cancelModalRes.id, cancelReason);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to cancel reservation.');
      return;
    }

    setMessage(`Booking ${cancelModalRes.bookingReference} has been cancelled.`);
    setCancelModalRes(null);
    onRefreshData();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Confirmed</span>;
      case 'checked_in':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Checked In</span>;
      case 'checked_out':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Checked Out</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Booking Engine & Folio Ledger
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Reservations Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View all confirmed, in-house, past, and cancelled guest reservations.
          </p>
        </div>

        <button
          onClick={onOpenBookingModal}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          Create New Reservation
        </button>
      </div>

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

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by Reference, Guest Name, or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-900 bg-transparent focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          {/* Status buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {['all', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium cursor-pointer transition-colors ${
                  statusFilter === st ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-1 text-slate-500">
            <span>Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-[11px] text-slate-400 hover:text-slate-700 underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Guest Details</th>
                <th className="py-3.5 px-4">Room</th>
                <th className="py-3.5 px-4">Stay Dates</th>
                <th className="py-3.5 px-4">Guests</th>
                <th className="py-3.5 px-4 text-right">Total Cost</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No reservations found matching the current search criteria.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => {
                  const room = rooms.find((r) => r.id === res.roomId);

                  return (
                    <tr key={res.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {res.bookingReference}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{res.guestName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{res.guestEmail}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">Room {room?.roomNumber || '—'}</div>
                        <div className="text-[11px] text-slate-500">{room?.type || 'Suite'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700">
                        <div>{res.checkInDate} → {res.checkOutDate}</div>
                        <div className="text-[11px] text-slate-400">{res.nights} {res.nights === 1 ? 'night' : 'nights'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {res.adults} Adults{res.children > 0 ? `, ${res.children} Kids` : ''}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                        ${res.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(res.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onViewInvoice(res)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer"
                            title="View printable invoice & voucher"
                          >
                            Invoice
                          </button>

                          {res.status === 'confirmed' && (
                            <button
                              onClick={() => setCancelModalRes(res)}
                              className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Cancel reservation"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalRes && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <XCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">
                Cancel Reservation {cancelModalRes.bookingReference}?
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel the booking for <span className="font-semibold text-slate-900">{cancelModalRes.guestName}</span> ({cancelModalRes.checkInDate} to {cancelModalRes.checkOutDate})?
              This will release Room for other guests.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cancellation Reason</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelModalRes(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
