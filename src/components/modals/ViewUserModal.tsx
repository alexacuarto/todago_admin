import React from "react";
import { Driver, Passenger } from "../../data/mockData";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewingUser: any;
  viewingUserType: "driver" | "passenger" | null;
  onDeactivateDriverToggle: (id: number) => void;
  onDeactivatePassengerToggle: (id: number) => void;
  onIncrementCanceledTrips: (id: number) => void;
  onResetCanceledTrips: (id: number) => void;
}

export default function ViewUserModal({
  isOpen,
  onClose,
  viewingUser,
  viewingUserType,
  onDeactivateDriverToggle,
  onDeactivatePassengerToggle,
  onIncrementCanceledTrips,
  onResetCanceledTrips,
}: ViewUserModalProps) {
  if (!isOpen || !viewingUser) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95">
        <div className="bg-[#0b1b6e] text-white px-6 py-5 flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
              {viewingUserType === "driver" ? "Driver Profile Audit" : "Passenger Account Audit"}
            </span>
            <h3 className="font-bold text-lg">{viewingUser.name}</h3>
          </div>
          <button onClick={onClose} className="text-white/85 hover:text-white transition-colors cursor-pointer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 text-left">
          {/* Account Overview Cards */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0 font-extrabold text-xl">
              {viewingUser.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#091b6f] text-md">{viewingUser.name}</h4>
              <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">
                {viewingUserType === "driver" ? "Tricycle Operator / Driver" : "Passenger Client"}
              </p>
            </div>
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${
                  viewingUser.status === "Active"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-rose-50 text-rose-600 border-rose-100"
                }`}
              >
                {viewingUser.status}
              </span>
            </div>
          </div>

          {/* Data Grid based on Type */}
          {viewingUserType === "driver" ? (
            // Driver Specific Data
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">TODA Association</p>
                <p className="font-bold text-slate-700 mt-0.5">{(viewingUser as Driver).toda}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">License Number</p>
                <p className="font-bold text-slate-700 mt-0.5 font-mono">{(viewingUser as Driver).license}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tricycle Body Number</p>
                <p className="font-bold text-slate-700 mt-0.5">{(viewingUser as Driver).bodyNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Plate Number</p>
                <p className="font-bold text-[#091b6f] font-mono mt-0.5">{(viewingUser as Driver).plateNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Contact Phone</p>
                <p className="font-bold text-slate-700 mt-0.5">{(viewingUser as Driver).phone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Joined Date</p>
                <p className="font-bold text-slate-500 mt-0.5">{(viewingUser as Driver).joinedDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                <p className="font-bold text-slate-600 mt-0.5">{(viewingUser as Driver).email || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Completed Trips</p>
                <p className="font-extrabold text-[#091b6f] text-md mt-0.5">{(viewingUser as Driver).trips} Rides</p>
              </div>
            </div>
          ) : (
            // Passenger Specific Data
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Contact Number</p>
                <p className="font-bold text-slate-700 mt-0.5">{(viewingUser as Passenger).contact}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Joined Date</p>
                <p className="font-bold text-slate-500 mt-0.5">{(viewingUser as Passenger).joinedDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Rides Taken</p>
                <p className="font-extrabold text-[#091b6f] mt-0.5">{(viewingUser as Passenger).ridesTaken} Rides</p>
              </div>

              {/* Canceled Trips with limit deactivation */}
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Canceled Trips</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`font-extrabold text-sm px-2 py-0.5 rounded-md ${
                      (viewingUser as Passenger).canceledTrips >= 3 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {(viewingUser as Passenger).canceledTrips} / 3 Cancelled
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Controls */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Administrative Actions</h4>
            <div className="flex flex-wrap gap-2">
              {/* Status Toggle (Deactivate / Activate) */}
              {viewingUserType === "driver" ? (
                <button
                  onClick={() => onDeactivateDriverToggle(viewingUser.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    viewingUser.status === "Active" ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  }`}
                >
                  {viewingUser.status === "Active" ? "Deactivate Driver" : "Activate Driver"}
                </button>
              ) : (
                <div className="flex gap-2 items-center flex-wrap">
                  <button
                    onClick={() => onDeactivatePassengerToggle(viewingUser.id)}
                    disabled={(viewingUser as Passenger).canceledTrips >= 3 && viewingUser.status === "Inactive"}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-30 disabled:cursor-not-allowed ${
                      viewingUser.status === "Active" ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    {viewingUser.status === "Active" ? "Deactivate Passenger" : "Activate Passenger"}
                  </button>

                  {/* Passenger Cancel Trips Simulation */}
                  <button
                    onClick={() => onIncrementCanceledTrips(viewingUser.id)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Simulate Canceled Trip
                  </button>

                  {/* Reset Cancel Trips */}
                  {(viewingUser as Passenger).canceledTrips > 0 && (
                    <button
                      onClick={() => onResetCanceledTrips(viewingUser.id)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Reset & Reactivate
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Auto deactivation note */}
            {viewingUserType === "passenger" && (viewingUser as Passenger).canceledTrips >= 3 && (
              <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl border border-rose-100 text-xs font-semibold flex items-center gap-2 mt-1">
                <span className="text-lg">⚠️</span>
                <span>Passenger is deactivated. Canceled trip threshold (3) has been reached! Reset canceled trips to reactivate.</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-5 mt-2 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#091b6f] hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-xs hover:shadow"
            >
              Close Account Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
