import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  DollarSign,
  BedDouble,
  PieChart as PieIcon,
  Percent,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Room, Reservation, PaymentTransaction, HotelSettings } from '../types/hotel';

interface ReportsAnalyticsProps {
  rooms: Room[];
  reservations: Reservation[];
  payments: PaymentTransaction[];
  settings: HotelSettings;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  rooms,
  reservations,
  payments,
  settings,
}) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const totalRooms = rooms.length || 1;
  const totalBookings = reservations.length;
  const completedBookings = reservations.filter((r) => r.status === 'checked_out' || r.status === 'checked_in');
  const cancelledBookings = reservations.filter((r) => r.status === 'cancelled').length;

  const cancellationRate = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : '0';

  const totalCollectedRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.status === 'refunded')
    .reduce((sum, p) => sum + p.amount, 0);

  const netRevenue = Math.max(0, totalCollectedRevenue - totalRefunded);

  // Industry KPIs: ADR (Average Daily Rate) & RevPAR (Revenue Per Available Room)
  const totalNightsSold = completedBookings.reduce((sum, r) => sum + r.nights, 0) || 1;
  const roomRevenueOnly = completedBookings.reduce((sum, r) => sum + r.subtotal, 0);
  const adr = Number((roomRevenueOnly / totalNightsSold).toFixed(2));
  const occupiedRooms = rooms.filter((r) => r.availabilityStatus === 'occupied').length;
  const currentOccupancyPercent = Math.round((occupiedRooms / totalRooms) * 100);
  const revpar = Number(((adr * currentOccupancyPercent) / 100).toFixed(2));

  // Multi-period financial graph data
  const weeklyData = [
    { label: 'Week 1', revenue: 6400, occupancy: 72, bookings: 14 },
    { label: 'Week 2', revenue: 7850, occupancy: 81, bookings: 18 },
    { label: 'Week 3', revenue: 8900, occupancy: 88, bookings: 21 },
    { label: 'Week 4', revenue: 10450, occupancy: 94, bookings: 25 },
  ];

  const handleExportCSV = () => {
    const headers = ['Booking Reference', 'Guest Name', 'Email', 'Check In', 'Check Out', 'Nights', 'Total Amount', 'Status', 'Payment Status'];
    const rows = reservations.map((r) => [
      r.bookingReference,
      `"${r.guestName.replace(/"/g, '""')}"`,
      r.guestEmail,
      r.checkInDate,
      r.checkOutDate,
      r.nights,
      r.totalAmount.toFixed(2),
      r.status,
      r.paymentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hotelpro_financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Executive Intelligence
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Financial & Occupancy Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Key hospitality metrics: RevPAR, ADR, occupancy percentages, cancellation ratios, and accounting ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Print Report
          </button>
        </div>
      </div>

      {/* 4 Essential Hospitality Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* RevPAR */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            RevPAR (Rev / Avail Room)
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
            ${revpar}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">ADR × Occupancy %</div>
        </div>

        {/* ADR */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            ADR (Average Daily Rate)
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-amber-700">
            ${adr}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Room revenue / nights sold</div>
        </div>

        {/* Net Revenue */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Net Collected Revenue
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-emerald-700">
            ${netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">After deducting refunds</div>
        </div>

        {/* Cancellation Rate */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Cancellation Ratio
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
            {cancellationRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{cancelledBookings} cancelled of {totalBookings} total</div>
        </div>
      </div>

      {/* Interactive Trend Chart */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Revenue Growth vs. Average Occupancy
            </h3>
            <p className="text-xs text-slate-500">Historical performance cadence</p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1 rounded font-medium cursor-pointer ${
                timeframe === 'daily' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1 rounded font-medium cursor-pointer ${
                timeframe === 'weekly' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1 rounded font-medium cursor-pointer ${
                timeframe === 'monthly' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `${val}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="#0f172a" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="right" dataKey="occupancy" name="Occupancy (%)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Room Category Breakdown Table */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 font-display mb-4">
          Room Category Performance Summary
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-center">Total Rooms</th>
                <th className="py-3 px-3 text-center">Avg Price / Night</th>
                <th className="py-3 px-3 text-center">Occupied</th>
                <th className="py-3 px-3 text-right">Estimated Potential</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {['Standard', 'Deluxe', 'Suite', 'Family', 'Executive'].map((cat) => {
                const catRooms = rooms.filter((r) => r.type === cat);
                const count = catRooms.length;
                const avgPrice = count > 0 ? Math.round(catRooms.reduce((sum, r) => sum + r.pricePerNight, 0) / count) : 0;
                const occ = catRooms.filter((r) => r.availabilityStatus === 'occupied').length;
                const potentialMonthly = avgPrice * count * 30;

                return (
                  <tr key={cat} className="hover:bg-slate-50/75">
                    <td className="py-3 px-3 font-bold text-slate-900">{cat}</td>
                    <td className="py-3 px-3 text-center font-mono">{count}</td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums font-semibold">${avgPrice}</td>
                    <td className="py-3 px-3 text-center font-mono">{occ} / {count}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${potentialMonthly.toLocaleString()}
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
