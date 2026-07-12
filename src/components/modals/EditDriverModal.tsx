import React from "react";
import { Driver, DriverEditFormData } from "../../types";

interface EditDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDriver: Driver | null;
  editFormData: DriverEditFormData;
  setEditFormData: React.Dispatch<React.SetStateAction<DriverEditFormData>>;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EditDriverModal({
  isOpen,
  onClose,
  editingDriver,
  editFormData,
  setEditFormData,
  onSubmit,
}: EditDriverModalProps) {
  if (!isOpen || !editingDriver) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 transition-all sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#0b1b6e] text-white px-4 py-4 flex items-center justify-between gap-3 sm:px-6">
          <h3 className="break-anywhere font-bold text-base sm:text-lg">Edit Driver Account</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4 flex flex-col gap-4 text-left overflow-y-auto max-h-[calc(92vh-72px)] sm:p-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Driver Full Name</label>
            <input
              type="text"
              required
              value={editFormData.name}
              onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Phone</label>
              <input
                type="tel"
                required
                disabled
                value={editFormData.phone}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">License Number</label>
              <input
                type="text"
                required
                value={editFormData.license}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, license: e.target.value }))}
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
                value={editFormData.bodyNumber}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, bodyNumber: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f]"
              />
              <p className="text-[11px] text-slate-400 font-semibold">
                This is the value shown in driver lists and booking logs.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Quick Select TODA</label>
              <select
                value={editFormData.toda}
                onChange={(e) => setEditFormData((prev) => ({
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
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                disabled
                value={editFormData.email}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Plate Number</label>
              <input
                type="text"
                required
                value={editFormData.plateNumber}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, plateNumber: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">New Password</label>
            <input
              type="password"
              minLength={8}
              value={editFormData.password}
              onChange={(e) => setEditFormData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Leave blank to keep current password"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f]"
            />
            <p className="text-[11px] text-slate-400 font-semibold">
              Password changes are immediate and must be at least 8 characters.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Driver Availability</label>
            <div className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold bg-slate-50 text-[#091b6f]">
              {editingDriver.status}
            </div>
            <p className="text-[11px] text-slate-400 font-semibold">
              Drivers control online/offline availability from the mobile app.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Driver Verification</label>
            <select
              value={editFormData.isVerified ? "Verified" : "Unverified"}
              onChange={(e) => setEditFormData((prev) => ({ ...prev, isVerified: e.target.value === "Verified" }))}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold bg-white outline-hidden focus:border-blue-500 transition-all cursor-pointer text-[#091b6f]"
            >
              <option value="Verified">Verified</option>
              <option value="Unverified">Unverified</option>
            </select>
            <p className="text-[11px] text-slate-400 font-semibold">
              Only verified drivers can accept passenger ride requests.
            </p>
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
                    setEditFormData((prev) => ({
                      ...prev,
                      licenseImage: file,
                      licenseImageName: file.name,
                    }));
                  }
                }}
                className="w-full text-sm text-slate-600"
              />
              <p className="break-anywhere mt-2 text-[11px] font-semibold text-slate-400">
                {editFormData.licenseImageName
                  ? `Selected: ${editFormData.licenseImageName}`
                  : "Upload a JPG, PNG, WEBP, or PDF license file."}
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse items-stretch justify-end gap-3 mt-5 pt-5 border-t border-slate-100 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg font-bold text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#4c75f2] hover:bg-blue-600 text-white rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
