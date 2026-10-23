import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Search,
  Sparkles,
  ShieldCheck,
  CreditCard,
  BedDouble,
  ChevronRight
} from 'lucide-react';
import { AvailabilitySearchCriteria, RoomType } from '../types/hotel';

interface HeroSectionProps {
  onSearch: (criteria: AvailabilitySearchCriteria) => void;
  onExploreRooms: () => void;
  onOpenBookingModal: () => void;
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onExploreRooms,
  onOpenBookingModal,
  onGetStarted,
}) => {
  // Default to today and 3 days later
  const todayStr = new Date().toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(threeDaysLater);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [roomType, setRoomType] = useState<RoomType | ''>('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      checkInDate,
      checkOutDate,
      adults: Number(adults),
      children: Number(children),
      roomType: roomType ? (roomType as RoomType) : undefined,
    });
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background Hero Image with measured gradient scrim for 4.5:1 WCAG contrast */}
      <div className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center">
        <img
          src="/src/assets/images/hero_luxury_hotel_1792750009769.jpg"
          alt="The Grand Luminaire HotelPro Reception and Lobby"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Measured scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/80 to-slate-900/60" />

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-white w-full">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <span>The Grand Luminaire</span>
              <span aria-hidden="true">·</span>
              <span>Hotel Management & Booking Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-display text-balance leading-tight">
              Manage Your Hotel Smarter with <span className="text-amber-400">HotelPro</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-200 leading-relaxed max-w-2xl text-pretty font-light">
              An all-in-one hospitality operating platform. Streamline real-time room reservations, front-desk check-in, automated housekeeping status, staff task assignments, and PCI-compliant payments.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenBookingModal}
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                <BedDouble className="w-4 h-4" />
                Book a Room
              </button>
              <button
                onClick={onExploreRooms}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl transition-all border border-white/20 backdrop-blur-xs flex items-center gap-2 cursor-pointer"
              >
                Explore Rooms & Suites
              </button>
              <button
                onClick={onGetStarted}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-sm rounded-xl transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
              >
                Get Started
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Availability Search Bar Card */}
          <div className="mt-12 p-4 sm:p-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 text-slate-900 max-w-5xl">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Check-in Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={todayStr}
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Check-out Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={checkInDate}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Guests
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  >
                    <option value={1}>1 Adult</option>
                    <option value={2}>2 Adults</option>
                    <option value={3}>3 Adults</option>
                    <option value={4}>4 Adults</option>
                    <option value={5}>5 Adults</option>
                  </select>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  >
                    <option value={0}>0 Kids</option>
                    <option value={1}>1 Kid</option>
                    <option value={2}>2 Kids</option>
                    <option value={3}>3 Kids</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Room Category
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                >
                  <option value="">All Categories</option>
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="Family">Family</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Search className="w-4 h-4 text-amber-400" />
                  Check Live Availability
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 4-Column Proof / Feature Strip below Hero */}
      <div className="bg-slate-900 border-y border-slate-800 py-6 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">ACID Double-Booking Guard</div>
              <div className="text-xs text-slate-400">Strict collision locks</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Express Check-in & Out</div>
              <div className="text-xs text-slate-400">Clean room validation</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Stripe Test Mode Ready</div>
              <div className="text-xs text-slate-400">Itemized billing & vouchers</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">4 Distinct Staff Roles</div>
              <div className="text-xs text-slate-400">RBAC security built-in</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
