import React, { useState } from 'react';
import {
  Users,
  Bed,
  Layers,
  Check,
  CalendarCheck,
  SlidersHorizontal,
  Sparkles,
  Info
} from 'lucide-react';
import { Room, RoomType } from '../types/hotel';

interface RoomCatalogProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
  selectedCategory?: RoomType | '';
}

export const RoomCatalog: React.FC<RoomCatalogProps> = ({
  rooms,
  onSelectRoom,
  selectedCategory: initialCategory = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(800);
  const [capacityFilter, setCapacityFilter] = useState<number>(0);

  const categories = ['all', 'Standard', 'Deluxe', 'Suite', 'Family', 'Executive'];

  const filteredRooms = rooms.filter((room) => {
    if (activeCategory !== 'all' && room.type !== activeCategory) return false;
    if (room.pricePerNight > maxPrice) return false;
    if (capacityFilter > 0 && room.maxGuests < capacityFilter) return false;
    return true;
  });

  const getStatusTextBadge = (room: Room) => {
    if (room.maintenanceStatus === 'under_maintenance') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Under Maintenance
        </span>
      );
    }
    if (room.housekeepingStatus === 'dirty') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Cleaning Required
        </span>
      );
    }
    if (room.availabilityStatus === 'occupied') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          Currently Occupied
        </span>
      );
    }
    if (room.availabilityStatus === 'reserved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Reserved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Ready for Booking
      </span>
    );
  };

  return (
    <section id="rooms-section" className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-200">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
              Accommodations
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-display">
              Rooms, Suites & Family Residences
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Each room at The Grand Luminaire combines architectural serenity, handcrafted furnishings, and modern hospitality technology.
            </p>
          </div>

          {/* Interactive Category Tabs (Button segmented controls) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {cat === 'all' ? 'All Rooms' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-8 p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">Filters:</span>
            </div>

            <div className="flex items-center gap-2">
              <span>Max Price:</span>
              <span className="font-mono font-bold text-slate-900">${maxPrice}/night</span>
              <input
                type="range"
                min={150}
                max={800}
                step={25}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <span>Min Capacity:</span>
              <select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(Number(e.target.value))}
                className="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-800 font-medium"
              >
                <option value={0}>Any</option>
                <option value={2}>2+ Guests</option>
                <option value={3}>3+ Guests</option>
                <option value={4}>4+ Guests</option>
              </select>
            </div>
          </div>

          <div className="text-slate-500">
            Showing <span className="font-bold font-mono text-slate-900">{filteredRooms.length}</span> rooms
          </div>
        </div>

        {/* Room Cards Grid */}
        {filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <Info className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No rooms match your filter criteria</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your maximum price slider or changing the room category.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setMaxPrice(800);
                setCapacityFilter(0);
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => {
              const isBlocked = room.maintenanceStatus === 'under_maintenance';

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  {/* Image with fallback */}
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                    <img
                      src={room.imageUrl || '/src/assets/images/room_deluxe_king_1792750011005.jpg'}
                      alt={`${room.type} Room ${room.roomNumber}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-slate-900/90 text-white text-xs font-semibold rounded-md backdrop-blur-xs font-mono">
                        Room {room.roomNumber}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      {getStatusTextBadge(room)}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Quiet unboxed metadata */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <span className="font-semibold text-amber-700">{room.type} Suite</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-slate-400" />
                          Floor {room.floor}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          Up to {room.maxGuests} Guests
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">
                        {room.type} {room.bedType}
                      </h3>

                      <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed mb-4">
                        {room.description}
                      </p>

                      {/* Key Amenities */}
                      <div className="grid grid-cols-2 gap-2 mb-6">
                        {room.amenities.slice(0, 4).map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                          ${room.pricePerNight}
                        </span>
                        <span className="text-xs text-slate-500"> / night</span>
                      </div>

                      <button
                        onClick={() => onSelectRoom(room)}
                        disabled={isBlocked}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isBlocked
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                        }`}
                      >
                        <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
                        {isBlocked ? 'Unavailable' : 'Book Room'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
