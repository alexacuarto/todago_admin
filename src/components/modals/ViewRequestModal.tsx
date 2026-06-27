import React from "react";
import { RideRequest } from "../../data/mockData";

interface ViewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewingRequest: RideRequest | null;
}

export default function ViewRequestModal({
  isOpen,
  onClose,
  viewingRequest,
}: ViewRequestModalProps) {
  if (!isOpen || !viewingRequest) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col">
        <div className="bg-[#0b1b6e] text-white px-6 py-5 flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">Ride Booking Audit</span>
            <h3 className="font-bold text-lg">Request #{viewingRequest.id.toString().slice(-6)}</h3>
          </div>
          <button onClick={onClose} className="text-white/85 hover:text-white transition-colors cursor-pointer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 text-left">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Passenger</p>
              <p className="font-bold text-[#091b6f] text-base mt-0.5">{viewingRequest.passenger}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Assigned Driver</p>
              <p className="font-bold text-slate-700 text-base mt-0.5">{viewingRequest.driver}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pickup Location</p>
              <p className="font-bold text-slate-700 mt-0.5">{viewingRequest.location}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Destination</p>
              <p className="font-bold text-slate-700 mt-0.5">{viewingRequest.destination || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fare Value</p>
              <p className="font-extrabold text-[#091b6f] text-lg mt-0.5">₱{viewingRequest.fare}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Booking Time</p>
              <p className="font-bold text-slate-500 mt-0.5">{viewingRequest.time}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">TODA Association</p>
              <p className="font-bold text-slate-600 mt-0.5">{viewingRequest.toda}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ride Status</p>
              <div className="mt-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                    viewingRequest.status === "Completed"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : viewingRequest.status === "In Transit"
                      ? "bg-emerald-500 text-white border border-emerald-600"
                      : viewingRequest.status === "Pending"
                      ? "bg-amber-50 text-amber-600 border border-amber-100"
                      : viewingRequest.status === "Scheduled"
                      ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                      : "bg-rose-50 text-rose-600 border border-rose-100"
                  }`}
                >
                  {viewingRequest.status}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 mt-2 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#091b6f] hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-sm hover:shadow"
            >
              Close Audit Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
