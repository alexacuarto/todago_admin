import React from "react";
import { Driver, Passenger } from "../../types";
import { getActivityBadgeClasses } from "../../lib/driverActivity";

interface UsersViewProps {
  filteredDrivers: Driver[];
  filteredPassengers: Passenger[];
  driverSearch: string;
  setDriverSearch: (val: string) => void;
  userTodaFilter: string;
  setUserTodaFilter: (val: string) => void;
  userStatusFilter: string;
  setUserStatusFilter: (val: string) => void;
  usersSubTab: "all" | "drivers" | "passengers";
  setUsersSubTab: (val: "all" | "drivers" | "passengers") => void;
  setViewingUser: (val: Driver | Passenger | null) => void;
  setViewingUserType: (val: "driver" | "passenger" | null) => void;
  setShowViewUserModal: (val: boolean) => void;
}

export default function UsersView({
  filteredDrivers,
  filteredPassengers,
  driverSearch,
  setDriverSearch,
  userTodaFilter,
  setUserTodaFilter,
  userStatusFilter,
  setUserStatusFilter,
  usersSubTab,
  setUsersSubTab,
  setViewingUser,
  setViewingUserType,
  setShowViewUserModal,
}: UsersViewProps) {
  const [showAllDrivers, setShowAllDrivers] = React.useState(false);
  const [showAllPassengers, setShowAllPassengers] = React.useState(false);
  const displayedDrivers = showAllDrivers ? filteredDrivers : filteredDrivers.slice(0, 5);
  const displayedPassengers = showAllPassengers ? filteredPassengers : filteredPassengers.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">

      {/* Filters registry bar */}
      <div className="bg-[#b3e2ff]/30 p-3 rounded-xl flex flex-wrap items-center gap-3 border border-[#b3e2ff]/50">
        {/* Category tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          {[
            { key: "all", label: "All" },
            { key: "drivers", label: "Drivers" },
            { key: "passengers", label: "Passengers" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setUsersSubTab(tab.key as any)}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${usersSubTab === tab.key
                ? "bg-[#091b6f] text-white shadow-xs"
                : "text-slate-600 hover:text-[#091b6f]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TODA Dropdown */}
        <div className="relative">
          <select
            value={userTodaFilter}
            onChange={(e) => {
              setUserTodaFilter(e.target.value);
            }}
            className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#091b6f] cursor-pointer appearance-none outline-hidden focus:border-blue-500"
          >
            <option value="All">All TODAs</option>
            <option value="LHITC-TODA">LHITC-TODA</option>
            <option value="BYPASS ILAYANG BAGUIO-TODA">BYPASS ILAYANG BAGUIO-TODA</option>
            <option value="CHOT-TODA">CHOT-TODA</option>
          </select>
          <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={userStatusFilter}
            onChange={(e) => {
              setUserStatusFilter(e.target.value);
            }}
            className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#091b6f] cursor-pointer appearance-none outline-hidden focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
          <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>

        {/* Search input */}
        <div className="w-full sm:w-56 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search name, phone, license..."
            value={driverSearch}
            onChange={(e) => {
              setDriverSearch(e.target.value);
            }}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-[#091b6f] transition-all text-[#091b6f]"
          />
        </div>

        {/* Apply Filter Button */}
        <button
          onClick={() => {
            setShowAllDrivers(false);
            setShowAllPassengers(false);
          }}
          className="px-5 py-2 bg-[#4c75f2] hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
        >
          Apply Filter
        </button>

        {/* Download List Button */}
        <button
          onClick={() => {
            alert("Simulated registry list downloaded!");
          }}
          className="ml-auto flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-[#091b6f] font-bold text-xs rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Download List</span>
        </button>
      </div>

      {/* Drivers List Card (Visible if sub-tab is "all" or "drivers") */}
      {(usersSubTab === "all" || usersSubTab === "drivers") && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
          <h3 className="text-[#091b6f] font-bold text-lg">Drivers List</h3>

          {/* Table */}
          <div className="overflow-x-auto" id="drivers-list-table">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-3">Name</th>
                  <th className="pb-3">TODA</th>
                  <th className="pb-3">License Status</th>
                  <th className="pb-3">Online Status</th>
                  <th className="pb-3">Activity Status</th>
                  <th className="pb-3 text-center pr-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold divide-y divide-slate-50">
                {displayedDrivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-3 text-left">
                      <p className="text-[#091b6f] font-bold">{d.name}</p>
                    </td>
                    <td className="py-4 text-slate-600 text-left">{d.toda}</td>
                    <td className="py-4 text-left">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-slate-500 font-mono text-xs">{d.license}</span>
                        {d.licensePhotoUrl ? (
                          <button
                            onClick={() => {
                              setViewingUser(d);
                              setViewingUserType("driver");
                              setShowViewUserModal(true);
                            }}
                            className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-[10px] font-bold transition-all cursor-pointer"
                          >
                            View License
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold italic">No license uploaded</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-left">
                      {/* Online / Offline status */}
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${d.isOnline ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                        <span className="text-[11px] text-slate-600 font-bold">
                          {d.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-left">
                      {/* Dynamic Activity status */}
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getActivityBadgeClasses(d.activityStatus)}`}
                      >
                        {d.activityStatus}
                      </span>
                    </td>
                    <td className="py-4 text-center pr-3">
                      <button
                        onClick={() => {
                          setViewingUser(d);
                          setViewingUserType("driver");
                          setShowViewUserModal(true);
                        }}
                        className="px-4 py-1.5 bg-[#4c75f2] hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredDrivers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      No drivers registered matching your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* View All Button */}
          {filteredDrivers.length > 5 && (
            <div className="flex justify-center pt-4 border-t border-slate-100 mt-2">
              {!showAllDrivers ? (
                <button
                  onClick={() => {
                    setShowAllDrivers(true);
                    setTimeout(() => {
                      document.getElementById("drivers-list-table")?.scrollIntoView({ behavior: "smooth" });
                    }, 50);
                  }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  View All ({filteredDrivers.length} Drivers)
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowAllDrivers(false);
                    setTimeout(() => {
                      document.getElementById("drivers-list-table")?.scrollIntoView({ behavior: "smooth" });
                    }, 50);
                  }}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Show Less
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Passengers List Card (Visible if sub-tab is "all" or "passengers") */}
      {(usersSubTab === "all" || usersSubTab === "passengers") && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
          <h3 className="text-[#091b6f] font-bold text-lg">Passengers List</h3>

          {/* Table */}
          <div className="overflow-x-auto" id="passengers-list-table">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-3">Name</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-center pr-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold divide-y divide-slate-50">
                {displayedPassengers.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pl-3 text-left">
                        <p className="text-[#091b6f] font-bold">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">
                          Canceled: {p.canceledTrips} trips
                        </p>
                      </td>
                      <td className="py-4 text-slate-600 text-left">{p.contact}</td>
                      <td className="py-4 text-left">
                        <span
                          className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold ${p.status === "Active"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                            }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 text-center pr-3">
                        <button
                          onClick={() => {
                            setViewingUser(p);
                            setViewingUserType("passenger");
                            setShowViewUserModal(true);
                          }}
                          className="px-4 py-1.5 bg-[#4c75f2] hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                {filteredPassengers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                      No passengers registered matching your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* View All Button */}
          {filteredPassengers.length > 5 && (
            <div className="flex justify-center pt-4 border-t border-slate-100 mt-2">
              {!showAllPassengers ? (
                <button
                  onClick={() => {
                    setShowAllPassengers(true);
                    setTimeout(() => {
                      document.getElementById("passengers-list-table")?.scrollIntoView({ behavior: "smooth" });
                    }, 50);
                  }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  View All ({filteredPassengers.length} Passengers)
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowAllPassengers(false);
                    setTimeout(() => {
                      document.getElementById("passengers-list-table")?.scrollIntoView({ behavior: "smooth" });
                    }, 50);
                  }}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Show Less
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
