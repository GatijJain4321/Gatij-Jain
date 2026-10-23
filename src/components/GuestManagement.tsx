import React, { useState } from 'react';
import {
  Users,
  Search,
  Calendar,
  CreditCard,
  FileText,
  Lock,
  Plus,
  Mail,
  Phone,
  Globe,
  Edit,
  CheckCircle2,
  X
} from 'lucide-react';
import { Guest, Reservation, PaymentTransaction } from '../types/hotel';
import { StorageService } from '../services/storage';

interface GuestManagementProps {
  guests: Guest[];
  reservations: Reservation[];
  payments: PaymentTransaction[];
  onRefreshData: () => void;
}

export const GuestManagement: React.FC<GuestManagementProps> = ({
  guests,
  reservations,
  payments,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [staffNotesText, setStaffNotesText] = useState('');
  const [message, setMessage] = useState('');

  const filteredGuests = guests.filter((g) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.fullName.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.phone.toLowerCase().includes(q) ||
      g.id.toLowerCase().includes(q)
    );
  });

  const openGuestDetail = (guest: Guest) => {
    setSelectedGuest(guest);
    setStaffNotesText(guest.staffNotes || '');
    setEditingNotes(false);
  };

  const handleSaveNotes = () => {
    if (!selectedGuest) return;
    StorageService.updateGuest(selectedGuest.id, { staffNotes: staffNotesText });
    setMessage('Staff confidential notes updated.');
    setEditingNotes(false);
    onRefreshData();
    setTimeout(() => setMessage(''), 3000);
  };

  // Calculations for selected guest
  const guestReservations = selectedGuest
    ? reservations.filter((r) => r.guestEmail.toLowerCase() === selectedGuest.email.toLowerCase())
    : [];

  const guestSpend = guestReservations.reduce((sum, r) => sum + r.paidAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Guest Relationship CRM
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Guest Directory & Profiles
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search guest history, manage confidential VIP preferences, lifetime bookings, and contact details.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Guest Name, Email, Phone, or ID..."
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

      {/* Guest Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuests.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">No guests match the search</h3>
          </div>
        ) : (
          filteredGuests.map((guest) => {
            const guestResCount = reservations.filter(
              (r) => r.guestEmail.toLowerCase() === guest.email.toLowerCase()
            ).length;

            return (
              <div
                key={guest.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center font-display text-sm">
                      {guest.fullName[0]}
                    </div>
                    <span className="text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {guestResCount} {guestResCount === 1 ? 'stay' : 'stays'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{guest.fullName}</h3>
                  <div className="space-y-1 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{guest.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{guest.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{guest.city ? `${guest.city}, ` : ''}{guest.country}</span>
                    </div>
                  </div>

                  {guest.specialRequests && (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 line-clamp-2">
                      <span className="font-semibold text-slate-800">Preferences: </span>
                      {guest.specialRequests}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400">ID: {guest.id}</span>
                  <button
                    onClick={() => openGuestDetail(guest)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    View Profile & Folio
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Guest Detail & Folio Modal */}
      {selectedGuest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center font-display">
                  {selectedGuest.fullName[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900">
                    {selectedGuest.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedGuest.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedGuest(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500">Lifetime Stays</span>
                <div className="text-lg font-bold font-mono text-slate-900">{guestReservations.length}</div>
              </div>
              <div>
                <span className="text-slate-500">Total Spent</span>
                <div className="text-lg font-bold font-mono text-emerald-700">${guestSpend.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-slate-500">Country</span>
                <div className="text-lg font-bold text-slate-900 truncate">{selectedGuest.country}</div>
              </div>
            </div>

            {/* Confidential Staff Notes */}
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Confidential Staff Notes (Internal Only)</span>
                </div>
                {!editingNotes ? (
                  <button
                    onClick={() => setEditingNotes(true)}
                    className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={handleSaveNotes}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold cursor-pointer"
                  >
                    Save
                  </button>
                )}
              </div>

              {editingNotes ? (
                <textarea
                  value={staffNotesText}
                  onChange={(e) => setStaffNotesText(e.target.value)}
                  rows={3}
                  className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs"
                />
              ) : (
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  {selectedGuest.staffNotes || 'No internal notes on file for this guest.'}
                </p>
              )}
            </div>

            {/* Stay History Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Reservation History
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Reference</th>
                      <th className="py-2.5 px-3">Stay Dates</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {guestReservations.map((res) => (
                      <tr key={res.id}>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{res.bookingReference}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{res.checkInDate} → {res.checkOutDate}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">${res.totalAmount.toFixed(2)}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="capitalize font-semibold text-[10px] px-2 py-0.5 rounded bg-slate-100">
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedGuest(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
