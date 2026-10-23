import React, { useState } from 'react';
import {
  Hotel,
  Plus,
  Search,
  SlidersHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Bed,
  Users,
  Sparkles,
  Wrench,
  DollarSign
} from 'lucide-react';
import { Room, RoomType, HousekeepingStatus, MaintenanceStatus, RoomAvailabilityStatus } from '../types/hotel';
import { StorageService } from '../services/storage';

interface RoomManagementProps {
  rooms: Room[];
  onRefreshData: () => void;
}

export const RoomManagement: React.FC<RoomManagementProps> = ({
  rooms,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('Deluxe');
  const [description, setDescription] = useState('');
  const [pricePerNight, setPricePerNight] = useState<number>(250);
  const [maxGuests, setMaxGuests] = useState<number>(2);
  const [bedType, setBedType] = useState('1 King Bed');
  const [floor, setFloor] = useState<number>(2);
  const [amenitiesInput, setAmenitiesInput] = useState('High-speed Wi-Fi, Smart TV 55", Nespresso Bar, Rainfall Shower');
  const [imageUrl, setImageUrl] = useState('/src/assets/images/room_deluxe_king_1792750011005.jpg');
  const [availabilityStatus, setAvailabilityStatus] = useState<RoomAvailabilityStatus>('available');
  const [housekeepingStatus, setHousekeepingStatus] = useState<HousekeepingStatus>('clean');
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus>('operational');

  const filteredRooms = rooms.filter((r) => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (statusFilter !== 'all' && r.availabilityStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = r.roomNumber.toLowerCase().includes(q);
      const matchType = r.type.toLowerCase().includes(q);
      const matchBed = r.bedType.toLowerCase().includes(q);
      if (!matchNum && !matchType && !matchBed) return false;
    }
    return true;
  });

  const openAddModal = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setRoomType('Deluxe');
    setDescription('Serene luxury suite with tailored hardwood millwork, plush king bedding, and ocean-facing veranda.');
    setPricePerNight(260);
    setMaxGuests(3);
    setBedType('1 King Bed');
    setFloor(2);
    setAmenitiesInput('High-speed Wi-Fi, Smart TV 55", Nespresso Bar, Rainfall Shower, Bathrobes');
    setImageUrl('/src/assets/images/room_deluxe_king_1792750011005.jpg');
    setAvailabilityStatus('available');
    setHousekeepingStatus('clean');
    setMaintenanceStatus('operational');
    setIsModalOpen(true);
    setErrorMessage('');
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setRoomType(room.type);
    setDescription(room.description);
    setPricePerNight(room.pricePerNight);
    setMaxGuests(room.maxGuests);
    setBedType(room.bedType);
    setFloor(room.floor);
    setAmenitiesInput(room.amenities.join(', '));
    setImageUrl(room.imageUrl);
    setAvailabilityStatus(room.availabilityStatus);
    setHousekeepingStatus(room.housekeepingStatus);
    setMaintenanceStatus(room.maintenanceStatus);
    setIsModalOpen(true);
    setErrorMessage('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');

    const amenities = amenitiesInput
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    if (editingRoom) {
      const result = StorageService.updateRoom(editingRoom.id, {
        roomNumber,
        type: roomType,
        description,
        pricePerNight: Number(pricePerNight),
        maxGuests: Number(maxGuests),
        bedType,
        floor: Number(floor),
        amenities,
        imageUrl,
        availabilityStatus,
        housekeepingStatus,
        maintenanceStatus,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to update room.');
        return;
      }

      setMessage(`Room ${roomNumber} updated successfully.`);
      setIsModalOpen(false);
      onRefreshData();
    } else {
      const result = StorageService.addRoom({
        roomNumber,
        type: roomType,
        description,
        pricePerNight: Number(pricePerNight),
        maxGuests: Number(maxGuests),
        bedType,
        floor: Number(floor),
        amenities,
        imageUrl,
        availabilityStatus,
        housekeepingStatus,
        maintenanceStatus,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to create room.');
        return;
      }

      setMessage(`Room ${roomNumber} added to inventory.`);
      setIsModalOpen(false);
      onRefreshData();
    }
  };

  const handleDeleteRoom = (room: Room) => {
    if (!window.confirm(`Are you sure you want to delete Room ${room.roomNumber}?`)) return;
    setErrorMessage('');
    setMessage('');

    const res = StorageService.deleteRoom(room.id);
    if (!res.success) {
      setErrorMessage(res.error || 'Cannot delete room.');
      return;
    }

    setMessage(`Room ${room.roomNumber} has been removed from inventory.`);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Accommodations Inventory
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Room Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure hotel rooms, price per night, floor assignments, amenities, and operational availability.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          Add New Room
        </button>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by Room Number, Type, or Bed Type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-900 bg-transparent focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Category:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
            >
              <option value="all">All Categories</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
              <option value="Family">Family</option>
              <option value="Executive">Executive</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Room</th>
                <th className="py-3.5 px-4">Category & Bed</th>
                <th className="py-3.5 px-4">Floor & Capacity</th>
                <th className="py-3.5 px-4 text-right">Price / Night</th>
                <th className="py-3.5 px-4 text-center">Housekeeping</th>
                <th className="py-3.5 px-4 text-center">Maintenance</th>
                <th className="py-3.5 px-4 text-center">Availability</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-sm text-slate-900">
                      Room {room.roomNumber}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{room.type}</div>
                    <div className="text-[11px] text-slate-500">{room.bedType}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div>Floor {room.floor}</div>
                    <div className="text-[11px] text-slate-500">Max {room.maxGuests} guests</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    ${room.pricePerNight}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`capitalize px-2 py-0.5 rounded text-[11px] font-semibold ${
                        room.housekeepingStatus === 'clean' || room.housekeepingStatus === 'inspected'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {room.housekeepingStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`capitalize px-2 py-0.5 rounded text-[11px] font-semibold ${
                        room.maintenanceStatus === 'operational'
                          ? 'text-slate-600'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {room.maintenanceStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`capitalize px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        room.availabilityStatus === 'available'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : room.availabilityStatus === 'occupied'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : room.availabilityStatus === 'maintenance'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {room.availabilityStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(room)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit room details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold font-display text-slate-900">
                {editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add New Hotel Room'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                    placeholder="e.g. 204"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Category *</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Family">Family</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price / Night ($) *</label>
                  <input
                    type="number"
                    min={50}
                    step={5}
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Guests *</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Floor *</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bed Configuration *</label>
                <input
                  type="text"
                  value={bedType}
                  onChange={(e) => setBedType(e.target.value)}
                  placeholder="e.g. 1 California King Bed"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amenities (comma-separated)</label>
                <input
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Status selectors */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Availability</label>
                  <select
                    value={availabilityStatus}
                    onChange={(e) => setAvailabilityStatus(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Housekeeping</label>
                  <select
                    value={housekeepingStatus}
                    onChange={(e) => setHousekeepingStatus(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="clean">Clean</option>
                    <option value="dirty">Dirty</option>
                    <option value="in_progress">In Progress</option>
                    <option value="inspected">Inspected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Maintenance</label>
                  <select
                    value={maintenanceStatus}
                    onChange={(e) => setMaintenanceStatus(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="operational">Operational</option>
                    <option value="needs_repair">Needs Repair</option>
                    <option value="under_maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer shadow-xs"
                >
                  {editingRoom ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
