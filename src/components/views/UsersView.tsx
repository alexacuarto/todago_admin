import React from "react";
import { Driver, Passenger } from "../../data/mockData";

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
  driversPage: number;
  setDriversPage: React.Dispatch<React.SetStateAction<number>>;
  passengersPage: number;
  setPassengersPage: React.Dispatch<React.SetStateAction<number>>;
  setViewingUser: (val: Driver | Passenger | null) => void;
  setViewingUserType: (val: "driver" | "passenger" | null) => void;
  setShowViewUserModal: (val: boolean) => void;
  setActiveStatModal: (val: string | null) => void;
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
  driversPage,
  setDriversPage,
  passengersPage,
  setPassengersPage,
  setViewingUser,
  setViewingUserType,
  setShowViewUserModal,
  setActiveStatModal,
}: UsersViewProps) {
  const itemsPerPage = 5;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Users Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Active Passengers Card */}
        <div
          onClick={() => setActiveStatModal("active-passengers")}
          className="bg-[#091b6f] text-white p-5 rounded-2xl shadow-sm border border-blue-900/10 flex items-center justify-between hover:shadow-md hover:scale-[1.02] hover:border-blue-700 transition-all duration-200 cursor-pointer text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-sky-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <p className="text-sky-200/80 font-bold text-xs uppercase tracking-wider">Active Passengers</p>
              <p className="text-3xl font-extrabold mt-0.5">2,308</p>
            </div>
          </div>
        </div>

        {/* Active Drivers Card */}
        <div
          onClick={() => setActiveStatModal("active-drivers")}
          className="bg-[#091b6f] text-white p-5 rounded-2xl shadow-sm border border-blue-900/10 flex items-center justify-between hover:shadow-md hover:scale-[1.02] hover:border-blue-700 transition-all duration-200 cursor-pointer text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-sky-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <p className="text-sky-200/80 font-bold text-xs uppercase tracking-wider">Active Drivers</p>
              <p className="text-3xl font-extrabold mt-0.5">1,856</p>
            </div>
          </div>
        </div>

        {/* Registered Passengers Card */}
        <div
          onClick={() => setActiveStatModal("registered-passengers")}
          className="bg-[#091b6f] text-white p-5 rounded-2xl shadow-sm border border-blue-900/10 flex items-center justify-between hover:shadow-md hover:scale-[1.02] hover:border-blue-700 transition-all duration-200 cursor-pointer text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-sky-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
            </div>
            <div>
              <p className="text-sky-200/80 font-bold text-xs uppercase tracking-wider">Registered Passengers</p>
              <p className="text-3xl font-extrabold mt-0.5">452</p>
            </div>
          </div>
        </div>
      </div>

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
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                usersSubTab === tab.key
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
              setDriversPage(1);
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
              setDriversPage(1);
              setPassengersPage(1);
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
              setDriversPage(1);
              setPassengersPage(1);
            }}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-[#091b6f] transition-all text-[#091b6f]"
          />
        </div>

        {/* Apply Filter Button */}
        <button
          onClick={() => {
            setDriversPage(1);
            setPassengersPage(1);
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-3">Name</th>
                  <th className="pb-3">TODA</th>
                  <th className="pb-3">License</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-center pr-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold divide-y divide-slate-50">
                {filteredDrivers
                  .slice((driversPage - 1) * itemsPerPage, driversPage * itemsPerPage)
                  .map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pl-3 text-left">
                        <p className="text-[#091b6f] font-bold">{d.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">Body: {d.bodyNumber}</p>
                      </td>
                      <td className="py-4 text-slate-600 text-left">{d.toda}</td>
                      <td className="py-4 text-slate-500 font-mono text-xs text-left">{d.license}</td>
                      <td className="py-4 text-left">
                        <span
                          className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === "Active"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                        >
                          {d.status}
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
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      No drivers registered matching your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredDrivers.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
              <span className="text-xs text-slate-500 font-bold">
                Page {driversPage} of {Math.ceil(filteredDrivers.length / itemsPerPage)}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDriversPage((prev) => Math.max(prev - 1, 1))}
                  disabled={driversPage === 1}
                  className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent text-[#091b6f] cursor-pointer"
                >
                  &lt;
                </button>

                {Array.from(
                  { length: Math.ceil(filteredDrivers.length / itemsPerPage) },
                  (_, i) => i + 1
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => setDriversPage(p)}
                    className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg border ${
                      driversPage === p
                        ? "bg-blue-100 border-blue-200 text-blue-600 font-extrabold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setDriversPage((prev) =>
                      Math.min(prev + 1, Math.ceil(filteredDrivers.length / itemsPerPage))
                    )
                  }
                  disabled={driversPage === Math.ceil(filteredDrivers.length / itemsPerPage)}
                  className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent text-[#091b6f] cursor-pointer"
                >
                  Next &gt;&gt;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Passengers List Card (Visible if sub-tab is "all" or "passengers") */}
      {(usersSubTab === "all" || usersSubTab === "passengers") && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
          <h3 className="text-[#091b6f] font-bold text-lg">Passengers List</h3>

          {/* Table */}
          <div className="overflow-x-auto">
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
                {filteredPassengers
                  .slice((passengersPage - 1) * itemsPerPage, passengersPage * itemsPerPage)
                  .map((p) => (
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
                          className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === "Active"
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

          {/* Pagination */}
          {filteredPassengers.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
              <span className="text-xs text-slate-500 font-bold">
                Page {passengersPage} of {Math.ceil(filteredPassengers.length / itemsPerPage)}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPassengersPage((prev) => Math.max(prev - 1, 1))}
                  disabled={passengersPage === 1}
                  className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent text-[#091b6f] cursor-pointer"
                >
                  &lt;
                </button>

                {Array.from(
                  { length: Math.ceil(filteredPassengers.length / itemsPerPage) },
                  (_, i) => i + 1
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPassengersPage(p)}
                    className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg border ${
                      passengersPage === p
                        ? "bg-blue-100 border-blue-200 text-blue-600 font-extrabold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setPassengersPage((prev) =>
                      Math.min(prev + 1, Math.ceil(filteredPassengers.length / itemsPerPage))
                    )
                  }
                  disabled={passengersPage === Math.ceil(filteredPassengers.length / itemsPerPage)}
                  className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent text-[#091b6f] cursor-pointer"
                >
                  Next &gt;&gt;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
