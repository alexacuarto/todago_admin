import React from "react";
import { RideRequest } from "../../types";

interface RideRequestsViewProps {
  filteredRequests: RideRequest[];
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  requestSearch: string;
  setRequestSearch: (val: string) => void;
  setViewingRequest: (val: RideRequest | null) => void;
  setShowViewRequestModal: (val: boolean) => void;
}

const pageSize = 6;

const statusClass = (status: RideRequest["status"]) => {
  if (status === "Completed") return "bg-emerald-50 text-emerald-600 border border-emerald-100";
  if (status === "In Transit") return "bg-blue-50 text-blue-600 border border-blue-100";
  if (status === "Pending") return "bg-amber-100 text-amber-600 border border-amber-200";
  if (status === "Scheduled") return "bg-indigo-50 text-indigo-600 border border-indigo-100";
  return "bg-rose-50 text-rose-600 border border-rose-100";
};

export default function RideRequestsView({
  filteredRequests,
  statusFilter,
  setStatusFilter,
  requestSearch,
  setRequestSearch,
  setViewingRequest,
  setShowViewRequestModal,
}: RideRequestsViewProps) {
  const [page, setPage] = React.useState(1);
  const pageCount = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const displayedRequests = filteredRequests.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, requestSearch]);

  React.useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-[#000C7D] font-bold text-xl">Ride Requests</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">{filteredRequests.length} records from Supabase</p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto">
              {["All", "Ongoing", "Pending", "Completed", "Cancelled"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === tab
                      ? "bg-[#000C7D] text-white shadow-sm"
                      : "text-slate-600 hover:text-[#000C7D]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-64 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search rides"
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold outline-hidden focus:border-[#000C7D] transition-all text-[#000C7D]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3 pl-3">Passenger</th>
                <th className="pb-3 px-3">Driver</th>
                <th className="pb-3 px-3">Route</th>
                <th className="pb-3 px-3">Fare</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 text-center pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold divide-y divide-slate-50">
              {displayedRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 pl-3 text-[#000C7D] font-bold">{request.passenger}</td>
                  <td className="py-5 px-3 text-slate-700">{request.driver}</td>
                  <td className="py-5 px-3 text-slate-600 min-w-[260px]">
                    <p className="font-bold">{request.location}</p>
                    <p className="text-xs text-slate-400">{request.destination}</p>
                  </td>
                  <td className="py-5 px-3 text-[#000C7D] font-extrabold">₱{request.fare.toLocaleString()}</td>
                  <td className="py-5 px-3">
                    <span className={`inline-block px-4 py-1 rounded-full text-[10px] font-bold ${statusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="py-5 text-center pr-3">
                    <button
                      onClick={() => {
                        setViewingRequest(request);
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
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-medium">
                    No requests found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredRequests.length > pageSize && (
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400">
              Page {page} of {pageCount}
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
        )}
      </div>
    </div>
  );
}
