import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  User,
  ShieldAlert,
  X,
  Layers
} from 'lucide-react';
import { MaintenanceRequest, Room, StaffMember } from '../types/hotel';
import { StorageService } from '../services/storage';

interface MaintenanceModuleProps {
  rooms: Room[];
  staff: StaffMember[];
  requests: MaintenanceRequest[];
  onRefreshData: () => void;
}

export const MaintenanceModule: React.FC<MaintenanceModuleProps> = ({
  rooms,
  staff,
  requests,
  onRefreshData,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(rooms.length > 0 ? rooms[0].id : '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [message, setMessage] = useState('');

  const maintenanceStaff = staff.filter((s) => s.department === 'Maintenance' && s.active);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const room = rooms.find((r) => r.id === selectedRoomId);
    if (!room) return;

    const assigned = staff.find((s) => s.id === assignedStaffId);

    StorageService.createMaintenanceRequest({
      roomId: room.id,
      roomNumber: room.roomNumber,
      title,
      description,
      priority,
      status: 'reported',
      reportedBy: 'Front Desk Operator',
      assignedStaffId: assignedStaffId || undefined,
      assignedStaffName: assigned?.fullName,
    });

    setMessage(`Maintenance issue reported for Room ${room.roomNumber}. ${priority === 'urgent' || priority === 'high' ? 'Room locked from booking.' : ''}`);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    onRefreshData();
    setTimeout(() => setMessage(''), 4000);
  };

  const handleResolveRequest = (id: string) => {
    StorageService.resolveMaintenanceRequest(id);
    setMessage('Maintenance issue resolved. Room operational status restored.');
    onRefreshData();
    setTimeout(() => setMessage(''), 4000);
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-300">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Facilities & Engineering
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Room Maintenance & Repair Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log engineering tickets, assign technicians, track repair lifecycles, and automatically freeze booking availability for rooms needing maintenance.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          Report Room Issue
        </button>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Maintenance Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">All facilities fully operational</h3>
            <p className="text-xs text-slate-500 mt-1">No outstanding maintenance tickets.</p>
          </div>
        ) : (
          requests.map((ticket) => {
            const isCompleted = ticket.status === 'completed';

            return (
              <div
                key={ticket.id}
                className={`p-5 bg-white rounded-2xl border shadow-xs flex flex-col justify-between ${
                  isCompleted ? 'border-slate-200 opacity-75' : 'border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      Room {ticket.roomNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(ticket.priority)}
                      <span
                        className={`text-[11px] font-semibold capitalize ${
                          isCompleted ? 'text-emerald-600' : 'text-blue-600'
                        }`}
                      >
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{ticket.title}</h3>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {ticket.description}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reported By</span>
                      <span className="font-semibold text-slate-800">{ticket.reportedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Technician</span>
                      <span className="font-semibold text-slate-800">{ticket.assignedStaffName || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reported At</span>
                      <span className="font-mono text-[11px] text-slate-600">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  {!isCompleted ? (
                    <button
                      onClick={() => handleResolveRequest(ticket.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Resolved & Unlock Room
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold font-display text-slate-900">
                Log New Maintenance Ticket
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Room *</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} ({r.type} · Floor {r.floor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Headline *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bathroom shower pressure low / HVAC error code E-12"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the failure, parts needed, and safety implications..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority Level *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="low">Low (Cosmetic, doesn't block room)</option>
                    <option value="medium">Medium (Repair during turnover)</option>
                    <option value="high">High (Immediate inspection)</option>
                    <option value="urgent">Urgent (Lock room from reservations)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Technician</label>
                  <select
                    value={assignedStaffId}
                    onChange={(e) => setAssignedStaffId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="">Unassigned</option>
                    {maintenanceStaff.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.shift.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-normal">
                Selecting <span className="font-bold text-rose-600">Urgent</span> or <span className="font-bold text-orange-600">High</span> automatically places the room into <span className="font-mono font-bold">under_maintenance</span> status, instantly preventing guests or receptionists from double-booking it.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
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
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
