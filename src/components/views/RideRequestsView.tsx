import React from "react";
import { RideRequest } from "../../types";

interface RideRequestsViewProps {
  filteredRequests: RideRequest[];
  statusFilter: string;
  setStatusFilter: (val: string) => void;
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
  requestTodaFilter,
  setRequestTodaFilter,
  requestSearch,
  setRequestSearch,
  setViewingRequest,
  setShowViewRequestModal,
}: RideRequestsViewProps) {
  const [showAllRequests, setShowAllRequests] = React.useState(false);
  const displayedRequests = showAllRequests ? filteredRequests : filteredRequests.slice(0, 9);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Category Filter Buttons Row */}
      <div className="bg-[#b3e2ff]/30 p-3 rounded-xl flex flex-wrap items-center gap-3 border border-[#b3e2ff]/50">
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          {[
            { key: "All", label: "All" },
            { key: "Ongoing", label: "Ongoing" },
            { key: "Pending", label: "Pending" },
            { key: "In Transit", label: "In Transit" },
            { key: "Completed", label: "Completed" },
            { key: "Cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
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
          onClick={() => setShowAllRequests(false)}
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
              }}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-[#091b6f] transition-all text-[#091b6f]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" id="requests-list-table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3 pl-3">Passenger</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Destination</th>
                <th className="pb-3">Driver</th>
                <th className="pb-3">TODA</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-center pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold divide-y divide-slate-50">
              {displayedRequests.map((r) => (
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

        {/* View All Button */}
        {filteredRequests.length > 9 && (
          <div className="flex justify-center pt-6 border-t border-slate-100 mt-2">
            {!showAllRequests ? (
              <button
                onClick={() => {
                  setShowAllRequests(true);
                  setTimeout(() => {
                    document.getElementById("requests-list-table")?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                View All ({filteredRequests.length} Requests)
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowAllRequests(false);
                  setTimeout(() => {
                    document.getElementById("requests-list-table")?.scrollIntoView({ behavior: "smooth" });
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
    </div>
  );
}
