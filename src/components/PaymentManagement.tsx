import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Printer,
  ShieldCheck,
  ArrowDownLeft,
  Calendar,
  Layers
} from 'lucide-react';
import { PaymentTransaction, HotelSettings, Reservation } from '../types/hotel';
import { StorageService } from '../services/storage';

interface PaymentManagementProps {
  payments: PaymentTransaction[];
  reservations: Reservation[];
  settings: HotelSettings;
  onRefreshData: () => void;
  onViewInvoice: (reservation: Reservation) => void;
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({
  payments,
  reservations,
  settings,
  onRefreshData,
  onViewInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<PaymentTransaction | null>(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const totalCollected = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.status === 'refunded')
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter((p) => {
    if (methodFilter !== 'all' && p.method !== methodFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRef = p.transactionRef.toLowerCase().includes(q);
      const matchBook = p.bookingReference.toLowerCase().includes(q);
      const matchGuest = p.guestName.toLowerCase().includes(q);
      if (!matchRef && !matchBook && !matchGuest) return false;
    }
    return true;
  });

  const handleRefund = (tx: PaymentTransaction) => {
    if (!window.confirm(`Issue refund of $${tx.amount.toFixed(2)} for ${tx.bookingReference}?`)) return;
    setMessage('');
    setErrorMessage('');

    const res = StorageService.refundPayment(tx.id);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to refund transaction.');
      return;
    }

    setMessage(`Transaction ${tx.transactionRef} marked refunded.`);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Treasury & Merchant Ledger
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Payment Transactions & Invoices
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit credit card authorizations, cash settlements, wire deposits, and refund lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>PCI-DSS & Stripe Test Mode Verified</span>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Total Settled Revenue
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{payments.filter((p) => p.status === 'paid').length} successful transactions</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Total Processed Refunds
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-600">
            ${totalRefunded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{payments.filter((p) => p.status === 'refunded').length} reversal records</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Standard Tax Rate
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-800">
            {settings.taxRatePercent}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Configured in hotel settings</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by Transaction Ref, Booking Ref, or Guest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-900 bg-transparent focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-semibold">Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
          >
            <option value="all">All Methods</option>
            <option value="credit_card">Credit Card (Stripe/POS)</option>
            <option value="stripe">Online Stripe</option>
            <option value="cash">Front Desk Cash</option>
            <option value="bank_transfer">Wire Transfer</option>
          </select>
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Transaction Ref</th>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Guest</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => {
                const linkedRes = reservations.find((r) => r.id === p.reservationId);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {p.transactionRef}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {p.bookingReference}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {p.guestName}
                    </td>
                    <td className="py-3.5 px-4 capitalize">
                      {p.method.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 tabular-nums">
                      {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`capitalize px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          p.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {linkedRes && (
                          <button
                            onClick={() => onViewInvoice(linkedRes)}
                            className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 underline cursor-pointer"
                          >
                            Invoice
                          </button>
                        )}
                        {p.status === 'paid' && (
                          <button
                            onClick={() => handleRefund(p)}
                            className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
