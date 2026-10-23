import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  DoorOpen,
  Sparkles,
  Wrench,
  Users,
  CreditCard,
  UserCheck,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Check,
  Trash2,
  Menu,
  X,
  Hotel
} from 'lucide-react';
import { UserProfile, UserRole, HotelNotification } from '../types/hotel';
import { StorageService } from '../services/storage';

interface AdminLayoutProps {
  currentUser: UserProfile;
  currentSection: string;
  onSelectSection: (section: string) => void;
  onReturnToPublic: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  currentSection,
  onSelectSection,
  onReturnToPublic,
  onOpenAuthModal,
  onLogout,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<HotelNotification[]>(() =>
    StorageService.getNotifications()
  );

  const refreshNotifications = () => {
    setNotifications(StorageService.getNotifications());
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    StorageService.markNotificationRead(id);
    refreshNotifications();
  };

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsRead();
    refreshNotifications();
  };

  const handleClearNotifications = () => {
    StorageService.clearNotifications();
    refreshNotifications();
  };

  // Role permissions navigation filtering
  const navigationItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      roles: ['admin', 'receptionist', 'staff', 'guest'],
    },
    {
      id: 'frontdesk',
      label: 'Front Desk Check-in / Out',
      icon: DoorOpen,
      roles: ['admin', 'receptionist'],
    },
    {
      id: 'reservations',
      label: 'Reservations',
      icon: CalendarCheck,
      roles: ['admin', 'receptionist', 'guest'],
    },
    {
      id: 'rooms',
      label: 'Room Inventory',
      icon: Hotel,
      roles: ['admin', 'receptionist'],
    },
    {
      id: 'housekeeping',
      label: 'Housekeeping Board',
      icon: Sparkles,
      roles: ['admin', 'receptionist', 'staff'],
    },
    {
      id: 'maintenance',
      label: 'Maintenance Logs',
      icon: Wrench,
      roles: ['admin', 'receptionist', 'staff'],
    },
    {
      id: 'guests',
      label: 'Guest Directory',
      icon: Users,
      roles: ['admin', 'receptionist'],
    },
    {
      id: 'payments',
      label: 'Payments & Billing',
      icon: CreditCard,
      roles: ['admin', 'receptionist'],
    },
    {
      id: 'staff',
      label: 'Staff & Shifts',
      icon: UserCheck,
      roles: ['admin'],
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['admin'],
    },
    {
      id: 'diagnostics',
      label: 'System Integrity Tests',
      icon: ShieldCheck,
      roles: ['admin', 'receptionist', 'staff', 'guest'],
    },
    {
      id: 'settings',
      label: 'Hotel Settings & Audit',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  const allowedNav = navigationItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="font-bold text-sm font-display">HotelPro Console</span>
        <button
          onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
          className="relative p-1.5 rounded-lg bg-slate-800 text-slate-300"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileSidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-slate-900 text-slate-300 shrink-0 border-r border-slate-800 flex flex-col justify-between`}
      >
        <div>
          {/* Brand Wordmark Zone */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <button
              onClick={onReturnToPublic}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Hotel className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <div className="text-base font-bold text-white font-display leading-tight group-hover:text-amber-400 transition-colors">
                  HotelPro
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  The Grand Luminaire
                </div>
              </div>
            </button>
          </div>

          {/* User Persona Bar */}
          <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-[11px] font-bold flex items-center justify-center uppercase shrink-0">
                {currentUser.role[0]}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">{currentUser.fullName}</div>
                <div className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                  {currentUser.role}
                </div>
              </div>
            </div>
            <button
              onClick={onOpenAuthModal}
              className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              title="Switch user role"
            >
              Switch
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {allowedNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSection(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={onReturnToPublic}
            className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onLogout}
            className="w-full py-2 px-3 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Sign Out</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar (Breadcrumb + Actions) */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 px-6 items-center justify-between shrink-0">
          {/* Breadcrumb trail */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>HotelPro</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900 capitalize">
              {navigationItems.find((n) => n.id === currentSection)?.label || currentSection}
            </span>
          </div>

          {/* Right Header Zone */}
          <div className="flex items-center gap-4">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  refreshNotifications();
                }}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400 text-slate-950 font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={handleClearNotifications}
                        className="text-slate-400 hover:text-rose-400"
                        title="Clear all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications to display.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkAsRead(notif.id)}
                          className={`p-3.5 text-xs transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-3 ${
                            !notif.read ? 'bg-amber-50/50' : ''
                          }`}
                        >
                          <div className="mt-0.5 w-2 h-2 rounded-full shrink-0">
                            {!notif.read && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 flex justify-between items-center">
                              <span>{notif.title}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role indicator pill */}
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
              <span className="text-xs text-slate-500">Logged in as</span>
              <span className="text-xs font-bold text-slate-900">{currentUser.fullName}</span>
              <span className="uppercase text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                {currentUser.role}
              </span>
            </div>
          </div>
        </header>

        {/* Section Viewport Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
