import React, { useState } from 'react';
import {
  BedDouble,
  CalendarCheck,
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
  DoorOpen,
  CheckCircle2,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Room, Reservation, PaymentTransaction, HotelSettings, UserProfile } from '../types/hotel';

interface DashboardOverviewProps {
  rooms: Room[];
  reservations: Reservation[];
  payments: PaymentTransaction[];
  settings: HotelSettings;
  currentUser: UserProfile;
  onNavigateSection: (section: string) => void;
  onOpenBookingModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  rooms,
  reservations,
  payments,
  settings,
  currentUser,
  onNavigateSection,
  onOpenBookingModal,
}) => {
  const [revenueTimeframe, setRevenueTimeframe] = useState<'day' | 'week' | 'month'>('week');

  // Key KPI Calculations
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.availabilityStatus === 'occupied').length;
  const availableRooms = rooms.filter((r) => r.availabilityStatus === 'available').length;
  const maintenanceRooms = rooms.filter(
    (r) => r.maintenanceStatus === 'under_maintenance' || r.availabilityStatus === 'maintenance'
  ).length;
  const cleaningRooms = rooms.filter(
    (r) => r.housekeepingStatus === 'dirty' || r.availabilityStatus === 'cleaning'
  ).length;

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Revenue calculation
  const totalRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = reservations
    .filter((r) => r.status !== 'cancelled' && r.paymentStatus !== 'paid')
    .reduce((sum, r) => sum + Math.max(0, r.totalAmount - r.paidAmount), 0);

  // Today's Check-ins & Check-outs
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckIns = reservations.filter(
    (r) => r.checkInDate === todayStr && r.status !== 'cancelled'
  ).length;
  const todayCheckOuts = reservations.filter(
    (r) => r.checkOutDate === todayStr && r.status === 'checked_in'
  ).length;

  // Chart Data: Revenue trends
  const revenueChartData = [
    { period: 'Mon', revenue: 2150, occupancy: 65 },
    { period: 'Tue', revenue: 2840, occupancy: 75 },
    { period: 'Wed', revenue: 3100, occupancy: 82 },
    { period: 'Thu', revenue: 3680, occupancy: 88 },
    { period: 'Fri', revenue: 4950, occupancy: 95 },
    { period: 'Sat', revenue: 5400, occupancy: 100 },
    { period: 'Sun', revenue: 4200, occupancy: 78 },
  ];

  // Room status distribution data
  const roomStatusData = [
    { name: 'Available', value: availableRooms, color: '#10b981' },
    { name: 'Occupied', value: occupiedRooms, color: '#0f172a' },
    { name: 'Cleaning Required', value: cleaningRooms, color: '#f59e0b' },
    { name: 'Under Maintenance', value: maintenanceRooms, color: '#ef4444' },
  ];

  const recentReservations = reservations.slice(0, 6);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Confirmed</span>;
      case 'checked_in':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Checked In</span>;
      case 'checked_out':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Checked Out</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Property Performance Console
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Hotel Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status for {settings.hotelName} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateSection('frontdesk')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <DoorOpen className="w-4 h-4 text-slate-500" />
            Front Desk Queue
          </button>
          <button
            onClick={onOpenBookingModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            New Walk-in Reservation
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rooms & Occupancy */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Occupancy Rate</span>
            <BedDouble className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
              {occupancyRate}%
            </span>
            <span className="text-xs font-medium text-slate-500">
              {occupiedRooms} / {totalRooms} rooms occupied
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-slate-900 h-2 rounded-full transition-all"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% vs previous period</span>
          </div>
        </div>

        {/* Today's Front Desk Activity */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Today's Front Desk</span>
            <CalendarCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-blue-900">
                {todayCheckIns}
              </div>
              <div className="text-[11px] text-slate-500">Check-ins Expected</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-700">
                {todayCheckOuts}
              </div>
              <div className="text-[11px] text-slate-500">Check-outs Due</div>
            </div>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Pending Balances</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-amber-700">
            ${pendingPayments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 text-xs text-slate-500">
            To be settled at front desk on checkout
          </div>
        </div>
      </div>

      {/* Secondary Room Status Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-800 uppercase">Available Rooms</div>
            <div className="text-xl font-bold font-mono text-emerald-900 tabular-nums">{availableRooms}</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-700 uppercase">Occupied</div>
            <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">{occupiedRooms}</div>
          </div>
          <Users className="w-5 h-5 text-slate-600" />
        </div>

        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-amber-800 uppercase">Housekeeping Dirty</div>
            <div className="text-xl font-bold font-mono text-amber-900 tabular-nums">{cleaningRooms}</div>
          </div>
          <Sparkles className="w-5 h-5 text-amber-600" />
        </div>

        <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-rose-800 uppercase">Under Maintenance</div>
            <div className="text-xl font-bold font-mono text-rose-900 tabular-nums">{maintenanceRooms}</div>
          </div>
          <AlertTriangle className="w-5 h-5 text-rose-600" />
        </div>
      </div>

      {/* Visual Analytics Grid: Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue & Occupancy Trend Chart */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Revenue & Daily Occupancy Demand
              </h2>
              <p className="text-xs text-slate-500">Weekly operational trends with tabular figures</p>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setRevenueTimeframe('day')}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  revenueTimeframe === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setRevenueTimeframe('week')}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  revenueTimeframe === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setRevenueTimeframe('month')}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  revenueTimeframe === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Month
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={(value: any) => [`$${value}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Status Donut Chart */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              Room Inventory Distribution
            </h2>
            <p className="text-xs text-slate-500 mb-4">Current state across {totalRooms} rooms</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {roomStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {roomStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 tabular-nums">{item.value} rooms</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              Recent Reservations & Arrivals
            </h2>
            <p className="text-xs text-slate-500">Latest active bookings and transaction states</p>
          </div>
          <button
            onClick={() => onNavigateSection('reservations')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline cursor-pointer"
          >
            View All ({reservations.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-3">Guest Name</th>
                <th className="py-3 px-3">Room</th>
                <th className="py-3 px-3">Dates</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentReservations.map((res) => {
                const room = rooms.find((r) => r.id === res.roomId);

                return (
                  <tr key={res.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {res.bookingReference}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {res.guestName}
                    </td>
                    <td className="py-3 px-3">
                      Room {room?.roomNumber || '—'} ({room?.type || 'Suite'})
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-500">
                      {res.checkInDate} → {res.checkOutDate} ({res.nights}n)
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${res.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(res.status)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`capitalize font-semibold text-[11px] ${
                          res.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {res.paymentStatus}
                      </span>
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
