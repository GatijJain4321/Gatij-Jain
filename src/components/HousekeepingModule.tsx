import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Room, HousekeepingStatus, StaffMember } from '../types/hotel';
import { StorageService } from '../services/storage';

interface HousekeepingModuleProps {
  rooms: Room[];
  staff: StaffMember[];
  onRefreshData: () => void;
}

export const HousekeepingModule: React.FC<HousekeepingModuleProps> = ({
  rooms,
  staff,
  onRefreshData,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [message, setMessage] = useState('');

  const housekeepingStaff = staff.filter((s) => s.department === 'Housekeeping' && s.active);

  const filteredRooms = rooms.filter((r) => {
    if (selectedFloor !== 'all' && r.floor !== selectedFloor) return false;
    return true;
  });

  const dirtyRooms = filteredRooms.filter((r) => r.housekeepingStatus === 'dirty');
  const inProgressRooms = filteredRooms.filter((r) => r.housekeepingStatus === 'in_progress');
  const cleanRooms = filteredRooms.filter((r) => r.housekeepingStatus === 'clean');
  const inspectedRooms = filteredRooms.filter((r) => r.housekeepingStatus === 'inspected');

  const handleUpdateStatus = (roomId: string, newStatus: HousekeepingStatus) => {
    StorageService.updateHousekeepingStatus(roomId, newStatus);
    const room = rooms.find((r) => r.id === roomId);
    setMessage(`Room ${room?.roomNumber || ''} moved to ${newStatus.toUpperCase()}`);
    onRefreshData();
    setTimeout(() => setMessage(''), 3000);
  };

  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Sanitation & Quality Control
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Housekeeping Management Board
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track real-time room cleanliness lanes: Dirty departures, active servicing, cleaned, and supervisor-inspected rooms.
          </p>
        </div>

        {/* Floor Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-semibold">Floor Filter:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedFloor('all')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                selectedFloor === 'all' ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600'
              }`}
            >
              All
            </button>
            {floors.map((fl) => (
              <button
                key={fl}
                onClick={() => setSelectedFloor(fl)}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                  selectedFloor === fl ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600'
                }`}
              >
                F{fl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* 4-Lane Housekeeping Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lane 1: Dirty / Turnover Needed */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Dirty / Turnover
                </h3>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                {dirtyRooms.length}
              </span>
            </div>

            <div className="space-y-3">
              {dirtyRooms.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No dirty rooms pending.
                </div>
              ) : (
                dirtyRooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        Room {room.roomNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Floor {room.floor} · {room.type}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">{room.bedType}</div>

                    <button
                      onClick={() => handleUpdateStatus(room.id, 'in_progress')}
                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Start Cleaning</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lane 2: In Progress */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  In Progress
                </h3>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                {inProgressRooms.length}
              </span>
            </div>

            <div className="space-y-3">
              {inProgressRooms.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No rooms being serviced currently.
                </div>
              ) : (
                inProgressRooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-3.5 bg-white rounded-xl border border-amber-300 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        Room {room.roomNumber}
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                        Active Cleaning
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">Floor {room.floor} · {room.type}</div>

                    <button
                      onClick={() => handleUpdateStatus(room.id, 'clean')}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Clean</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lane 3: Clean (Awaiting Inspection) */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Clean (Awaiting Inspection)
                </h3>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {cleanRooms.length}
              </span>
            </div>

            <div className="space-y-3">
              {cleanRooms.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No rooms awaiting supervisor audit.
                </div>
              ) : (
                cleanRooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        Room {room.roomNumber}
                      </span>
                      <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">
                        Floor {room.floor}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">{room.type} · Ready for Check-in</div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(room.id, 'inspected')}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Inspect & Approve</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lane 4: Inspected & Certified */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Inspected & Certified
                </h3>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {inspectedRooms.length}
              </span>
            </div>

            <div className="space-y-3">
              {inspectedRooms.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No inspected rooms currently.
                </div>
              ) : (
                inspectedRooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-3.5 bg-white rounded-xl border border-emerald-300 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        Room {room.roomNumber}
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                        Certified VIP Ready
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">Floor {room.floor} · {room.type}</div>

                    <button
                      onClick={() => handleUpdateStatus(room.id, 'dirty')}
                      className="w-full py-1 text-[11px] text-slate-400 hover:text-slate-700 underline cursor-pointer"
                    >
                      Re-flag as Dirty
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
