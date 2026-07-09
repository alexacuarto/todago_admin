import { useState, useEffect } from "react";
import { Driver, Passenger } from "../../types";
import { getActivityBadgeClasses } from "../../lib/driverActivity";
import { supabase } from "../../lib/supabase";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewingUser: any;
  viewingUserType: "driver" | "passenger" | null;
  onDeactivateDriverToggle: (id: string) => void;
  onDeactivatePassengerToggle: (id: string) => void;
  onIncrementCanceledTrips: (id: string) => void;
  onResetCanceledTrips: (id: string) => void;
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
  const [showZoom, setShowZoom] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);

  useEffect(() => {
    if (isOpen && viewingUserType === "driver" && viewingUser?.licensePhotoUrl) {
      setLoadingSignedUrl(true);
      const url = viewingUser.licensePhotoUrl;
      let path = url;
      if (url.includes('/driver-documents/')) {
        const parts = url.split('/driver-documents/');
        path = parts[parts.length - 1];
      } else if (url.includes('/licenses/')) {
        const parts = url.split('/licenses/');
        path = parts[parts.length - 1];
      } else {
        path = url.split('/').pop() || '';
      }
      path = decodeURIComponent(path);

      const bucketName = url.includes('/licenses/') ? 'licenses' : 'driver-documents';

      supabase.storage
        .from(bucketName)
        .createSignedUrl(path, 300)
        .then(({ data, error }) => {
          if (error) {
            console.error("Error creating signed URL:", error);
            setSignedUrl(url); // Fallback to original URL
          } else if (data?.signedUrl) {
            setSignedUrl(data.signedUrl);
          }
          setLoadingSignedUrl(false);
        })
        .catch((err) => {
          console.error("Failed to generate signed URL:", err);
          setSignedUrl(url);
          setLoadingSignedUrl(false);
        });
    } else {
      setSignedUrl(null);
    }
  }, [isOpen, viewingUser, viewingUserType]);

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
            <div className="flex flex-col gap-1 items-end">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${
                  viewingUser.status === "Active"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-rose-50 text-rose-600 border-rose-100"
                }`}
              >
                {viewingUser.status}
              </span>
               {viewingUserType === "driver" && (
                <div className="flex flex-col gap-1 items-end mt-1">
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${viewingUser.isOnline ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {viewingUser.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getActivityBadgeClasses(viewingUser.activityStatus)}`}
                  >
                    Activity: {viewingUser.activityStatus}
                  </span>
                </div>
              )}
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

          {/* Document Preview Section */}
          {viewingUserType === "driver" && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Driver's License Copy</h4>
                {viewingUser.licensePhotoUrl && !loadingSignedUrl && (
                  <button
                    onClick={() => setShowZoom(true)}
                    className="px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                  >
                    View Document Close-Up
                  </button>
                )}
              </div>
              {loadingSignedUrl ? (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold italic border border-dashed border-slate-200 bg-white rounded-xl flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Loading secure preview...</span>
                </div>
              ) : viewingUser.licensePhotoUrl && signedUrl ? (
                <div 
                  className="relative overflow-hidden rounded-xl border border-slate-200 bg-white h-32 flex items-center justify-center cursor-pointer hover:border-blue-300 transition-colors" 
                  onClick={() => setShowZoom(true)}
                >
                  <img
                    src={signedUrl}
                    alt="Driver's License Document"
                    className="max-h-full max-w-full object-contain p-2"
                  />
                </div>
              ) : (
                <div className="py-4 text-center text-rose-500 text-xs font-bold uppercase border border-dashed border-rose-200 bg-white rounded-xl">
                  Not uploaded / Pending Upload
                </div>
              )}
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

      {showZoom && signedUrl && (
        <div 
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[150] p-4 transition-all animate-in fade-in duration-200" 
          onClick={() => setShowZoom(false)}
        >
          <button
            onClick={() => setShowZoom(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-all border border-white/20 cursor-pointer shadow-md"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div 
            className="max-w-3xl max-h-[85vh] bg-white p-3 rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95" 
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={signedUrl}
              alt="Driver's License Zoom"
              className="max-h-[75vh] max-w-full object-contain rounded-lg"
            />
            <div className="mt-3 text-center text-[#091b6f] font-extrabold text-sm">
              License Copy: {viewingUser.name} (License: {viewingUser.license})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
