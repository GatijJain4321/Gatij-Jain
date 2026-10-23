import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  Coffee,
  Waves,
  Wifi,
  Car,
  UtensilsCrossed,
  Clock,
  Lock,
  Database,
  KeyRound,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Hotel
} from 'lucide-react';
import { HotelSettings } from '../types/hotel';

interface LandingFeaturesProps {
  settings: HotelSettings;
  onOpenBookingModal: () => void;
  onOpenAuthModal: () => void;
}

export const LandingFeatures: React.FC<LandingFeaturesProps> = ({
  settings,
  onOpenBookingModal,
  onOpenAuthModal,
}) => {
  const amenitiesList = [
    {
      icon: Waves,
      title: 'Oceanfront Heated Infinity Pool',
      desc: 'Year-round temperature-controlled saltwater infinity pool with private cabana service and sunset views.',
    },
    {
      icon: UtensilsCrossed,
      title: 'Michelin-Caliber Dining',
      desc: 'Three on-site culinary concepts featuring locally sourced Pacific seafood and sommelier pairings.',
    },
    {
      icon: Coffee,
      title: 'Artisanal Roastery & Salon',
      desc: 'Bespoke espresso blends and morning pastries served daily in the atrium lounge from 06:30.',
    },
    {
      icon: Wifi,
      title: 'Gigabit Fiber Connectivity',
      desc: 'Dedicated high-speed wireless across all rooms and meeting salons with zero dead zones.',
    },
    {
      icon: Car,
      title: 'Chauffeured Valet & EV Hub',
      desc: '24/7 subterranean secure valet parking with DC fast chargers for all electric vehicles.',
    },
    {
      icon: Clock,
      title: '24/7 Concierge & Butler Desk',
      desc: 'Immediate coordination of airport transfers, private yacht charters, and dining reservations.',
    },
  ];

  const securityHighlights = [
    {
      icon: Database,
      title: 'ACID Reservation Locks',
      desc: 'High-concurrency room booking checks prevent duplicate bookings and overlapping check-in dates.',
    },
    {
      icon: Lock,
      title: 'Strict Row Level Security (RLS)',
      desc: 'PostgreSQL policies isolate guest records, preventing unauthorized profile inspection.',
    },
    {
      icon: ShieldCheck,
      title: 'PCI-DSS Stripe Engine',
      desc: 'Zero card numbers or CVVs stored in plaintext. Fully tokenized payment transactions.',
    },
    {
      icon: KeyRound,
      title: 'Role-Based Access Control',
      desc: 'Fine-grained permissions strictly separating Admins, Receptionists, Housekeeping, and Guests.',
    },
  ];

  const testimonials = [
    {
      quote: "HotelPro replaced four fragmented tools. Our front desk check-in time dropped from 7 minutes to under 90 seconds, and double-booking errors are completely eliminated.",
      author: 'Marcus Vance',
      role: 'General Manager',
      property: 'The Grand Luminaire (Verified Demo Testimonial)',
    },
    {
      quote: "The automated housekeeping turnover on guest checkout ensures our rooms are sanitized and inspected with zero walkie-talkie friction. A game-changer for operations.",
      author: 'Elena Rostova',
      role: 'Director of Housekeeping',
      property: 'Coastal Bay Resorts (Verified Demo Testimonial)',
    },
  ];

  return (
    <div className="space-y-24 py-16">
      {/* Amenities & Services Section */}
      <section id="amenities-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            Refined Living
          </div>
          <h2 className="text-3xl font-bold font-display text-slate-900">
            Hotel Services & Guest Amenities
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Designed for discerning travelers and executive retreats with uncompromising hospitality standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {amenitiesList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* About HotelPro Operations System */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Hospitality Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-display leading-tight">
                Engineered for High-Reliability Hotel Operations
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                HotelPro bridges the gap between guest-facing online booking engines and back-of-house hospitality logistics. Reception desks get instant visibility into clean room eligibility, housekeeping teams work from synchronized kanban boards, and accounting teams receive automated folio ledgers.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-200">
                    <span className="font-bold text-white">Automated Turnover Gates: </span>
                    Rooms departing automatically trigger "Dirty" status and block front-desk check-in until supervisor certified.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-200">
                    <span className="font-bold text-white">Live Maintenance Locking: </span>
                    Urgent plumbing or HVAC maintenance tickets instantly freeze room availability across both online booking and reception.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-200">
                    <span className="font-bold text-white">Multi-Role Access Control: </span>
                    Secure boundaries ensuring staff and guests only access information pertinent to their responsibilities.
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  onClick={onOpenAuthModal}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Explore Role Consoles
                </button>
              </div>
            </div>

            {/* Security cards column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {securityHighlights.map((sec, idx) => {
                const Icon = sec.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2.5"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">{sec.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{sec.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            Proven Operations
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900">
            Trusted by Hospitality Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6"
            >
              <p className="text-slate-700 text-sm leading-relaxed italic">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center font-display text-sm">
                  {t.author[0]}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{t.author}</div>
                  <div className="text-[11px] text-slate-500">{t.role} · {t.property}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                Get In Touch
              </div>
              <h2 className="text-3xl font-bold font-display mb-3">
                Experience {settings.hotelName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Direct reservations, private group buyouts, and executive conferences coordinated with personalized concierge care.
              </p>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{settings.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{settings.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{settings.email}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={onOpenBookingModal}
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Book Your Stay Online
              </button>
              <button
                onClick={onOpenAuthModal}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Staff Portal Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-900 text-amber-400 font-bold flex items-center justify-center font-display text-xs">
              HP
            </div>
            <span className="font-bold text-slate-900 font-display">HotelPro</span>
            <span aria-hidden="true">·</span>
            <span>All-in-one Hotel Management & Booking OS</span>
          </div>

          <div className="flex items-center gap-6 text-slate-600">
            <span>Free Cancellation (48h)</span>
            <span aria-hidden="true">·</span>
            <span>PCI-DSS Validated</span>
            <span aria-hidden="true">·</span>
            <span>PostgreSQL & RLS Ready</span>
          </div>

          <div className="text-slate-400 text-[11px]">
            © {new Date().getFullYear()} HotelPro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
