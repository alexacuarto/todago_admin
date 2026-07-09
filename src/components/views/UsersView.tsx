import React from "react";
import { Driver, DriverEditFormData, Passenger, PassengerEditFormData } from "../../types";

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
  setEditingDriver: (driver: Driver | null) => void;
  setEditFormData: (formData: DriverEditFormData) => void;
  setShowEditDriverModal: (val: boolean) => void;
  setEditingPassenger: (passenger: Passenger | null) => void;
  setPassengerEditFormData: (formData: PassengerEditFormData) => void;
  setShowEditPassengerModal: (val: boolean) => void;
  setActiveStatModal: (val: string | null) => void;
  activePassengerCount: number;
  activeDriverCount: number;
  registeredPassengerCount: number;
}

export default function UsersView({
  filteredDrivers,
  filteredPassengers,
  driverSearch,
  setDriverSearch,
  usersSubTab,
  setUsersSubTab,
  driversPage,
  setDriversPage,
  passengersPage,
  setPassengersPage,
  setViewingUser,
  setViewingUserType,
  setShowViewUserModal,
  setEditingDriver,
  setEditFormData,
  setShowEditDriverModal,
  setEditingPassenger,
  setPassengerEditFormData,
  setShowEditPassengerModal,
}: UsersViewProps) {
  const itemsPerPage = 7;
  const userTabs = [
    { key: "drivers", label: "Drivers" },
    { key: "passengers", label: "Passengers" },
  ] as const;

  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto sm:gap-6">


      {/* Filters registry bar */}
      <div className="bg-[#b3e2ff]/30 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 border border-[#b3e2ff]/50">
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-full sm:w-auto justify-center">
          {userTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setUsersSubTab(tab.key)}
              className={`w-full px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer sm:w-auto ${usersSubTab === tab.key
                ? "bg-[#091b6f] text-white shadow-xs"
                : "text-slate-600 hover:text-[#091b6f]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>





        {/* Search input */}
        <div className="w-full sm:flex-1 sm:max-w-md relative">
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

        {/* Download List Button */}
        <button
          onClick={() => {
            alert("Simulated registry list downloaded!");
          }}
          className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2 px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-[#091b6f] font-bold text-xs rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-4 sm:p-6">
          <h3 className="text-[#091b6f] font-bold text-lg">Drivers List</h3>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 text-xs font-bold uppercase whitespace-nowrap">
                  <th className="pb-3 pl-3">Name</th>
                  <th className="pb-3">TODA</th>
                  <th className="pb-3">License</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Verification</th>
                  <th className="pb-3 text-center pr-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold divide-y divide-slate-50">
                {filteredDrivers
                  .slice((driversPage - 1) * itemsPerPage, driversPage * itemsPerPage)
                  .map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
                      <td className="py-4 pl-3 text-left">
                        <p className="max-w-[170px] truncate text-[#091b6f] font-bold" title={d.name}>{d.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">Body: {d.bodyNumber}</p>
                      </td>
                      <td className="py-4 text-slate-600 text-left max-w-[180px] truncate" title={d.toda}>{d.toda}</td>
                      <td className="py-4 text-slate-500 font-mono text-xs text-left max-w-[150px] truncate" title={d.license}>{d.license}</td>
                      <td className="py-4 text-left">
                        <span
                          className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold ${d.status === "Active"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                            }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-4 text-left">
                        <span
                          className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold ${d.isVerified
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                            }`}
                        >
                          {d.isVerified ? "Verified" : "Unverified"}
                        </span>
                      </td>
                      <td className="py-4 text-center pr-3">
                        <div className="flex items-center justify-center gap-2">
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
                          <button
                            onClick={() => {
                              setEditingDriver(d);
                              setEditFormData({
                                name: d.name,
                                phone: d.phone,
                                license: d.license,
                                bodyNumber: d.bodyNumber,
                                toda: d.toda,
                                status: d.status,
                                email: d.email || "",
                                password: "",
                                plateNumber: d.plateNumber || "",
                                isVerified: d.isVerified,
                                licenseImage: null,
                                licenseImageName: d.licenseImageName || "",
                              });
                              setShowEditDriverModal(true);
                            }}
                            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#091b6f] rounded-lg text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
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

          {/* Pagination */}
          {filteredDrivers.length > 0 && (
            <div className="flex flex-col items-stretch gap-3 border-t border-slate-100 pt-4 mt-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-slate-500 font-bold">
                Page {driversPage} of {Math.ceil(filteredDrivers.length / itemsPerPage)}
              </span>

              <div className="flex max-w-full items-center gap-1 overflow-x-auto pb-1">
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
                    className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg border ${driversPage === p
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
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Passengers List Card (Visible if sub-tab is "all" or "passengers") */}
      {(usersSubTab === "all" || usersSubTab === "passengers") && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-4 sm:p-6">
          <h3 className="text-[#091b6f] font-bold text-lg">Passengers List</h3>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[620px] w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 text-xs font-bold uppercase whitespace-nowrap">
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
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
                      <td className="py-4 pl-3 text-left">
                        <p className="max-w-[190px] truncate text-[#091b6f] font-bold" title={p.name}>{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">
                          Canceled: {p.canceledTrips} trips
                        </p>
                      </td>
                      <td className="py-4 text-slate-600 text-left max-w-[170px] truncate" title={p.contact}>{p.contact}</td>
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
                        <div className="flex items-center justify-center gap-2">
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
                          <button
                            onClick={() => {
                              setEditingPassenger(p);
                              setPassengerEditFormData({
                                name: p.name,
                                contact: p.contact,
                                email: p.email || "",
                                status: p.status,
                                password: "",
                              });
                              setShowEditPassengerModal(true);
                            }}
                            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#091b6f] rounded-lg text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
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
            <div className="flex flex-col items-stretch gap-3 border-t border-slate-100 pt-4 mt-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-slate-500 font-bold">
                Page {passengersPage} of {Math.ceil(filteredPassengers.length / itemsPerPage)}
              </span>

              <div className="flex max-w-full items-center gap-1 overflow-x-auto pb-1">
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
                    className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg border ${passengersPage === p
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
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
