import React from "react";
import { Driver, EarningsRecord } from "../../data/mockData";

interface EarningsViewProps {
  drivers: Driver[];
  filteredEarnings: EarningsRecord[];
  earningsTodaFilter: string;
  setEarningsTodaFilter: (val: string) => void;
  earningsDriverFilter: string;
  setEarningsDriverFilter: (val: string) => void;
  earningsDateRange: string;
  setEarningsDateRange: (val: string) => void;
  earningsPage: number;
  setEarningsPage: React.Dispatch<React.SetStateAction<number>>;
  handleDownloadReport: () => void;
  setViewingEarningsRecord: (val: EarningsRecord | null) => void;
  setShowViewEarningsModal: (val: boolean) => void;
  setActiveStatModal: (val: string | null) => void;
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
  earningsPage,
  setEarningsPage,
  handleDownloadReport,
  setViewingEarningsRecord,
  setShowViewEarningsModal,
  setActiveStatModal,
}: EarningsViewProps) {
  const itemsPerPage = 9;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Earnings */}
        <div
          onClick={() => setActiveStatModal("total-earnings")}
          className="bg-[#091b6f] text-white p-8 rounded-3xl shadow-sm border border-blue-900/10 flex flex-col justify-between hover:shadow-md hover:scale-[1.02] hover:border-blue-700 transition-all duration-200 cursor-pointer animate-fade-in"
        >
          <p className="text-sky-200 font-bold text-xs uppercase tracking-wider">Total Earnings</p>
          <p className="text-4xl font-extrabold mt-3 font-sans">₱ 50,000</p>
          <span className="text-[11px] text-sky-200/60 font-semibold mt-6">Active Volume baseline</span>
        </div>

        {/* Total Completed Rides */}
        <div
          onClick={() => setActiveStatModal("completed-rides")}
          className="bg-[#091b6f] text-white p-8 rounded-3xl shadow-sm border border-blue-900/10 flex flex-col justify-between hover:shadow-md hover:scale-[1.02] hover:border-blue-700 transition-all duration-200 cursor-pointer text-left"
        >
          <p className="text-sky-200 font-bold text-xs uppercase tracking-wider">Total Completed Rides</p>
          <p className="text-4xl font-extrabold mt-3 font-sans">1,250</p>
          <span className="text-[11px] text-sky-200/60 font-semibold mt-6">Total platform transactions</span>
        </div>

        {/* Total Commission Earned */}
        <div
          onClick={() => setActiveStatModal("commission-earned")}
          className="bg-[#091b6f] text-white p-8 rounded-3xl shadow-sm border border-blue-900/10 flex flex-col justify-between hover:shadow-md hover:scale-[1.02] hover:border-blue-700 transition-all duration-200 cursor-pointer text-left"
        >
          <p className="text-sky-200 font-bold text-xs uppercase tracking-wider">Total Commission Earned</p>
          <p className="text-4xl font-extrabold mt-3 font-sans">₱ 10,000</p>
          <span className="text-[11px] text-sky-200/60 font-semibold mt-6">15% TODA commission margin</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#b3e2ff]/30 p-4 rounded-2xl flex flex-wrap items-center gap-4 border border-[#b3e2ff]/50">
        {/* TODA Dropdown Filter */}
        <div className="relative">
          <select
            value={earningsTodaFilter}
            onChange={(e) => {
              setEarningsTodaFilter(e.target.value);
              setEarningsPage(1);
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
              setEarningsPage(1);
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
          onClick={() => setEarningsPage(1)}
          className="px-6 py-2.5 bg-[#4c75f2] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
        >
          Apply Filter
        </button>
      </div>

      {/* Earnings Breakdown Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col gap-6">
        {/* Card Header with Download Report */}
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-5 pl-3 text-left">Date</th>
                <th className="pb-5 px-3 text-left">TODA</th>
                <th className="pb-5 px-3 text-left">Completed Rides</th>
                <th className="pb-5 px-3 text-left">Total Earnings</th>
                <th className="pb-5 px-3 text-left">Commission Earned</th>
                <th className="pb-5 text-center pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold divide-y divide-slate-50">
              {filteredEarnings
                .slice((earningsPage - 1) * itemsPerPage, earningsPage * itemsPerPage)
                .map((r) => (
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

        {/* Pagination */}
        {filteredEarnings.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
            <button
              onClick={() => setEarningsPage((prev) => Math.max(prev - 1, 1))}
              disabled={earningsPage === 1}
              className="text-xs font-bold text-blue-500 hover:underline disabled:opacity-30 disabled:no-underline cursor-pointer flex items-center gap-1"
            >
              &lt;&lt; Previous
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-bold">
                Page {earningsPage} of {Math.ceil(filteredEarnings.length / itemsPerPage)}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEarningsPage(1)}
                  className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg border ${
                    earningsPage === 1
                      ? "bg-slate-100 border-slate-200 text-[#091b6f]"
                      : "border-slate-200 hover:bg-slate-50 text-[#091b6f] cursor-pointer"
                  }`}
                >
                  &lt;&lt;
                </button>

                {Array.from(
                  { length: Math.ceil(filteredEarnings.length / itemsPerPage) },
                  (_, i) => i + 1
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => setEarningsPage(p)}
                    className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg border ${
                      earningsPage === p
                        ? "bg-blue-100 border-blue-200 text-blue-600 font-extrabold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setEarningsPage((prev) =>
                      Math.min(prev + 1, Math.ceil(filteredEarnings.length / itemsPerPage))
                    )
                  }
                  disabled={earningsPage === Math.ceil(filteredEarnings.length / itemsPerPage)}
                  className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg border ${
                    earningsPage === Math.ceil(filteredEarnings.length / itemsPerPage)
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
