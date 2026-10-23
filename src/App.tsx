import React, { useState, useEffect } from 'react';
import {
  HotelSettings,
  Room,
  Guest,
  Reservation,
  PaymentTransaction,
  StaffMember,
  MaintenanceRequest,
  UserProfile,
  AvailabilitySearchCriteria,
  AuditLog
} from './types/hotel';
import { StorageService } from './services/storage';
import { DEMO_USERS } from './data/seedData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { RoomCatalog } from './components/RoomCatalog';
import { LandingFeatures } from './components/LandingFeatures';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { InvoiceModal } from './components/InvoiceModal';
import { AdminLayout } from './components/AdminLayout';
import { DashboardOverview } from './components/DashboardOverview';
import { FrontDeskCheckIn } from './components/FrontDeskCheckIn';
import { ReservationManagement } from './components/ReservationManagement';
import { RoomManagement } from './components/RoomManagement';
import { HousekeepingModule } from './components/HousekeepingModule';
import { MaintenanceModule } from './components/MaintenanceModule';
import { GuestManagement } from './components/GuestManagement';
import { PaymentManagement } from './components/PaymentManagement';
import { StaffManagement } from './components/StaffManagement';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { HotelSettingsModule } from './components/HotelSettingsModule';
import { SystemDiagnostics } from './components/SystemDiagnostics';

export default function App() {
  // Global Application State backed by StorageService
  const [settings, setSettings] = useState<HotelSettings>(() => StorageService.getSettings());
  const [rooms, setRooms] = useState<Room[]>(() => StorageService.getRooms());
  const [reservations, setReservations] = useState<Reservation[]>(() => StorageService.getReservations());
  const [guests, setGuests] = useState<Guest[]>(() => StorageService.getGuests());
  const [payments, setPayments] = useState<PaymentTransaction[]>(() => StorageService.getPayments());
  const [staff, setStaff] = useState<StaffMember[]>(() => StorageService.getStaff());
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>(() => StorageService.getMaintenanceRequests());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());

  // User Session: defaults to Administrator for full inspection capability, switchable anytime
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('hotelpro_current_user_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_USERS[0];
      }
    }
    return DEMO_USERS[0];
  });

  // Navigation View State: 'landing' | 'rooms' | 'dashboard' | 'diagnostics'
  const [currentView, setCurrentView] = useState<'landing' | 'rooms' | 'dashboard' | 'diagnostics'>('landing');
  const [adminSection, setAdminSection] = useState<string>('overview');

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [initialBookingCriteria, setInitialBookingCriteria] = useState<{ checkIn: string; checkOut: string; adults: number; children: number } | undefined>();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedResForInvoice, setSelectedResForInvoice] = useState<Reservation | null>(null);

  // Synchronize state from storage
  const refreshAllData = () => {
    setSettings(StorageService.getSettings());
    setRooms(StorageService.getRooms());
    setReservations(StorageService.getReservations());
    setGuests(StorageService.getGuests());
    setPayments(StorageService.getPayments());
    setStaff(StorageService.getStaff());
    setMaintenance(StorageService.getMaintenanceRequests());
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('hotelpro_current_user_v1', JSON.stringify(user));
  };

  const handleLogout = () => {
    // Switch to guest persona
    const guestUser = DEMO_USERS.find((u) => u.role === 'guest') || DEMO_USERS[3];
    setCurrentUser(guestUser);
    localStorage.setItem('hotelpro_current_user_v1', JSON.stringify(guestUser));
    setCurrentView('landing');
  };

  const handleOpenBookingModalForRoom = (room: Room) => {
    setSelectedRoomForBooking(room);
    setIsBookingModalOpen(true);
  };

  const handleAvailabilitySearch = (criteria: AvailabilitySearchCriteria) => {
    setInitialBookingCriteria({
      checkIn: criteria.checkInDate,
      checkOut: criteria.checkOutDate,
      adults: criteria.adults,
      children: criteria.children,
    });
    // Scroll to rooms catalog or open booking modal
    const roomsEl = document.getElementById('rooms-section');
    if (roomsEl) {
      roomsEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCurrentView('rooms');
    }
  };

  const handleViewInvoice = (res: Reservation) => {
    setSelectedResForInvoice(res);
  };

  const invoiceRoom = selectedResForInvoice
    ? rooms.find((r) => r.id === selectedResForInvoice.roomId) || null
    : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'dashboard') {
            setCurrentView('dashboard');
            setAdminSection('overview');
          } else if (view === 'diagnostics') {
            setCurrentView('diagnostics');
          } else if (view === 'rooms') {
            setCurrentView('rooms');
          } else {
            setCurrentView('landing');
          }
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenBookingModal={() => {
          setSelectedRoomForBooking(rooms[0] || null);
          setIsBookingModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Views */}
      {currentView === 'landing' && (
        <main className="flex-1">
          <HeroSection
            onSearch={handleAvailabilitySearch}
            onExploreRooms={() => {
              const el = document.getElementById('rooms-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenBookingModal={() => {
              setSelectedRoomForBooking(rooms[0] || null);
              setIsBookingModalOpen(true);
            }}
            onGetStarted={() => {
              setCurrentView('dashboard');
              setAdminSection('overview');
            }}
          />

          <RoomCatalog
            rooms={rooms}
            onSelectRoom={handleOpenBookingModalForRoom}
          />

          <LandingFeatures
            settings={settings}
            onOpenBookingModal={() => {
              setSelectedRoomForBooking(rooms[0] || null);
              setIsBookingModalOpen(true);
            }}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        </main>
      )}

      {currentView === 'rooms' && (
        <main className="flex-1 py-6">
          <RoomCatalog
            rooms={rooms}
            onSelectRoom={handleOpenBookingModalForRoom}
          />
        </main>
      )}

      {currentView === 'diagnostics' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <SystemDiagnostics />
        </main>
      )}

      {currentView === 'dashboard' && (
        <AdminLayout
          currentUser={currentUser}
          currentSection={adminSection}
          onSelectSection={(sec) => setAdminSection(sec)}
          onReturnToPublic={() => setCurrentView('landing')}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        >
          {adminSection === 'overview' && (
            <DashboardOverview
              rooms={rooms}
              reservations={reservations}
              payments={payments}
              settings={settings}
              currentUser={currentUser}
              onNavigateSection={(sec) => setAdminSection(sec)}
              onOpenBookingModal={() => {
                setSelectedRoomForBooking(rooms[0] || null);
                setIsBookingModalOpen(true);
              }}
            />
          )}

          {adminSection === 'frontdesk' && (
            <FrontDeskCheckIn
              rooms={rooms}
              reservations={reservations}
              settings={settings}
              onRefreshData={refreshAllData}
              onViewInvoice={handleViewInvoice}
            />
          )}

          {adminSection === 'reservations' && (
            <ReservationManagement
              reservations={reservations}
              rooms={rooms}
              settings={settings}
              onRefreshData={refreshAllData}
              onOpenBookingModal={() => {
                setSelectedRoomForBooking(rooms[0] || null);
                setIsBookingModalOpen(true);
              }}
              onViewInvoice={handleViewInvoice}
            />
          )}

          {adminSection === 'rooms' && (
            <RoomManagement
              rooms={rooms}
              onRefreshData={refreshAllData}
            />
          )}

          {adminSection === 'housekeeping' && (
            <HousekeepingModule
              rooms={rooms}
              staff={staff}
              onRefreshData={refreshAllData}
            />
          )}

          {adminSection === 'maintenance' && (
            <MaintenanceModule
              rooms={rooms}
              staff={staff}
              requests={maintenance}
              onRefreshData={refreshAllData}
            />
          )}

          {adminSection === 'guests' && (
            <GuestManagement
              guests={guests}
              reservations={reservations}
              payments={payments}
              onRefreshData={refreshAllData}
            />
          )}

          {adminSection === 'payments' && (
            <PaymentManagement
              payments={payments}
              reservations={reservations}
              settings={settings}
              onRefreshData={refreshAllData}
              onViewInvoice={handleViewInvoice}
            />
          )}

          {adminSection === 'staff' && (
            <StaffManagement
              staff={staff}
              onRefreshData={refreshAllData}
            />
          )}

          {adminSection === 'reports' && (
            <ReportsAnalytics
              rooms={rooms}
              reservations={reservations}
              payments={payments}
              settings={settings}
            />
          )}

          {adminSection === 'diagnostics' && (
            <SystemDiagnostics />
          )}

          {adminSection === 'settings' && (
            <HotelSettingsModule
              settings={settings}
              auditLogs={auditLogs}
              onRefreshData={refreshAllData}
            />
          )}
        </AdminLayout>
      )}

      {/* Global Modals */}
      <BookingModal
        room={selectedRoomForBooking}
        rooms={rooms}
        settings={settings}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedRoomForBooking(null);
        }}
        onBookingSuccess={() => {
          refreshAllData();
        }}
        initialDates={initialBookingCriteria}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
      />

      <InvoiceModal
        reservation={selectedResForInvoice}
        room={invoiceRoom}
        settings={settings}
        isOpen={!!selectedResForInvoice}
        onClose={() => setSelectedResForInvoice(null)}
      />
    </div>
  );
}
