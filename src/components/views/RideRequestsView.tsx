import React from "react";
import { RideRequest } from "../../types";

interface RideRequestsViewProps {
  filteredRequests: RideRequest[];
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  requestsPage: number;
  setRequestsPage: React.Dispatch<React.SetStateAction<number>>;
  requestTodaFilter: string;
  setRequestTodaFilter: (val: string) => void;
  requestSearch: string;
  setRequestSearch: (val: string) => void;
  handleDownloadReport: () => void;
  setViewingRequest: (val: RideRequest | null) => void;
  setShowViewRequestModal: (val: boolean) => void;
  setActiveStatModal: (val: string | null) => void;
}

export default function RideRequestsView({
  filteredRequests,
  statusFilter,
  setStatusFilter,
  requestsPage,
  setRequestsPage,
  requestTodaFilter,
  setRequestTodaFilter,
  requestSearch,
  setRequestSearch,
  handleDownloadReport,
  setViewingRequest,
  setShowViewRequestModal,
  setActiveStatModal,
}: RideRequestsViewProps) {
  const itemsPerPage = 7;
  const totalEarnings = filteredRequests.reduce((sum, record) => sum + record.earningAmount, 0);
  const totalCompletedRides = filteredRequests.filter((record) => record.status === "Completed").length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-[#091b6f]">Booking Logs</h1>
        <p className="text-sm font-semibold text-slate-500">
          Review bookings, ride status, fare values, and driver earnings in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => setActiveStatModal("total-earnings")}
          className="rounded-lg border border-slate-100 bg-[#091b6f] p-5 text-left text-white shadow-sm transition hover:bg-[#132b91]"
        >
          <p className="text-xs font-extrabold uppercase text-sky-200">Total Earnings</p>
          <p className="mt-2 text-3xl font-extrabold">₱{totalEarnings.toLocaleString()}</p>
          <p className="mt-3 text-xs font-semibold text-sky-200/80">From the visible ride history rows</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveStatModal("completed-rides")}
          className="rounded-lg border border-slate-100 bg-white p-5 text-left shadow-sm transition hover:border-[#091b6f]/20"
        >
          <p className="text-xs font-extrabold uppercase text-slate-400">Completed Rides</p>
          <p className="mt-2 text-3xl font-extrabold text-[#091b6f]">{totalCompletedRides.toLocaleString()}</p>
          <p className="mt-3 text-xs font-semibold text-slate-500">Completed rides in the current history view</p>
        </button>

        <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase text-slate-400">Logged Bookings</p>
          <p className="mt-2 text-3xl font-extrabold text-[#091b6f]">{filteredRequests.length.toLocaleString()}</p>
          <button
            type="button"
            onClick={handleDownloadReport}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#4c75f2] px-4 py-2 text-xs font-extrabold text-white hover:bg-blue-600"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Earnings CSV
          </button>
        </div>
      </div>

      {/* Category Filter Buttons Row */}
      <div className="bg-[#b3e2ff]/30 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-[#b3e2ff]/50">
        <div className="flex flex-wrap sm:flex-nowrap bg-slate-100 p-1 rounded-lg border border-slate-200 w-full sm:w-auto justify-center">
          {[
            { key: "Ongoing", label: "Ongoing" },
            { key: "Completed", label: "Completed" },
            { key: "Cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setRequestsPage(1);
              }}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer w-full sm:w-auto text-center ${statusFilter === tab.key
                ? "bg-[#091b6f] text-white shadow-sm"
                : "text-slate-600 hover:text-[#091b6f]"
                }`}
            >
              {tab.key === "Ongoing" ? "Ongoing Rides" : tab.label}
            </button>
          ))}
        </div>

        {/* TODA Dropdown Filter */}
        <div className="relative w-full sm:w-auto">
          <select
            value={requestTodaFilter}
            onChange={(e) => {
              setRequestTodaFilter(e.target.value);
              setRequestsPage(1);
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


      </div>

      {/* Main List Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
        {/* Section Header with Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[#091b6f] font-bold text-lg">
              {statusFilter} Booking History ({filteredRequests.length})
            </h2>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-64 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={requestSearch}
              onChange={(e) => {
                setRequestSearch(e.target.value);
                setRequestsPage(1);
              }}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-[#091b6f] transition-all text-[#091b6f]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                <th className="pb-3 pl-3">Passenger</th>
                <th className="pb-3">Pickup</th>
                <th className="pb-3">Destination</th>
                <th className="pb-3">Driver</th>
                <th className="pb-3">TODA</th>
                <th className="pb-3">Booking Date</th>
                <th className="pb-3">Fare</th>
                <th className="pb-3">Earning Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-center pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold divide-y divide-slate-50">
              {filteredRequests
                .slice((requestsPage - 1) * itemsPerPage, requestsPage * itemsPerPage)
                .map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
                    <td className="py-5 pl-3 text-[#091b6f] font-bold">{r.passenger}</td>
                    <td className="py-5 px-2 text-slate-600 max-w-[200px] truncate">{r.location}</td>
                    <td className="py-5 px-2 text-slate-500 max-w-[200px] truncate">{r.destination}</td>
                    <td className="py-5 px-2 text-slate-700">{r.driver}</td>
                    <td className="py-5 px-2 text-slate-600">{r.toda}</td>
                    <td className="py-5 px-2 text-slate-600">{r.time || "-"}</td>
                    <td className="py-5 px-2 font-extrabold text-[#091b6f]">₱{r.fare.toLocaleString()}</td>
                    <td className="py-5 px-2 text-slate-600">{r.earningDate || "-"}</td>
                    <td className="py-5">
                      <span
                        className={`inline-block px-4 py-1 rounded-full text-[10px] font-bold ${r.status === "Completed"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : r.status === "In Transit"
                            ? "bg-emerald-500 text-white border border-emerald-600"
                            : r.status === "Pending"
                              ? "bg-amber-100 text-amber-600 border border-amber-200"
                              : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-5 text-center pr-3">
                      <button
                        onClick={() => {
                          setViewingRequest(r);
                          setShowViewRequestModal(true);
                        }}
                        className="px-5 py-2 bg-[#4c75f2] hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400 font-medium">
                    No booking logs found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-2">
            <span className="text-xs text-slate-500 font-bold">
              Page {requestsPage} of {Math.ceil(filteredRequests.length / itemsPerPage)}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRequestsPage((prev) => Math.max(prev - 1, 1))}
                disabled={requestsPage === 1}
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg border ${requestsPage === 1
                    ? "opacity-30 border-slate-200 text-slate-400"
                    : "border-slate-200 hover:bg-slate-50 text-[#091b6f] cursor-pointer"
                  }`}
              >
                &lt;
              </button>

              <button
                onClick={() =>
                  setRequestsPage((prev) =>
                    Math.min(prev + 1, Math.ceil(filteredRequests.length / itemsPerPage))
                  )
                }
                disabled={requestsPage === Math.ceil(filteredRequests.length / itemsPerPage)}
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg border ${requestsPage === Math.ceil(filteredRequests.length / itemsPerPage)
                    ? "opacity-30 border-slate-200 text-slate-400"
                    : "border-slate-200 hover:bg-slate-50 text-[#091b6f] cursor-pointer"
                  }`}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
