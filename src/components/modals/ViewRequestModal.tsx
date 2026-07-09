import { RideRequest } from "../../types";

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 transition-all animate-in fade-in duration-200 sm:p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-hidden border border-slate-100 flex flex-col">
        <div className="bg-[#0b1b6e] text-white px-4 py-5 flex items-center justify-between gap-3 sm:px-6">
          <div className="min-w-0 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">Ride Booking Audit</span>
            <h3 className="break-anywhere font-bold text-base sm:text-lg">Request #{viewingRequest.id.toString().slice(-6)}</h3>
          </div>
          <button onClick={onClose} className="text-white/85 hover:text-white transition-colors cursor-pointer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex flex-col gap-6 text-left overflow-y-auto sm:p-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Passenger</p>
              <p className="break-anywhere font-bold text-[#091b6f] text-base mt-0.5">{viewingRequest.passenger}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Assigned Driver</p>
              <p className="break-anywhere font-bold text-slate-700 text-base mt-0.5">{viewingRequest.driver}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pickup Location</p>
              <p className="break-anywhere font-bold text-slate-700 mt-0.5">{viewingRequest.location}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Destination</p>
              <p className="break-anywhere font-bold text-slate-700 mt-0.5">{viewingRequest.destination || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pickup Coordinates</p>
              <p className="font-bold text-slate-700 mt-0.5">
                {viewingRequest.pickupLatitude && viewingRequest.pickupLongitude
                  ? `${viewingRequest.pickupLatitude.toFixed(5)}, ${viewingRequest.pickupLongitude.toFixed(5)}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Drop-off Coordinates</p>
              <p className="font-bold text-slate-700 mt-0.5">
                {viewingRequest.dropoffLatitude && viewingRequest.dropoffLongitude
                  ? `${viewingRequest.dropoffLatitude.toFixed(5)}, ${viewingRequest.dropoffLongitude.toFixed(5)}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fare Value</p>
              <p className="font-extrabold text-[#091b6f] text-lg mt-0.5">
                ₱{viewingRequest.fare.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Booking Time</p>
              <p className="font-bold text-slate-500 mt-0.5">{viewingRequest.time}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Driver Earning</p>
              <p className="font-extrabold text-emerald-700 text-lg mt-0.5">
                {viewingRequest.earningAmount > 0
                  ? `₱${viewingRequest.earningAmount.toLocaleString()}`
                  : "Not recorded yet"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Earning Date</p>
              <p className="font-bold text-slate-500 mt-0.5">{viewingRequest.earningDate || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">TODA Association</p>
              <p className="break-anywhere font-bold text-slate-600 mt-0.5">{viewingRequest.toda}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ride Status</p>
              <div className="mt-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${viewingRequest.status === "Completed"
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
        </div>
      </div>
    </div>
  );
}
