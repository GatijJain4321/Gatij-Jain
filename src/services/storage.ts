import {
  HotelSettings,
  Room,
  Guest,
  Reservation,
  PaymentTransaction,
  StaffMember,
  MaintenanceRequest,
  HotelNotification,
  AuditLog,
  AvailabilitySearchCriteria,
  UserRole,
  HousekeepingStatus
} from '../types/hotel';

import {
  DEFAULT_HOTEL_SETTINGS,
  INITIAL_ROOMS,
  INITIAL_GUESTS,
  INITIAL_RESERVATIONS,
  INITIAL_PAYMENTS,
  INITIAL_STAFF,
  INITIAL_MAINTENANCE_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';

const STORAGE_KEYS = {
  SETTINGS: 'hotelpro_settings_v1',
  ROOMS: 'hotelpro_rooms_v1',
  GUESTS: 'hotelpro_guests_v1',
  RESERVATIONS: 'hotelpro_reservations_v1',
  PAYMENTS: 'hotelpro_payments_v1',
  STAFF: 'hotelpro_staff_v1',
  MAINTENANCE: 'hotelpro_maintenance_v1',
  NOTIFICATIONS: 'hotelpro_notifications_v1',
  AUDIT_LOGS: 'hotelpro_audit_logs_v1',
  CURRENT_USER: 'hotelpro_current_user_v1',
};

function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Failed to read ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write ${key} to localStorage:`, err);
  }
}

// Generate unique booking references like HP-73921-X
export function generateBookingReference(): string {
  const digits = Math.floor(10000 + Math.random() * 90000);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const char = chars[Math.floor(Math.random() * chars.length)];
  return `HP-${digits}-${char}`;
}

export const StorageService = {
  // Reset all to seed data
  resetToDefaults(): void {
    setStorageItem(STORAGE_KEYS.SETTINGS, DEFAULT_HOTEL_SETTINGS);
    setStorageItem(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    setStorageItem(STORAGE_KEYS.GUESTS, INITIAL_GUESTS);
    setStorageItem(STORAGE_KEYS.RESERVATIONS, INITIAL_RESERVATIONS);
    setStorageItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    setStorageItem(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    setStorageItem(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_REQUESTS);
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setStorageItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  // Settings
  getSettings(): HotelSettings {
    return getStorageItem<HotelSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_HOTEL_SETTINGS);
  },

  updateSettings(settings: Partial<HotelSettings>, actorEmail = 'admin@hotelpro.com', actorRole: UserRole = 'admin'): HotelSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    setStorageItem(STORAGE_KEYS.SETTINGS, updated);
    this.addAuditLog('SETTINGS_UPDATED', actorEmail, actorRole, 'Hotel operational settings updated.');
    return updated;
  },

  // Rooms
  getRooms(): Room[] {
    return getStorageItem<Room[]>(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  },

  getRoom(id: string): Room | undefined {
    return this.getRooms().find((r) => r.id === id);
  },

  addRoom(roomData: Omit<Room, 'id'>, actorEmail = 'admin@hotelpro.com', actorRole: UserRole = 'admin'): { success: boolean; room?: Room; error?: string } {
    const rooms = this.getRooms();
    const cleanRoomNum = roomData.roomNumber.trim();
    if (rooms.some((r) => r.roomNumber.toLowerCase() === cleanRoomNum.toLowerCase())) {
      return { success: false, error: `Room number ${cleanRoomNum} already exists in this hotel.` };
    }

    const newRoom: Room = {
      ...roomData,
      id: `room-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      roomNumber: cleanRoomNum,
    };

    rooms.push(newRoom);
    setStorageItem(STORAGE_KEYS.ROOMS, rooms);
    this.addAuditLog('ROOM_CREATED', actorEmail, actorRole, `Added Room ${newRoom.roomNumber} (${newRoom.type})`);
    return { success: true, room: newRoom };
  },

  updateRoom(id: string, updates: Partial<Room>, actorEmail = 'admin@hotelpro.com', actorRole: UserRole = 'admin'): { success: boolean; room?: Room; error?: string } {
    const rooms = this.getRooms();
    const index = rooms.findIndex((r) => r.id === id);
    if (index === -1) return { success: false, error: 'Room not found' };

    if (updates.roomNumber) {
      const cleanNum = updates.roomNumber.trim();
      const duplicate = rooms.some((r) => r.id !== id && r.roomNumber.toLowerCase() === cleanNum.toLowerCase());
      if (duplicate) {
        return { success: false, error: `Room number ${cleanNum} is already assigned to another room.` };
      }
    }

    rooms[index] = { ...rooms[index], ...updates };
    setStorageItem(STORAGE_KEYS.ROOMS, rooms);
    this.addAuditLog('ROOM_UPDATED', actorEmail, actorRole, `Updated Room ${rooms[index].roomNumber}`);
    return { success: true, room: rooms[index] };
  },

  deleteRoom(id: string, actorEmail = 'admin@hotelpro.com', actorRole: UserRole = 'admin'): { success: boolean; error?: string } {
    const reservations = this.getReservations();
    const activeRes = reservations.find(
      (r) => r.roomId === id && (r.status === 'confirmed' || r.status === 'checked_in')
    );
    if (activeRes) {
      return {
        success: false,
        error: `Cannot delete room. Active reservation ${activeRes.bookingReference} is assigned to this room.`,
      };
    }

    const rooms = this.getRooms().filter((r) => r.id !== id);
    setStorageItem(STORAGE_KEYS.ROOMS, rooms);
    this.addAuditLog('ROOM_DELETED', actorEmail, actorRole, `Deleted Room ID: ${id}`);
    return { success: true };
  },

  // Room Availability Engine: checks both room status and overlapping bookings
  isRoomAvailable(roomId: string, checkInDate: string, checkOutDate: string, excludeReservationId?: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;

    // A room cannot be booked if it's marked under maintenance or needs repair
    if (room.maintenanceStatus === 'under_maintenance' || room.availabilityStatus === 'maintenance') {
      return false;
    }

    const reservations = this.getReservations();
    const newCheckIn = new Date(checkInDate).getTime();
    const newCheckOut = new Date(checkOutDate).getTime();

    if (isNaN(newCheckIn) || isNaN(newCheckOut) || newCheckOut <= newCheckIn) {
      return false;
    }

    // Check all active reservations for this room
    const hasOverlap = reservations.some((res) => {
      if (res.roomId !== roomId) return false;
      if (excludeReservationId && res.id === excludeReservationId) return false;
      // Cancelled and checked out reservations do not block future availability
      if (res.status === 'cancelled' || res.status === 'checked_out') return false;

      const existingCheckIn = new Date(res.checkInDate).getTime();
      const existingCheckOut = new Date(res.checkOutDate).getTime();

      // Standard booking overlap rule: [startA, endA) overlaps [startB, endB) if startA < endB and endA > startB
      return newCheckIn < existingCheckOut && newCheckOut > existingCheckIn;
    });

    return !hasOverlap;
  },

  searchAvailableRooms(criteria: AvailabilitySearchCriteria): Room[] {
    const totalGuests = criteria.adults + criteria.children;
    const rooms = this.getRooms();

    return rooms.filter((room) => {
      // Capacity check
      if (room.maxGuests < totalGuests) return false;

      // Room Type filter if specified
      if (criteria.roomType && room.type !== criteria.roomType) return false;

      // Date overlap & maintenance check
      return this.isRoomAvailable(room.id, criteria.checkInDate, criteria.checkOutDate);
    });
  },

  // Reservations
  getReservations(): Reservation[] {
    return getStorageItem<Reservation[]>(STORAGE_KEYS.RESERVATIONS, INITIAL_RESERVATIONS);
  },

  getReservation(id: string): Reservation | undefined {
    return this.getReservations().find((r) => r.id === id);
  },

  createReservation(params: {
    roomId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    guestAddress?: string;
    guestCountry?: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    specialRequests?: string;
    discountAmount?: number;
    paymentMethod?: 'credit_card' | 'cash' | 'bank_transfer' | 'stripe';
    simulatePaymentSuccess?: boolean;
    actorEmail?: string;
    actorRole?: UserRole;
  }): { success: boolean; reservation?: Reservation; error?: string } {
    const room = this.getRoom(params.roomId);
    if (!room) return { success: false, error: 'Selected room does not exist.' };

    const totalGuests = params.adults + params.children;
    if (totalGuests > room.maxGuests) {
      return { success: false, error: `Guest count (${totalGuests}) exceeds maximum room capacity (${room.maxGuests}).` };
    }

    // Availability validation (Double-booking prevention lock)
    const isAvail = this.isRoomAvailable(params.roomId, params.checkInDate, params.checkOutDate);
    if (!isAvail) {
      return {
        success: false,
        error: `Room ${room.roomNumber} is unavailable for selected dates (${params.checkInDate} to ${params.checkOutDate}). It may already be reserved or under maintenance.`,
      };
    }

    // Calculate nights & pricing
    const checkIn = new Date(params.checkInDate);
    const checkOut = new Date(params.checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

    const settings = this.getSettings();
    const subtotal = room.pricePerNight * nights;
    const taxAmount = Number(((subtotal * settings.taxRatePercent) / 100).toFixed(2));
    const cleaningFee = settings.cleaningFee;
    const discountAmount = params.discountAmount || 0;
    const totalAmount = Number((subtotal + taxAmount + cleaningFee - discountAmount).toFixed(2));

    // Ensure guest profile exists or create one
    let guest = this.getGuests().find((g) => g.email.toLowerCase() === params.guestEmail.toLowerCase());
    if (!guest) {
      guest = {
        id: `guest-${Date.now()}`,
        fullName: params.guestName,
        email: params.guestEmail,
        phone: params.guestPhone,
        address: params.guestAddress || '',
        country: params.guestCountry || 'United States',
        specialRequests: params.specialRequests,
        createdAt: new Date().toISOString(),
      };
      this.addGuest(guest);
    }

    const bookingRef = generateBookingReference();
    const paidAmount = params.simulatePaymentSuccess ? totalAmount : 0;
    const paymentStatus = params.simulatePaymentSuccess ? 'paid' : 'pending';

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      bookingReference: bookingRef,
      roomId: room.id,
      guestId: guest.id,
      guestName: params.guestName,
      guestEmail: params.guestEmail,
      guestPhone: params.guestPhone,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: params.adults,
      children: params.children,
      nights,
      roomRate: room.pricePerNight,
      subtotal,
      taxAmount,
      cleaningFee,
      discountAmount,
      totalAmount,
      paidAmount,
      status: 'confirmed',
      paymentStatus,
      specialRequests: params.specialRequests,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const reservations = this.getReservations();
    reservations.unshift(newReservation);
    setStorageItem(STORAGE_KEYS.RESERVATIONS, reservations);

    // If payment was completed
    if (params.simulatePaymentSuccess) {
      this.addPaymentTransaction({
        reservationId: newReservation.id,
        bookingReference: newReservation.bookingReference,
        guestName: newReservation.guestName,
        amount: totalAmount,
        currency: settings.currency,
        method: params.paymentMethod || 'credit_card',
        status: 'paid',
        transactionRef: `tx_stripe_${Date.now()}`,
        notes: `Initial booking payment for ${nights} nights at Room ${room.roomNumber}`,
      });
    }

    // Add in-app notification
    this.addNotification({
      title: 'New Reservation Created',
      message: `${params.guestName} booked Room ${room.roomNumber} (${params.checkInDate} to ${params.checkOutDate}) · ${bookingRef}`,
      type: 'booking',
    });

    // Audit log
    this.addAuditLog(
      'RESERVATION_CREATED',
      params.actorEmail || params.guestEmail,
      params.actorRole || 'guest',
      `Created booking ${bookingRef} for ${params.guestName} in Room ${room.roomNumber}. Total: $${totalAmount}`
    );

    return { success: true, reservation: newReservation };
  },

  cancelReservation(id: string, reason = 'Guest requested cancellation', actorEmail = 'guest@hotelpro.com', actorRole: UserRole = 'guest'): { success: boolean; error?: string } {
    const reservations = this.getReservations();
    const index = reservations.findIndex((r) => r.id === id);
    if (index === -1) return { success: false, error: 'Reservation not found.' };

    const res = reservations[index];
    if (res.status === 'checked_in') {
      return { success: false, error: 'Cannot cancel an in-house checked-in reservation. Process check-out instead.' };
    }
    if (res.status === 'checked_out' || res.status === 'cancelled') {
      return { success: false, error: `Reservation is already ${res.status}.` };
    }

    reservations[index] = {
      ...res,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };
    setStorageItem(STORAGE_KEYS.RESERVATIONS, reservations);

    this.addNotification({
      title: 'Reservation Cancelled',
      message: `Booking ${res.bookingReference} for ${res.guestName} was cancelled.`,
      type: 'booking',
    });

    this.addAuditLog('RESERVATION_CANCELLED', actorEmail, actorRole, `Cancelled booking ${res.bookingReference}. Reason: ${reason}`);
    return { success: true };
  },

  // Front Desk Check-In Workflow
  checkInGuest(reservationId: string, actorEmail = 'reception@hotelpro.com'): { success: boolean; error?: string } {
    const reservations = this.getReservations();
    const resIndex = reservations.findIndex((r) => r.id === reservationId);
    if (resIndex === -1) return { success: false, error: 'Reservation not found.' };

    const res = reservations[resIndex];
    if (res.status === 'checked_in') return { success: false, error: 'Guest is already checked in.' };
    if (res.status === 'checked_out') return { success: false, error: 'Reservation is already completed/checked out.' };
    if (res.status === 'cancelled') return { success: false, error: 'Cannot check in a cancelled booking.' };

    const room = this.getRoom(res.roomId);
    if (!room) return { success: false, error: 'Assigned room does not exist.' };

    // Hospitality business constraint: Cannot check in guest if room is dirty or under maintenance!
    if (room.housekeepingStatus === 'dirty' || room.housekeepingStatus === 'in_progress') {
      return {
        success: false,
        error: `Cannot check in: Room ${room.roomNumber} is currently ${room.housekeepingStatus.toUpperCase()}. Housekeeping must inspect and certify room as clean before guest entry.`,
      };
    }
    if (room.maintenanceStatus === 'under_maintenance') {
      return {
        success: false,
        error: `Cannot check in: Room ${room.roomNumber} is currently under maintenance.`,
      };
    }

    // Update reservation
    const nowIso = new Date().toISOString();
    reservations[resIndex] = {
      ...res,
      status: 'checked_in',
      actualCheckInTime: nowIso,
      updatedAt: nowIso,
    };
    setStorageItem(STORAGE_KEYS.RESERVATIONS, reservations);

    // Update room status
    this.updateRoom(room.id, { availabilityStatus: 'occupied' });

    // Notification & Audit
    this.addNotification({
      title: 'Guest Checked In',
      message: `${res.guestName} checked into Room ${room.roomNumber}. Keycard issued.`,
      type: 'checkin',
    });

    this.addAuditLog('CHECKIN_PROCESSED', actorEmail, 'receptionist', `Checked in ${res.guestName} to Room ${room.roomNumber} (${res.bookingReference})`);
    return { success: true };
  },

  // Front Desk Check-Out Workflow
  checkOutGuest(
    reservationId: string,
    incidentalCharge = 0,
    paymentMethod: 'credit_card' | 'cash' | 'bank_transfer' | 'stripe' = 'credit_card',
    actorEmail = 'reception@hotelpro.com'
  ): { success: boolean; finalTotal?: number; error?: string } {
    const reservations = this.getReservations();
    const resIndex = reservations.findIndex((r) => r.id === reservationId);
    if (resIndex === -1) return { success: false, error: 'Reservation not found.' };

    const res = reservations[resIndex];
    if (res.status !== 'checked_in') {
      return { success: false, error: `Cannot check out. Current booking status is ${res.status} (must be checked_in).` };
    }

    const room = this.getRoom(res.roomId);
    const nowIso = new Date().toISOString();

    const newTotal = Number((res.totalAmount + incidentalCharge).toFixed(2));
    const outstanding = Number((newTotal - res.paidAmount).toFixed(2));

    // If there is an outstanding balance, record payment
    if (outstanding > 0) {
      this.addPaymentTransaction({
        reservationId: res.id,
        bookingReference: res.bookingReference,
        guestName: res.guestName,
        amount: outstanding,
        currency: this.getSettings().currency,
        method: paymentMethod,
        status: 'paid',
        transactionRef: `tx_checkout_${Date.now()}`,
        notes: incidentalCharge > 0 ? `Settled outstanding balance + $${incidentalCharge} incidentals at checkout` : 'Settled balance at departure',
      });
    }

    reservations[resIndex] = {
      ...res,
      totalAmount: newTotal,
      paidAmount: newTotal,
      status: 'checked_out',
      paymentStatus: 'paid',
      actualCheckOutTime: nowIso,
      updatedAt: nowIso,
    };
    setStorageItem(STORAGE_KEYS.RESERVATIONS, reservations);

    // AUTOMATIC HOSPITALITY STANDARD: Room immediately changes to dirty and cleaning status!
    if (room) {
      this.updateRoom(room.id, {
        availabilityStatus: 'cleaning',
        housekeepingStatus: 'dirty',
      });
    }

    this.addNotification({
      title: 'Guest Checked Out',
      message: `${res.guestName} departed from Room ${room?.roomNumber || ''}. Room automatically flagged DIRTY for housekeeping.`,
      type: 'checkout',
    });

    this.addAuditLog(
      'CHECKOUT_PROCESSED',
      actorEmail,
      'receptionist',
      `Checked out ${res.guestName} from Room ${room?.roomNumber || ''}. Final total: $${newTotal}`
    );

    return { success: true, finalTotal: newTotal };
  },

  // Guests
  getGuests(): Guest[] {
    return getStorageItem<Guest[]>(STORAGE_KEYS.GUESTS, INITIAL_GUESTS);
  },

  getGuest(id: string): Guest | undefined {
    return this.getGuests().find((g) => g.id === id);
  },

  addGuest(guest: Guest): Guest {
    const guests = this.getGuests();
    guests.unshift(guest);
    setStorageItem(STORAGE_KEYS.GUESTS, guests);
    return guest;
  },

  updateGuest(id: string, updates: Partial<Guest>): Guest | undefined {
    const guests = this.getGuests();
    const idx = guests.findIndex((g) => g.id === id);
    if (idx === -1) return undefined;
    guests[idx] = { ...guests[idx], ...updates };
    setStorageItem(STORAGE_KEYS.GUESTS, guests);
    return guests[idx];
  },

  // Payments
  getPayments(): PaymentTransaction[] {
    return getStorageItem<PaymentTransaction[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  },

  addPaymentTransaction(txData: Omit<PaymentTransaction, 'id' | 'createdAt'>): PaymentTransaction {
    const payments = this.getPayments();
    const newTx: PaymentTransaction = {
      ...txData,
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    payments.unshift(newTx);
    setStorageItem(STORAGE_KEYS.PAYMENTS, payments);
    return newTx;
  },

  refundPayment(paymentId: string, actorEmail = 'admin@hotelpro.com'): { success: boolean; error?: string } {
    const payments = this.getPayments();
    const idx = payments.findIndex((p) => p.id === paymentId);
    if (idx === -1) return { success: false, error: 'Transaction not found.' };

    const tx = payments[idx];
    if (tx.status === 'refunded') return { success: false, error: 'Payment is already refunded.' };

    payments[idx] = {
      ...tx,
      status: 'refunded',
      notes: `${tx.notes ? tx.notes + ' · ' : ''}Refunded on ${new Date().toLocaleDateString()}`,
    };
    setStorageItem(STORAGE_KEYS.PAYMENTS, payments);

    // Update reservation paidAmount if linked
    const reservations = this.getReservations();
    const resIdx = reservations.findIndex((r) => r.id === tx.reservationId);
    if (resIdx !== -1) {
      const res = reservations[resIdx];
      const newPaid = Math.max(0, res.paidAmount - tx.amount);
      reservations[resIdx] = {
        ...res,
        paidAmount: newPaid,
        paymentStatus: newPaid === 0 ? 'refunded' : 'partially_refunded',
        updatedAt: new Date().toISOString(),
      };
      setStorageItem(STORAGE_KEYS.RESERVATIONS, reservations);
    }

    this.addAuditLog('PAYMENT_REFUNDED', actorEmail, 'admin', `Refunded $${tx.amount} for reference ${tx.bookingReference}`);
    return { success: true };
  },

  // Housekeeping & Maintenance
  updateHousekeepingStatus(roomId: string, status: HousekeepingStatus, actorEmail = 'housekeeping@hotelpro.com'): { success: boolean; error?: string } {
    const room = this.getRoom(roomId);
    if (!room) return { success: false, error: 'Room not found.' };

    let newAvailability = room.availabilityStatus;
    if (status === 'clean' || status === 'inspected') {
      // If room is operational and not currently occupied, it can become available
      if (room.availabilityStatus === 'cleaning' && room.maintenanceStatus === 'operational') {
        newAvailability = 'available';
      }
    } else if (status === 'dirty' || status === 'in_progress') {
      if (room.availabilityStatus !== 'occupied') {
        newAvailability = 'cleaning';
      }
    }

    this.updateRoom(roomId, {
      housekeepingStatus: status,
      availabilityStatus: newAvailability,
    });

    this.addNotification({
      title: 'Housekeeping Updated',
      message: `Room ${room.roomNumber} status changed to ${status.toUpperCase()}.`,
      type: 'housekeeping',
    });

    this.addAuditLog('HOUSEKEEPING_UPDATED', actorEmail, 'staff', `Room ${room.roomNumber} set to ${status}`);
    return { success: true };
  },

  getMaintenanceRequests(): MaintenanceRequest[] {
    return getStorageItem<MaintenanceRequest[]>(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_REQUESTS);
  },

  createMaintenanceRequest(req: Omit<MaintenanceRequest, 'id' | 'createdAt'>, actorEmail = 'staff@hotelpro.com'): MaintenanceRequest {
    const list = this.getMaintenanceRequests();
    const newReq: MaintenanceRequest = {
      ...req,
      id: `maint-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newReq);
    setStorageItem(STORAGE_KEYS.MAINTENANCE, list);

    // If urgent or high, mark room under maintenance
    if (req.priority === 'urgent' || req.priority === 'high') {
      this.updateRoom(req.roomId, {
        maintenanceStatus: 'under_maintenance',
        availabilityStatus: 'maintenance',
      });
    } else {
      this.updateRoom(req.roomId, { maintenanceStatus: 'needs_repair' });
    }

    this.addNotification({
      title: 'Maintenance Issue Reported',
      message: `Room ${req.roomNumber}: ${req.title} (${req.priority.toUpperCase()})`,
      type: 'maintenance',
    });

    this.addAuditLog('MAINTENANCE_CREATED', actorEmail, 'staff', `Logged maintenance issue for Room ${req.roomNumber}: ${req.title}`);
    return newReq;
  },

  resolveMaintenanceRequest(id: string, actorEmail = 'staff@hotelpro.com'): { success: boolean; error?: string } {
    const list = this.getMaintenanceRequests();
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) return { success: false, error: 'Maintenance request not found.' };

    list[idx] = {
      ...list[idx],
      status: 'completed',
      completedAt: new Date().toISOString(),
    };
    setStorageItem(STORAGE_KEYS.MAINTENANCE, list);

    // Restore room maintenance status if no other active requests exist
    const room = this.getRoom(list[idx].roomId);
    if (room) {
      const remainingActive = list.filter((m) => m.roomId === room.id && m.status !== 'completed' && m.id !== id);
      if (remainingActive.length === 0) {
        this.updateRoom(room.id, {
          maintenanceStatus: 'operational',
          availabilityStatus: room.housekeepingStatus === 'clean' ? 'available' : 'cleaning',
        });
      }
    }

    this.addAuditLog('MAINTENANCE_RESOLVED', actorEmail, 'staff', `Resolved maintenance request ID ${id}`);
    return { success: true };
  },

  // Staff
  getStaff(): StaffMember[] {
    return getStorageItem<StaffMember[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
  },

  addStaff(staffData: Omit<StaffMember, 'id'>, actorEmail = 'admin@hotelpro.com'): StaffMember {
    const staff = this.getStaff();
    const newStaff: StaffMember = {
      ...staffData,
      id: `staff-${Date.now()}`,
    };
    staff.push(newStaff);
    setStorageItem(STORAGE_KEYS.STAFF, staff);
    this.addAuditLog('STAFF_ADDED', actorEmail, 'admin', `Added employee ${newStaff.fullName} (${newStaff.department})`);
    return newStaff;
  },

  updateStaff(id: string, updates: Partial<StaffMember>, actorEmail = 'admin@hotelpro.com'): StaffMember | undefined {
    const staff = this.getStaff();
    const idx = staff.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    staff[idx] = { ...staff[idx], ...updates };
    setStorageItem(STORAGE_KEYS.STAFF, staff);
    this.addAuditLog('STAFF_UPDATED', actorEmail, 'admin', `Updated staff member ${staff[idx].fullName}`);
    return staff[idx];
  },

  // Notifications
  getNotifications(): HotelNotification[] {
    return getStorageItem<HotelNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  addNotification(notif: Omit<HotelNotification, 'id' | 'createdAt' | 'read'>): HotelNotification {
    const list = this.getNotifications();
    const item: HotelNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    list.unshift(item);
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, list.slice(0, 50));
    return item;
  },

  markNotificationRead(id: string): void {
    const list = this.getNotifications();
    const idx = list.findIndex((n) => n.id === id);
    if (idx !== -1) {
      list[idx].read = true;
      setStorageItem(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  },

  markAllNotificationsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, read: true }));
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, list);
  },

  clearNotifications(): void {
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, []);
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getStorageItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  addAuditLog(action: string, actorEmail: string, actorRole: UserRole, details: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      actorEmail,
      actorRole,
      details,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    setStorageItem(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 150));
  },
};
