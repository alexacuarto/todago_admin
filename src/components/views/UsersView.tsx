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
  usersSubTab: "drivers" | "passengers";
  setViewingUser: (val: Driver | Passenger | null) => void;
  setViewingUserType: (val: "driver" | "passenger" | null) => void;
  setShowViewUserModal: (val: boolean) => void;
}

const pageSize = 5;

const Pagination = ({
  page,
  pageCount,
  total,
  label,
  setPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  label: string;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  if (total <= pageSize) return null;

  return (
    <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
      <p className="text-xs font-semibold text-slate-400">
        Page {page} of {pageCount} · {total} {label}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1}
          className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
          disabled={page === pageCount}
          className="px-4 py-2 bg-[#000C7D] rounded-lg text-xs font-bold text-white hover:bg-blue-900 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default function UsersView({
  filteredDrivers,
  filteredPassengers,
  driverSearch,
  setDriverSearch,
  userTodaFilter,
  setUserTodaFilter,
  usersSubTab,
  setViewingUser,
  setViewingUserType,
  setShowViewUserModal,
}: UsersViewProps) {
  const [driverPage, setDriverPage] = React.useState(1);
  const [passengerPage, setPassengerPage] = React.useState(1);
  const driverPageCount = Math.max(1, Math.ceil(filteredDrivers.length / pageSize));
  const passengerPageCount = Math.max(1, Math.ceil(filteredPassengers.length / pageSize));
  const displayedDrivers = filteredDrivers.slice((driverPage - 1) * pageSize, driverPage * pageSize);
  const displayedPassengers = filteredPassengers.slice((passengerPage - 1) * pageSize, passengerPage * pageSize);
  const todaOptions = Array.from(new Set(filteredDrivers.map((driver) => driver.toda).filter(Boolean))).sort();

  React.useEffect(() => {
    setDriverPage(1);
    setPassengerPage(1);
  }, [driverSearch, userTodaFilter, usersSubTab]);

  React.useEffect(() => {
    if (driverPage > driverPageCount) setDriverPage(driverPageCount);
    if (passengerPage > passengerPageCount) setPassengerPage(passengerPageCount);
  }, [driverPage, driverPageCount, passengerPage, passengerPageCount]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-[#000C7D] font-bold text-xl">
              {usersSubTab === "drivers" ? "Drivers Management" : "Passengers Management"}
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Live records from Supabase.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {usersSubTab === "drivers" && (
              <div className="relative w-full sm:w-72">
                <select
                  value={userTodaFilter}
                  onChange={(event) => setUserTodaFilter(event.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#000C7D] cursor-pointer appearance-none outline-hidden focus:border-blue-500"
                >
                  <option value="All">All TODAs</option>
                  {todaOptions.map((toda) => (
                    <option key={toda} value={toda}>
                      {toda}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            )}

            <div className="w-full sm:w-72 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={usersSubTab === "drivers" ? "Search name, phone, license" : "Search name, contact, email"}
                value={driverSearch}
                onChange={(event) => setDriverSearch(event.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-[#000C7D] transition-all text-[#000C7D]"
              />
            </div>
          </div>
        </div>

        {usersSubTab === "drivers" ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-3">Name</th>
                    <th className="pb-3 px-3">TODA</th>
                    <th className="pb-3 px-3">Document Status</th>
                    <th className="pb-3 px-3">Activity Status</th>
                    <th className="pb-3 px-3">Online Status</th>
                    <th className="pb-3 text-center pr-3">Details</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold divide-y divide-slate-50">
                  {displayedDrivers.map((driver) => {
                    const docStatus = driver.documentStatus || "PENDING";
                    const docBadgeClass = docStatus === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200";
                    const activityBadgeClass = getActivityBadgeClasses(driver.activityStatus);

                    return (
                      <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pl-3">
                          <p className="text-[#000C7D] font-bold">{driver.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{driver.plateNumber}</p>
                        </td>
                        <td className="py-4 px-3 text-slate-600">{driver.toda}</td>
                        <td className="py-4 px-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${docBadgeClass}`}>
                            {docStatus}
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${activityBadgeClass}`}>
                            {driver.activityStatus}
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${driver.isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
                            <span className="text-[11px] text-slate-600 font-bold">
                              {driver.isOnline ? "Online" : "Offline"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-center pr-3">
                          <button
                            onClick={() => {
                              setViewingUser(driver);
                              setViewingUserType("driver");
                              setShowViewUserModal(true);
                            }}
                            className="px-4 py-1.5 bg-[#4c75f2] hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                          >
                            View Audit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
            <Pagination page={driverPage} pageCount={driverPageCount} total={filteredDrivers.length} label="drivers" setPage={setDriverPage} />
          </>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-3">Name</th>
                    <th className="pb-3 px-3">Contact</th>
                    <th className="pb-3 px-3">Type</th>
                    <th className="pb-3 px-3">Cancellations</th>
                    <th className="pb-3 px-3">Account Status</th>
                    <th className="pb-3 text-center pr-3">Details</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold divide-y divide-slate-50">
                  {displayedPassengers.map((passenger) => {
                    let statusClass = "bg-emerald-50 text-emerald-600 border border-emerald-100";
                    if (passenger.status === "Warning") statusClass = "bg-amber-50 text-amber-600 border border-amber-100";
                    if (passenger.status.startsWith("Restricted")) statusClass = "bg-rose-50 text-rose-600 border border-rose-100";
                    if (passenger.status === "Inactive") statusClass = "bg-slate-50 text-slate-600 border border-slate-100";

                    return (
                      <tr key={passenger.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pl-3 text-[#000C7D] font-bold">{passenger.name}</td>
                        <td className="py-4 px-3 text-slate-600">{passenger.contact}</td>
                        <td className="py-4 px-3 text-slate-600">{passenger.accountPassengerType || "Regular"}</td>
                        <td className="py-4 px-3 text-slate-600">{passenger.canceledTrips}</td>
                        <td className="py-4 px-3">
                          <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold ${statusClass}`}>
                            {passenger.status}
                          </span>
                        </td>
                        <td className="py-4 text-center pr-3">
                          <button
                            onClick={() => {
                              setViewingUser(passenger);
                              setViewingUserType("passenger");
                              setShowViewUserModal(true);
                            }}
                            className="px-4 py-1.5 bg-[#4c75f2] hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPassengers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        No passengers registered matching your search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={passengerPage} pageCount={passengerPageCount} total={filteredPassengers.length} label="passengers" setPage={setPassengerPage} />
          </>
        )}
      </div>
    </div>
  );
}
