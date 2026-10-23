export type UserRole = 'admin' | 'receptionist' | 'staff' | 'guest';

export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Family' | 'Executive';

export type RoomAvailabilityStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';

export type HousekeepingStatus = 'clean' | 'dirty' | 'in_progress' | 'inspected';

export type MaintenanceStatus = 'operational' | 'needs_repair' | 'under_maintenance';

export type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'partially_refunded' | 'refunded';

export type PaymentMethod = 'credit_card' | 'cash' | 'bank_transfer' | 'stripe';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  bedType: string;
  floor: number;
  amenities: string[];
  imageUrl: string;
  availabilityStatus: RoomAvailabilityStatus;
  housekeepingStatus: HousekeepingStatus;
  maintenanceStatus: MaintenanceStatus;
  notes?: string;
}

export interface Guest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country: string;
  idNumber?: string; // passport or national id
  specialRequests?: string;
  staffNotes?: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  bookingReference: string; // e.g. HP-83921-A
  roomId: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  actualCheckInTime?: string; // ISO
  actualCheckOutTime?: string; // ISO
  adults: number;
  children: number;
  nights: number;
  roomRate: number;
  subtotal: number;
  taxAmount: number;
  cleaningFee: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  specialRequests?: string;
  assignedStaffId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  reservationId: string;
  bookingReference: string;
  guestName: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef: string;
  stripePaymentIntentId?: string;
  notes?: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  department: 'Management' | 'Front Desk' | 'Housekeeping' | 'Maintenance' | 'Security';
  shift: 'Morning (07:00 - 15:30)' | 'Evening (15:00 - 23:30)' | 'Night (23:00 - 07:30)';
  active: boolean;
  assignedRooms?: string[]; // room numbers
}

export interface MaintenanceRequest {
  id: string;
  roomId: string;
  roomNumber: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'reported' | 'in_progress' | 'completed' | 'cancelled';
  reportedBy: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  createdAt: string;
  completedAt?: string;
}

export interface HotelNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'checkin' | 'checkout' | 'payment' | 'housekeeping' | 'maintenance' | 'system';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface HotelSettings {
  id: string;
  hotelName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  currencySymbol: string;
  taxRatePercent: number; // e.g. 12%
  cleaningFee: number;
  checkInTime: string; // e.g. "15:00"
  checkOutTime: string; // e.g. "11:00"
  cancellationPolicy: string;
  stripeEnabled: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  actorEmail: string;
  actorRole: UserRole;
  details: string;
  timestamp: string;
}

export interface AvailabilitySearchCriteria {
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomType?: RoomType;
}
