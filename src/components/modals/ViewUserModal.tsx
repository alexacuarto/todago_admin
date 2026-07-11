import React, { useEffect, useState } from "react";
import { Driver, DriverEditFormData, Passenger, PassengerEditFormData } from "../../types";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewingUser: Driver | Passenger | null;
  viewingUserType: "driver" | "passenger" | null;
  isSuperAdmin: boolean;
  onBeginEdit: () => void;
  driverEditFormData: DriverEditFormData;
  setDriverEditFormData: React.Dispatch<React.SetStateAction<DriverEditFormData>>;
  passengerEditFormData: PassengerEditFormData;
  setPassengerEditFormData: React.Dispatch<React.SetStateAction<PassengerEditFormData>>;
  onSubmitDriverEdit: (e: React.FormEvent) => Promise<void>;
  onSubmitPassengerEdit: (e: React.FormEvent) => Promise<void>;
  onDeleteUser: (
    accountType: "driver" | "passenger",
    id: number | string,
  ) => Promise<boolean>;
}

export default function ViewUserModal({
  isOpen,
  onClose,
  viewingUser,
  viewingUserType,
  isSuperAdmin,
  onBeginEdit,
  driverEditFormData,
  setDriverEditFormData,
  passengerEditFormData,
  setPassengerEditFormData,
  onSubmitDriverEdit,
  onSubmitPassengerEdit,
  onDeleteUser,
}: ViewUserModalProps) {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(false);
  }, [isOpen, viewingUser?.id, viewingUserType]);

  if (!isOpen || !viewingUser) return null;

  const driverLicenseUrl =
    viewingUserType === "driver" ? (viewingUser as Driver).licenseImageUrl : undefined;
  const driverLicenseName =
    viewingUserType === "driver" ? (viewingUser as Driver).licenseImageName : undefined;
  const isDriverLicensePdf = driverLicenseName?.toLowerCase().endsWith(".pdf") ?? false;

  const handleEditClick = () => {
    onBeginEdit();
    setIsEditing(true);
  };

  const handleInlineSubmit = async (event: React.FormEvent) => {
    if (viewingUserType === "driver") {
      await onSubmitDriverEdit(event);
    } else {
      await onSubmitPassengerEdit(event);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 transition-all animate-in fade-in duration-200 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[92vh] overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95">
        <div className="bg-[#0b1b6e] text-white px-4 py-5 flex items-center justify-between gap-3 sm:px-6">
          <div className="min-w-0 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
              {viewingUserType === "driver" ? "Driver Profile Audit" : "Passenger Account Audit"}
            </span>
            <h3 className="break-anywhere font-bold text-base sm:text-lg">{viewingUser.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={handleEditClick}
                title="Edit account info"
                aria-label="Edit account info"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-all hover:bg-white/20 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
            )}
            <button onClick={onClose} className="text-white/85 hover:text-white transition-colors cursor-pointer">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-6 text-left overflow-y-auto sm:p-6">
          {/* Account Overview Cards */}
          <div className="flex flex-col items-start gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 min-[420px]:flex-row min-[420px]:items-center">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0 font-extrabold text-xl overflow-hidden">
              {viewingUser.avatarUrl ? (
                <img
                  src={viewingUser.avatarUrl}
                  alt={`${viewingUser.name} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                viewingUser.name.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="break-anywhere font-bold text-[#091b6f] text-md">{viewingUser.name}</h4>
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

          {isEditing && (
            <form id="user-account-edit-form" onSubmit={handleInlineSubmit} className="flex flex-col gap-4">
              {viewingUserType === "driver" ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Driver Full Name</label>
                    <input
                      type="text"
                      required
                      value={driverEditFormData.name}
                      onChange={(e) => setDriverEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Phone</label>
                      <input
                        type="tel"
                        disabled
                        value={driverEditFormData.phone}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={driverEditFormData.email}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">License Number</label>
                      <input
                        type="text"
                        required
                        value={driverEditFormData.license}
                        onChange={(e) => setDriverEditFormData((prev) => ({ ...prev, license: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Plate Number</label>
                      <input
                        type="text"
                        required
                        value={driverEditFormData.plateNumber}
                        onChange={(e) => setDriverEditFormData((prev) => ({ ...prev, plateNumber: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">TODA / Body Assignment</label>
                      <input
                        type="text"
                        required
                        value={driverEditFormData.bodyNumber}
                        onChange={(e) => setDriverEditFormData((prev) => ({ ...prev, bodyNumber: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Quick Select TODA</label>
                      <select
                        value={driverEditFormData.toda}
                        onChange={(e) => setDriverEditFormData((prev) => ({
                          ...prev,
                          toda: e.target.value,
                          bodyNumber: e.target.value,
                        }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold bg-white outline-hidden focus:border-blue-500 transition-all cursor-pointer text-[#091b6f]"
                      >
                        <option value="LHITC-TODA">LHITC-TODA</option>
                        <option value="BYPASS ILAYANG BAGUIO-TODA">BYPASS ILAYANG BAGUIO-TODA</option>
                        <option value="CHOT-TODA">CHOT-TODA</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Account Status</label>
                      <select
                        value={driverEditFormData.status}
                        onChange={(e) => setDriverEditFormData((prev) => ({ ...prev, status: e.target.value as "Active" | "Inactive" }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold bg-white outline-hidden focus:border-blue-500 transition-all cursor-pointer text-[#091b6f]"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Driver Verification</label>
                      <select
                        value={driverEditFormData.isVerified ? "Verified" : "Unverified"}
                        onChange={(e) => setDriverEditFormData((prev) => ({ ...prev, isVerified: e.target.value === "Verified" }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold bg-white outline-hidden focus:border-blue-500 transition-all cursor-pointer text-[#091b6f]"
                      >
                        <option value="Verified">Verified</option>
                        <option value="Unverified">Unverified</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      minLength={8}
                      value={driverEditFormData.password}
                      onChange={(e) => setDriverEditFormData((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Leave blank to keep current password"
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Driver License Image</label>
                    <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setDriverEditFormData((prev) => ({
                              ...prev,
                              licenseImage: file,
                              licenseImageName: file.name,
                            }));
                          }
                        }}
                        className="w-full text-sm text-slate-600"
                      />
                      <p className="break-anywhere mt-2 text-[11px] font-semibold text-slate-400">
                        {driverEditFormData.licenseImageName
                          ? `Selected: ${driverEditFormData.licenseImageName}`
                          : "Upload a JPG, PNG, WEBP, or PDF license file."}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Passenger Full Name</label>
                    <input
                      type="text"
                      required
                      value={passengerEditFormData.name}
                      onChange={(e) => setPassengerEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Phone</label>
                      <input
                        type="tel"
                        disabled
                        value={passengerEditFormData.contact}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={passengerEditFormData.email}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status</label>
                    <select
                      value={passengerEditFormData.status}
                      onChange={(e) => setPassengerEditFormData((prev) => ({ ...prev, status: e.target.value as "Active" | "Inactive" }))}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold bg-white outline-hidden focus:border-blue-500 transition-all cursor-pointer text-[#091b6f]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      minLength={8}
                      value={passengerEditFormData.password}
                      onChange={(e) => setPassengerEditFormData((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Leave blank to keep current password"
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f]"
                    />
                  </div>
                </>
              )}

            </form>
          )}

          {/* Data Grid based on Type */}
          {!isEditing && (viewingUserType === "driver" ? (
            // Driver Specific Data
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">TODA Association</p>
                <p className="break-anywhere font-bold text-slate-700 mt-0.5">{(viewingUser as Driver).toda}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">License Number</p>
                <p className="break-anywhere font-bold text-slate-700 mt-0.5 font-mono">{(viewingUser as Driver).license}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verification</p>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-extrabold border ${
                    (viewingUser as Driver).isVerified
                      ? "bg-blue-50 text-blue-600 border-blue-100"
                      : "bg-amber-50 text-amber-600 border-amber-100"
                  }`}
                >
                  {(viewingUser as Driver).isVerified ? "Verified" : "Unverified"}
                </span>
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
                <p className="break-anywhere font-bold text-slate-600 mt-0.5">{(viewingUser as Driver).email || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Completed Trips</p>
                <p className="font-extrabold text-[#091b6f] text-md mt-0.5">{(viewingUser as Driver).trips} Rides</p>
              </div>
              {(driverLicenseUrl || driverLicenseName) && (
                <div className="md:col-span-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Uploaded License</p>
                      <p className="break-anywhere mt-0.5 text-xs font-semibold text-slate-500">
                        {driverLicenseName}
                      </p>
                    </div>
                    {driverLicenseUrl && (
                      <a
                        href={driverLicenseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-lg bg-[#4c75f2] px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-blue-600"
                      >
                        View License
                      </a>
                    )}
                  </div>
                  {driverLicenseUrl && (
                    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                      {isDriverLicensePdf ? (
                        <a
                          href={driverLicenseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-bold text-blue-600 hover:text-blue-700"
                        >
                          View uploaded license PDF
                        </a>
                      ) : (
                        <img
                          src={driverLicenseUrl}
                          alt="Driver license"
                          className="max-h-56 w-full rounded-xl object-contain"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Passenger Specific Data
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Contact Number</p>
                <p className="font-bold text-slate-700 mt-0.5">{(viewingUser as Passenger).contact}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                <p className="break-anywhere font-bold text-slate-600 mt-0.5">{(viewingUser as Passenger).email || "N/A"}</p>
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
          ))}

          {!isEditing && viewingUserType === "passenger" && (viewingUser as Passenger).canceledTrips >= 3 && (
            <div className="bg-rose-50 text-rose-700 p-3.5 rounded-lg border border-rose-100 text-xs font-semibold mt-1">
              <span className="break-anywhere">Passenger is deactivated. Canceled trip threshold (3) has been reached.</span>
            </div>
          )}

          <div className="pt-2 mt-1 flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
            {isEditing && (
              <button
                type="submit"
                form="user-account-edit-form"
                className="px-6 py-2.5 bg-[#4c75f2] hover:bg-blue-600 text-white rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                Save Changes
              </button>
            )}
            {!isEditing && isSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  const accountType = viewingUserType === "driver" ? "driver" : "passenger";
                  const accountLabel = viewingUserType === "driver" ? "driver" : "passenger";
                  if (!window.confirm(`Delete ${accountLabel} account for ${viewingUser.name}? This cannot be undone.`)) return;
                  void onDeleteUser(accountType, viewingUser.id);
                }}
                className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer shadow-xs bg-rose-600 text-white hover:bg-rose-700"
              >
                {viewingUserType === "driver" ? "Delete Driver" : "Delete Passenger"}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full px-6 py-2.5 bg-[#091b6f] hover:bg-blue-800 text-white rounded-lg font-bold text-sm transition-colors cursor-pointer shadow-xs hover:shadow sm:w-auto"
            >
              Close Account Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
