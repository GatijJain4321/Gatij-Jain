import React from 'react';
import {
  Hotel,
  CalendarCheck,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  Shield,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/hotel';

interface NavbarProps {
  currentUser: UserProfile;
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuthModal: () => void;
  onOpenBookingModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenAuthModal,
  onOpenBookingModal,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'text-amber-800 bg-amber-50 border border-amber-200';
      case 'receptionist':
        return 'text-blue-800 bg-blue-50 border border-blue-200';
      case 'staff':
        return 'text-emerald-800 bg-emerald-50 border border-emerald-200';
      default:
        return 'text-slate-700 bg-slate-100 border border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Universal Top Bar Contract: 3 distinct zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-xs">
            <Hotel className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 font-display group-hover:text-amber-600 transition-colors">
              Hotel<span className="text-amber-600">Pro</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
              Hospitality OS
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single line, clean typography) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors hover:text-slate-900 whitespace-nowrap shrink-0 py-1 ${
              currentView === 'landing' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('rooms')}
            className={`transition-colors hover:text-slate-900 whitespace-nowrap shrink-0 py-1 ${
              currentView === 'rooms' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
            }`}
          >
            Rooms & Suites
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`transition-colors hover:text-slate-900 whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
              currentView.startsWith('dashboard') ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-slate-500" />
            Operations Console
          </button>
          <button
            onClick={() => onNavigate('diagnostics')}
            className={`transition-colors hover:text-slate-900 whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
              currentView === 'diagnostics' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            System Tests
          </button>
        </nav>

        {/* Zone 3: Primary Actions & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Book Button */}
          <button
            onClick={onOpenBookingModal}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
            Book a Room
          </button>

          {/* User Account Button */}
          <div className="relative flex items-center gap-2">
            <button
              onClick={onOpenAuthModal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${getRoleBadgeStyle(
                currentUser.role
              )}`}
              title="Click to switch role or view account"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden lg:inline font-semibold">{currentUser.fullName}</span>
              <span className="uppercase text-[10px] tracking-wide font-mono px-1 py-0.5 bg-black/5 rounded">
                {currentUser.role}
              </span>
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <button
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700"
          >
            Overview
          </button>
          <button
            onClick={() => {
              onNavigate('rooms');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700"
          >
            Rooms & Suites
          </button>
          <button
            onClick={() => {
              onNavigate('dashboard');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700"
          >
            Operations Console
          </button>
          <button
            onClick={() => {
              onNavigate('diagnostics');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700"
          >
            System Tests
          </button>
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => {
                onOpenBookingModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold text-center"
            >
              Book a Room
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
