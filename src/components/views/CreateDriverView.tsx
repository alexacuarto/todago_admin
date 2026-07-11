import React from "react";
import { CreateDriverFormData } from "../../types";

interface CreateDriverViewProps {
  formData: CreateDriverFormData;
  setFormData: React.Dispatch<React.SetStateAction<CreateDriverFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isCreatingDriver?: boolean;
}

export default function CreateDriverView({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isCreatingDriver = false,
}: CreateDriverViewProps) {
  return (
    <div className="flex w-full max-w-7xl flex-col gap-4 mx-auto sm:gap-6">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="text-[#091b6f] text-xl font-extrabold tracking-wide sm:text-2xl">
            Create Driver Account
          </h2>
          <p className="break-anywhere text-xs text-slate-400 font-medium mt-1">
            Register a new tricycle driver in the TodaGo
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex w-full flex-col gap-6 animate-in fade-in duration-200 sm:p-8">
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  placeholder="Enter Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f] placeholder-slate-300"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  placeholder="Enter Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f] placeholder-slate-300"
                />
              </div>
            </div>

            {/* Contact Number */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Contact Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <input
                  type="tel"
                  required
                  placeholder="Enter Contact Number"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f] placeholder-slate-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type="password"
                  required
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f] placeholder-slate-300"
                />
              </div>
            </div>

            {/* License Number */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">License Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <line x1="7" y1="8" x2="17" y2="8" />
                    <line x1="7" y1="12" x2="17" y2="12" />
                    <line x1="7" y1="16" x2="13" y2="16" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  placeholder="Enter License Number"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, licenseNumber: e.target.value }))}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f] placeholder-slate-300"
                />
              </div>
            </div>

            {/* Plate Number */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Plate Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                    <path d="M5.5 16h13M8.5 10l2-4h5v4M4 11.5a2.5 2.5 0 0 1 2.5-2.5h2" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  placeholder="Enter Plate Number"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, plateNumber: e.target.value }))}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f] placeholder-slate-300"
                />
              </div>
            </div>

            {/* TODA */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">TODA Association</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </span>
                <select
                  value={formData.toda}
                  onChange={(e) => setFormData((prev) => ({ ...prev, toda: e.target.value }))}
                  className="w-full pl-11 pr-10 py-3 border border-slate-200 rounded-xl text-sm font-semibold bg-white outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[#091b6f] cursor-pointer appearance-none"
                >
                  <option value="LHITC-TODA">LHITC-TODA</option>
                  <option value="BYPASS ILAYANG BAGUIO-TODA">BYPASS ILAYANG BAGUIO-TODA</option>
                  <option value="CHOT-TODA">CHOT-TODA</option>
                </select>
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Upload Documents Section */}
          <div className="text-left mt-4">
            <h4 className="text-md font-bold text-[#091b6f] tracking-wide uppercase mb-3">Upload License</h4>

            <div className="grid grid-cols-1 gap-4">
              {/* Driver's License Box */}
              <div className="border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row items-center gap-4 hover:border-blue-300 transition-all bg-slate-50/50">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <line x1="7" y1="8" x2="17" y2="8" />
                    <line x1="7" y1="12" x2="17" y2="12" />
                    <line x1="7" y1="16" x2="13" y2="16" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1 text-center md:text-left">
                  <p className="text-sm font-bold text-[#091b6f]">Driver's License Copy</p>
                  <p className="text-xs text-slate-400 font-semibold">Upload a photo/scan of the license document</p>
                </div>

                {/* Upload Input */}
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center bg-white hover:bg-slate-50 transition-colors w-full md:w-64 relative cursor-pointer group">
                  <input
                    type="file"
                    accept=".jpg,.png,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData((prev) => ({
                          ...prev,
                          licenseImage: file,
                          licenseImageName: file.name,
                        }));
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-500 mb-1"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="break-anywhere text-center text-xs font-bold text-[#091b6f]">
                    {formData.licenseImageName ? formData.licenseImageName : "Drag and Drop or"}
                  </p>
                  {!formData.licenseImageName && (
                    <>
                      <span className="mt-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] rounded-lg shadow-sm">
                        Choose File
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold mt-1">JPG, PNG or PDF</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse items-stretch justify-end gap-3 mt-6 pt-5 border-t border-slate-100 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onCancel}
              className="px-7 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl font-bold text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingDriver}
              className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreatingDriver && (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isCreatingDriver ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
