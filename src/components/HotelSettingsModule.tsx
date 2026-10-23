import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Building,
  DollarSign,
  Save,
  FileText
} from 'lucide-react';
import { HotelSettings, AuditLog } from '../types/hotel';
import { StorageService } from '../services/storage';

interface HotelSettingsModuleProps {
  settings: HotelSettings;
  auditLogs: AuditLog[];
  onRefreshData: () => void;
}

export const HotelSettingsModule: React.FC<HotelSettingsModuleProps> = ({
  settings,
  auditLogs,
  onRefreshData,
}) => {
  const [hotelName, setHotelName] = useState(settings.hotelName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [email, setEmail] = useState(settings.email);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [taxRatePercent, setTaxRatePercent] = useState(settings.taxRatePercent);
  const [cleaningFee, setCleaningFee] = useState(settings.cleaningFee);
  const [checkInTime, setCheckInTime] = useState(settings.checkInTime);
  const [checkOutTime, setCheckOutTime] = useState(settings.checkOutTime);
  const [cancellationPolicy, setCancellationPolicy] = useState(settings.cancellationPolicy);
  const [message, setMessage] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateSettings({
      hotelName,
      tagline,
      email,
      phone,
      address,
      taxRatePercent: Number(taxRatePercent),
      cleaningFee: Number(cleaningFee),
      checkInTime,
      checkOutTime,
      cancellationPolicy,
    });
    setMessage('Hotel operational settings updated successfully.');
    onRefreshData();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleResetToSeed = () => {
    if (window.confirm('Reset all rooms, bookings, guests, and payments to factory demonstration seed data?')) {
      StorageService.resetToDefaults();
      setMessage('Hotel database restored to original seed records.');
      onRefreshData();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
            System Administration
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Hotel Configuration & Audit Log
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure property brand attributes, tax calculations, daily check-in windows, and review immutable audit logs.
          </p>
        </div>

        <button
          onClick={handleResetToSeed}
          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Factory Demo Data
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <h2 className="text-base font-bold font-display text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-600" />
            Property Identity & Contact Info
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hotel Property Name</label>
              <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline / Subtitle</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Central Reception Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Concierge Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
              />
            </div>
          </div>

          <h2 className="text-base font-bold font-display text-slate-900 pt-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Financial Rates, Fees & Timings
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                step={0.5}
                min={0}
                max={30}
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Turnover Cleaning Fee ($)</label>
              <input
                type="number"
                step={5}
                min={0}
                value={cleaningFee}
                onChange={(e) => setCleaningFee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Check-in Window</label>
              <input
                type="text"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                placeholder="15:00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Check-out Deadline</label>
              <input
                type="text"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                placeholder="11:00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-medium"
              />
            </div>

            <div className="col-span-full">
              <label className="block font-semibold text-slate-700 mb-1">Cancellation Policy</label>
              <textarea
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4 text-amber-400" />
              Save Operational Settings
            </button>
          </div>
        </form>
      </div>

      {/* Security Audit Trail Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              Security Audit Logs
            </h2>
            <p className="text-xs text-slate-500">Immutable chronological activity tracking</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{auditLogs.length} logged entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action Event</th>
                <th className="py-2.5 px-3">Actor & Role</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.slice(0, 15).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/75">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-[11px]">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-900">{log.actorEmail}</span>{' '}
                    <span className="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
