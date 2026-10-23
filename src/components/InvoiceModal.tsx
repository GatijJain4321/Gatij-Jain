import React from 'react';
import {
  X,
  Printer,
  Hotel,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  BedDouble
} from 'lucide-react';
import { Reservation, Room, HotelSettings } from '../types/hotel';

interface InvoiceModalProps {
  reservation: Reservation | null;
  room: Room | null;
  settings: HotelSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  reservation,
  room,
  settings,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !reservation) return null;

  const isPaid = reservation.paymentStatus === 'paid';
  const remaining = Math.max(0, reservation.totalAmount - reservation.paidAmount);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col my-8">
        {/* Modal Top Bar (hidden on print) */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hotel className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold font-display">
              Folio Invoice · {reservation.bookingReference}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document */}
        <div className="p-8 space-y-6 text-slate-800 bg-white">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 font-bold flex items-center justify-center font-display text-sm">
                  HP
                </div>
                <h1 className="text-xl font-bold font-display text-slate-900">
                  {settings.hotelName}
                </h1>
              </div>
              <p className="text-xs text-slate-500">{settings.tagline}</p>
              <p className="text-xs text-slate-500 mt-1">{settings.address}</p>
              <p className="text-xs text-slate-500">{settings.phone} · {settings.email}</p>
            </div>

            <div className="text-right sm:text-right">
              <div className="text-xs uppercase font-semibold text-slate-500">Official Guest Folio</div>
              <div className="text-xl font-bold font-mono tracking-wider text-slate-900 mt-0.5">
                {reservation.bookingReference}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Date: {new Date().toLocaleDateString()}
              </div>
              <div className="mt-2">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md border border-emerald-300 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    PAID IN FULL
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-md border border-amber-300 uppercase tracking-wider">
                    BALANCE DUE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Guest and Stay Details */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl text-xs">
            <div>
              <div className="font-bold text-slate-900 uppercase text-[11px] text-slate-500 mb-1">
                Billed To
              </div>
              <div className="text-sm font-bold text-slate-900">{reservation.guestName}</div>
              <div className="text-slate-600">{reservation.guestEmail}</div>
              <div className="text-slate-600">{reservation.guestPhone}</div>
            </div>

            <div>
              <div className="font-bold text-slate-900 uppercase text-[11px] text-slate-500 mb-1">
                Stay Schedule
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Check-in:</span>
                <span className="font-mono font-semibold">{reservation.checkInDate} (15:00)</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Check-out:</span>
                <span className="font-mono font-semibold">{reservation.checkOutDate} (11:00)</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Duration:</span>
                <span className="font-semibold">{reservation.nights} nights · Room {room?.roomNumber || '—'}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-center">Nights / Qty</th>
                  <th className="py-2.5 px-4 text-right">Rate</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    Room Accommodation: {room?.type || 'Deluxe Suite'} (Room {room?.roomNumber || '—'})
                  </td>
                  <td className="py-3 px-4 text-center font-mono">{reservation.nights}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">${reservation.roomRate.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">${reservation.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-600">
                    Turnover Sanitation & Cleaning Fee
                  </td>
                  <td className="py-3 px-4 text-center font-mono">1</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">${reservation.cleaningFee.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">${reservation.cleaningFee.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-600">
                    Hotel Municipal & State Occupancy Tax ({settings.taxRatePercent}%)
                  </td>
                  <td className="py-3 px-4 text-center font-mono">—</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">—</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">${reservation.taxAmount.toFixed(2)}</td>
                </tr>
                {reservation.discountAmount > 0 && (
                  <tr className="text-emerald-700 font-medium">
                    <td className="py-3 px-4">
                      Promotional Discount Applied
                    </td>
                    <td className="py-3 px-4 text-center font-mono">—</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">—</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">-${reservation.discountAmount.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">${reservation.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Fees</span>
                <span className="font-mono tabular-nums">${(reservation.taxAmount + reservation.cleaningFee).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Folio</span>
                <span className="font-mono tabular-nums">${reservation.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                <span>Amount Paid</span>
                <span className="font-mono tabular-nums">-${reservation.paidAmount.toFixed(2)}</span>
              </div>
              <div className="pt-1 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-900">
                <span>Balance Due</span>
                <span className="font-mono tabular-nums">${remaining.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-slate-200 text-center text-[11px] text-slate-400 space-y-1">
            <p>Thank you for staying at {settings.hotelName}. We look forward to welcoming you back.</p>
            <p>For inquiries or adjustments, contact concierge at {settings.email} or call {settings.phone}.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
