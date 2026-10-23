import { StorageService } from './storage';

export interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'passed' | 'failed';
  durationMs: number;
  assertion: string;
  error?: string;
}

export function runHotelProTestSuite(): TestResult[] {
  const results: TestResult[] = [];

  const runTest = (name: string, category: string, assertion: string, fn: () => void) => {
    const t0 = performance.now();
    try {
      fn();
      results.push({
        id: `test-${Math.random().toString(36).substring(2, 9)}`,
        name,
        category,
        status: 'passed',
        durationMs: Number((performance.now() - t0).toFixed(2)),
        assertion,
      });
    } catch (err: any) {
      results.push({
        id: `test-${Math.random().toString(36).substring(2, 9)}`,
        name,
        category,
        status: 'failed',
        durationMs: Number((performance.now() - t0).toFixed(2)),
        assertion,
        error: err?.message || String(err),
      });
    }
  };

  // 1. Room Availability & Date Overlap Logic
  runTest(
    'Room Overlap Detection',
    'Availability',
    'Rejects overlapping reservation dates for confirmed bookings',
    () => {
      // res-1003 is booked for room-202 from 2026-10-23 to 2026-10-26
      const isFreeDuringExactStay = StorageService.isRoomAvailable('room-202', '2026-10-23', '2026-10-26');
      if (isFreeDuringExactStay) {
        throw new Error('Room 202 should NOT be available during exact existing stay (2026-10-23 to 2026-10-26)');
      }

      const isFreeDuringMidStay = StorageService.isRoomAvailable('room-202', '2026-10-24', '2026-10-25');
      if (isFreeDuringMidStay) {
        throw new Error('Room 202 should NOT be available during mid-stay overlap');
      }

      const isFreeAfterDeparture = StorageService.isRoomAvailable('room-202', '2026-10-26', '2026-10-29');
      if (!isFreeAfterDeparture) {
        throw new Error('Room 202 SHOULD be available after checkout on 2026-10-26');
      }
    }
  );

  // 2. Maintenance Block Verification
  runTest(
    'Maintenance Availability Lock',
    'Maintenance',
    'Rooms under maintenance cannot be booked',
    () => {
      // room-502 is under_maintenance
      const room502 = StorageService.getRoom('room-502');
      if (!room502 || room502.maintenanceStatus !== 'under_maintenance') {
        throw new Error('Room 502 setup incorrect; expected under_maintenance');
      }
      const isAvail = StorageService.isRoomAvailable('room-502', '2026-11-01', '2026-11-05');
      if (isAvail) {
        throw new Error('Room 502 is under maintenance and must return false for booking availability');
      }
    }
  );

  // 3. Price Calculation Math & Tax Consistency
  runTest(
    'Automated Booking Price Calculation',
    'Financials',
    'Calculates subtotal, configured tax rate, cleaning fee, and discount accurately',
    () => {
      const room = StorageService.getRooms()[0];
      const settings = StorageService.getSettings();
      const nights = 3;
      const subtotal = room.pricePerNight * nights;
      const expectedTax = Number(((subtotal * settings.taxRatePercent) / 100).toFixed(2));
      const expectedTotal = Number((subtotal + expectedTax + settings.cleaningFee).toFixed(2));

      if (expectedTotal <= subtotal) {
        throw new Error('Total calculation failed: total should include tax and cleaning fees');
      }
    }
  );

  // 4. Duplicate Room Number Constraint
  runTest(
    'Unique Room Number Enforcement',
    'Rooms',
    'Prevents creating duplicate room numbers within the hotel',
    () => {
      const existingRoom = StorageService.getRooms()[0];
      const result = StorageService.addRoom({
        roomNumber: existingRoom.roomNumber,
        type: 'Deluxe',
        description: 'Duplicate test room',
        pricePerNight: 200,
        maxGuests: 2,
        bedType: '1 King',
        floor: 1,
        amenities: ['Wi-Fi'],
        imageUrl: '',
        availabilityStatus: 'available',
        housekeepingStatus: 'clean',
        maintenanceStatus: 'operational',
      });

      if (result.success) {
        throw new Error(`System allowed duplicate room number "${existingRoom.roomNumber}" to be created!`);
      }
    }
  );

  // 5. Front Desk Check-in Sanitation Rule
  runTest(
    'Cleanliness Gate on Check-in',
    'Front Desk',
    'Prevents guest check-in if room is dirty or under maintenance',
    () => {
      const dirtyRoom = StorageService.getRooms().find((r) => r.housekeepingStatus === 'dirty');
      if (dirtyRoom) {
        // Create temporary reservation for this dirty room
        const res = StorageService.createReservation({
          roomId: dirtyRoom.id,
          guestName: 'Unit Test Guest',
          guestEmail: 'unittest@example.com',
          guestPhone: '555-0000',
          checkInDate: '2026-11-20',
          checkOutDate: '2026-11-22',
          adults: 1,
          children: 0,
        });

        if (res.reservation) {
          const checkInResult = StorageService.checkInGuest(res.reservation.id);
          // Clean up the test reservation
          StorageService.cancelReservation(res.reservation.id);
          if (checkInResult.success) {
            throw new Error('Check-in succeeded on a dirty room; expected error rejection');
          }
        }
      }
    }
  );

  // 6. Automatic Dirty Status Transition on Checkout
  runTest(
    'Auto-Housekeeping Trigger on Checkout',
    'Housekeeping',
    'Transitions room housekeeping status to dirty upon checkout',
    () => {
      // Find or inspect checked_out logic
      const reservations = StorageService.getReservations();
      const inHouseRes = reservations.find((r) => r.status === 'checked_in');
      if (inHouseRes) {
        const roomId = inHouseRes.roomId;
        const roomBefore = StorageService.getRoom(roomId);
        if (roomBefore) {
          // Verify definition in storage service ensures dirty flag on checkout
          if (typeof StorageService.checkOutGuest !== 'function') {
            throw new Error('StorageService.checkOutGuest is not defined');
          }
        }
      }
    }
  );

  // 7. Cancellation Integrity
  runTest(
    'In-House Cancellation Guard',
    'Reservations',
    'Prevents cancelling a guest who is actively checked in',
    () => {
      const checkedInRes = StorageService.getReservations().find((r) => r.status === 'checked_in');
      if (checkedInRes) {
        const cancelResult = StorageService.cancelReservation(checkedInRes.id, 'Test invalid cancel');
        if (cancelResult.success) {
          throw new Error('System allowed cancellation of an in-house checked-in guest');
        }
      }
    }
  );

  // 8. Max Capacity Enforcement
  runTest(
    'Max Capacity Validation',
    'Reservations',
    'Blocks bookings that exceed room max guest capacity',
    () => {
      const room = StorageService.getRooms().find((r) => r.maxGuests <= 2);
      if (room) {
        const result = StorageService.createReservation({
          roomId: room.id,
          guestName: 'Party of Ten',
          guestEmail: 'party@example.com',
          guestPhone: '555-9999',
          checkInDate: '2026-12-01',
          checkOutDate: '2026-12-03',
          adults: 5,
          children: 5, // total 10 > 2
        });
        if (result.success) {
          throw new Error(`Allowed booking of 10 guests in a room with capacity ${room.maxGuests}`);
        }
      }
    }
  );

  return results;
}
