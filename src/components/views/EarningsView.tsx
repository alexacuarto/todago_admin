import React from "react";
import { Driver, EarningsRecord } from "../../types";

interface EarningsViewProps {
  drivers: Driver[];
  filteredEarnings: EarningsRecord[];
  earningsTodaFilter: string;
  setEarningsTodaFilter: (val: string) => void;
  earningsDriverFilter: string;
  setEarningsDriverFilter: (val: string) => void;
  earningsDateRange: string;
  setEarningsDateRange: (val: string) => void;
  handleDownloadReport: () => void;
  setViewingEarningsRecord: (val: EarningsRecord | null) => void;
  setShowViewEarningsModal: (val: boolean) => void;
}

export default function EarningsView({
  drivers,
  filteredEarnings,
  earningsTodaFilter,
  setEarningsTodaFilter,
  earningsDriverFilter,
  setEarningsDriverFilter,
  earningsDateRange,
  setEarningsDateRange,
  handleDownloadReport,
  setViewingEarningsRecord,
  setShowViewEarningsModal,
}: EarningsViewProps) {
  const [showAllEarnings, setShowAllEarnings] = React.useState(false);
  const displayedEarnings = showAllEarnings ? filteredEarnings : filteredEarnings.slice(0, 9);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto min-h-[calc(100vh-140px)]">

      {/* Filters Bar */}
      <div className="bg-[#b3e2ff]/30 p-4 rounded-2xl flex flex-wrap items-center gap-4 border border-[#b3e2ff]/50">
        {/* TODA Dropdown Filter */}
        <div className="relative">
          <select
            value={earningsTodaFilter}
            onChange={(e) => {
              setEarningsTodaFilter(e.target.value);
            }}
            className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#091b6f] cursor-pointer appearance-none outline-hidden focus:border-blue-500"
          >
            <option value="All">All TODAs</option>
            <option value="LHITC-TODA">LHITC-TODA</option>
            <option value="BYPASS ILAYANG BAGUIO-TODA">BYPASS ILAYANG BAGUIO-TODA</option>
            <option value="CHOT-TODA">CHOT-TODA</option>
          </select>
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>

        {/* Driver Dropdown Filter */}
        <div className="relative">
          <select
            value={earningsDriverFilter}
            onChange={(e) => {
              setEarningsDriverFilter(e.target.value);
            }}
            className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#091b6f] cursor-pointer appearance-none outline-hidden focus:border-blue-500"
          >
            <option value="All">All Drivers</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>

        {/* Date range selection */}
        <div className="relative">
          <select
            value={earningsDateRange}
            onChange={(e) => setEarningsDateRange(e.target.value)}
            className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#091b6f] cursor-pointer appearance-none outline-hidden focus:border-blue-500"
          >
            <option value="April 1, 2024- April 30, 2026">April 1, 2024- April 30, 2026</option>
            <option value="today">Today Only</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
          </select>
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>

        {/* Apply Filter Button */}
        <button
          onClick={() => setShowAllEarnings(false)}
          className="px-6 py-2.5 bg-[#4c75f2] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
        >
          Apply Filter
        </button>
      </div>

      {/* Earnings Breakdown Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col gap-6 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[#091b6f] font-bold text-xl">Earnings Breakdown</h3>

          {/* Download Report Button */}
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2.5 px-6 py-3 bg-[#4c75f2] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download Report</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" id="earnings-list-table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3 pl-3">Date</th>
                <th className="pb-3">TODA</th>
                <th className="pb-3">Completed Rides</th>
                <th className="pb-3">Total Earnings</th>
                <th className="pb-3">Commission (10%)</th>
                <th className="pb-3 text-center pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold divide-y divide-slate-50">
              {displayedEarnings.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-6 pl-3 text-left text-[#091b6f] font-semibold">{r.date}</td>
                  <td
                    className="py-6 px-3 text-left text-slate-600 max-w-[180px] truncate"
                    title={r.toda}
                  >
                    {r.toda}
                  </td>
                  <td className="py-6 px-3 text-left text-slate-700">{r.completedRides}</td>
                  <td className="py-6 px-3 text-left text-slate-800 font-bold">
                    ₱{r.totalEarnings.toLocaleString()}
                  </td>
                  <td className="py-6 px-3 text-left text-[#091b6f] font-extrabold">
                    ₱{r.commissionEarned.toLocaleString()}
                  </td>
                  <td className="py-6 text-center pr-3">
                    <button
                      onClick={() => {
                        setViewingEarningsRecord(r);
                        setShowViewEarningsModal(true);
                      }}
                      className="px-5 py-2 bg-[#4c75f2] hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEarnings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No financial records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* View All Button */}
        {filteredEarnings.length > 9 && (
          <div className="flex justify-center pt-4 border-t border-slate-100 mt-2">
            {!showAllEarnings ? (
              <button
                onClick={() => {
                  setShowAllEarnings(true);
                  setTimeout(() => {
                    document.getElementById("earnings-list-table")?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                View All ({filteredEarnings.length} Records)
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowAllEarnings(false);
                  setTimeout(() => {
                    document.getElementById("earnings-list-table")?.scrollIntoView({ behavior: "smooth" });
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
