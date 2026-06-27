import React from "react";
import { RideRequest } from "../../data/mockData";

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
  setViewingRequest: (val: RideRequest | null) => void;
  setShowViewRequestModal: (val: boolean) => void;
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
  setViewingRequest,
  setShowViewRequestModal,
}: RideRequestsViewProps) {
  const itemsPerPage = 9;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Category Filter Buttons Row */}
      <div className="bg-[#b3e2ff]/30 p-3 rounded-xl flex flex-wrap items-center gap-3 border border-[#b3e2ff]/50">
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          {[
            { key: "Ongoing", label: "Ongoing (15)" },
            { key: "Scheduled", label: "Scheduled" },
            { key: "Completed", label: "Completed" },
            { key: "Cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setRequestsPage(1);
              }}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-[#091b6f] text-white shadow-sm"
                  : "text-slate-600 hover:text-[#091b6f]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TODA Dropdown Filter */}
        <div className="relative">
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

        {/* Status / Date Filter */}
        <div className="relative">
          <select
            className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#091b6f] cursor-pointer appearance-none outline-hidden focus:border-blue-500"
            defaultValue="all-status"
          >
            <option value="all-status">All Status → Apr 2,2026</option>
            <option value="pending">Pending Only</option>
            <option value="intransit">In Transit Only</option>
          </select>
          <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>

        {/* Apply Filter Button */}
        <button
          onClick={() => setRequestsPage(1)}
          className="px-5 py-2 bg-[#4c75f2] hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
        >
          Apply Filter
        </button>
      </div>

      {/* Main List Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
        {/* Section Header with Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔔</span>
            <h2 className="text-[#091b6f] font-bold text-lg">
              {statusFilter} Ride Requests ({filteredRequests.length})
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
              <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3 pl-3">Passenger</th>
                <th className="pb-3">Pickup</th>
                <th className="pb-3">Destination</th>
                <th className="pb-3">Driver</th>
                <th className="pb-3">TODA</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-center pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold divide-y divide-slate-50">
              {filteredRequests
                .slice((requestsPage - 1) * itemsPerPage, requestsPage * itemsPerPage)
                .map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 pl-3 text-[#091b6f] font-bold">{r.passenger}</td>
                    <td className="py-5 px-2 text-slate-600">{r.location}</td>
                    <td className="py-5 px-2 text-slate-500">{r.destination}</td>
                    <td className="py-5 px-2 text-slate-700">{r.driver}</td>
                    <td className="py-5 px-2 text-slate-600">{r.toda}</td>
                    <td className="py-5">
                      <span
                        className={`inline-block px-4 py-1 rounded-full text-[10px] font-bold ${
                          r.status === "Completed"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : r.status === "In Transit"
                            ? "bg-emerald-500 text-white border border-emerald-600"
                            : r.status === "Pending"
                            ? "bg-amber-100 text-amber-600 border border-amber-200"
                            : r.status === "Scheduled"
                            ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
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
                  <td colSpan={7} className="py-16 text-center text-slate-400 font-medium">
                    No requests found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-2">
            <button
              onClick={() => setRequestsPage((prev) => Math.max(prev - 1, 1))}
              disabled={requestsPage === 1}
              className="text-xs font-bold text-blue-500 hover:underline disabled:opacity-30 disabled:no-underline cursor-pointer flex items-center gap-1"
            >
              &lt;&lt; Previous
            </button>

            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500 font-bold">
                Page {requestsPage} of {Math.ceil(filteredRequests.length / itemsPerPage)}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setRequestsPage(1)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg border ${
                    requestsPage === 1
                      ? "bg-slate-100 border-slate-200 text-[#091b6f]"
                      : "border-slate-200 hover:bg-slate-50 text-[#091b6f] cursor-pointer"
                  }`}
                >
                  &lt;&lt;
                </button>

                {Array.from(
                  { length: Math.ceil(filteredRequests.length / itemsPerPage) },
                  (_, i) => i + 1
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => setRequestsPage(p)}
                    className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg border ${
                      requestsPage === p
                        ? "bg-blue-100 border-blue-200 text-blue-600 font-extrabold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setRequestsPage((prev) =>
                      Math.min(prev + 1, Math.ceil(filteredRequests.length / itemsPerPage))
                    )
                  }
                  disabled={requestsPage === Math.ceil(filteredRequests.length / itemsPerPage)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg border ${
                    requestsPage === Math.ceil(filteredRequests.length / itemsPerPage)
                      ? "opacity-30 border-slate-200 text-slate-400"
                      : "border-slate-200 hover:bg-slate-50 text-[#091b6f] cursor-pointer"
                  }`}
                >
                  Next &gt;&gt;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
