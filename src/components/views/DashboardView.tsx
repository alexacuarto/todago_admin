import React from "react";
import { Driver, RideRequest } from "../../data/mockData";

interface DashboardViewProps {
  rideRequests: RideRequest[];
  drivers: Driver[];
  totalDriversCount: number;
  activeDriversCount: number;
  usersCount: number;
  tripsCount: number;
  earningsToday: number;
  earningsWeekly: number;
  earningsMonthly: number;
  chartData: { label: string; val: number }[];
  hoveredBarIndex: number | null;
  setHoveredBarIndex: (idx: number | null) => void;
  chartTooltip: { x: number; y: number; val: number; label: string };
  setChartTooltip: (tooltip: { x: number; y: number; val: number; label: string }) => void;
  setActiveTab: (tab: "dashboard" | "ride-requests" | "earnings" | "users" | "profile" | "create-driver") => void;
  setShowAddRequestModal: (show: boolean) => void;
  setShowEditDriverModal: (show: boolean) => void;
  setEditingDriver: (driver: Driver | null) => void;
  setEditFormData: (formData: any) => void;
  handleDeactivateToggle: (id: number) => void;
  setActiveStatModal: (modal: string | null) => void;
}

export default function DashboardView({
  rideRequests,
  drivers,
  totalDriversCount,
  activeDriversCount,
  usersCount,
  tripsCount,
  earningsToday,
  earningsWeekly,
  earningsMonthly,
  chartData,
  hoveredBarIndex,
  setHoveredBarIndex,
  chartTooltip,
  setChartTooltip,
  setActiveTab,
  setShowAddRequestModal,
  setShowEditDriverModal,
  setEditingDriver,
  setEditFormData,
  handleDeactivateToggle,
  setActiveStatModal,
}: DashboardViewProps) {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Drivers */}
        <div
          onClick={() => setActiveStatModal("total-drivers")}
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md hover:scale-[1.02] hover:border-amber-200 transition-all duration-200 cursor-pointer"
        >
          <div className="relative w-16 h-16 bg-[#f5efd7] rounded-full flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src="/icons/total_drivers.png"
              alt="Total Drivers"
              className="absolute select-none pointer-events-none max-w-none"
              style={{
                width: "46.7px",
                height: "58.4px",
                left: "10.5px",
                top: "10.8px",
              }}
            />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Total drivers</p>
            <p className="text-3xl font-extrabold text-[#091b6f]">{totalDriversCount}</p>
          </div>
        </div>

        {/* Active Drivers */}
        <div
          onClick={() => setActiveStatModal("active-drivers")}
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md hover:scale-[1.02] hover:border-emerald-200 transition-all duration-200 cursor-pointer"
        >
          <div className="relative w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src="/icons/active_drivers.png"
              alt="Active Drivers"
              className="absolute select-none pointer-events-none max-w-none"
              style={{
                width: "69.5px",
                height: "87px",
                left: "0.7px",
                top: "6.2px",
              }}
            />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Active Drivers</p>
            <p className="text-3xl font-extrabold text-[#091b6f]">{activeDriversCount}</p>
          </div>
        </div>

        {/* Users */}
        <div
          onClick={() => setActiveStatModal("users")}
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md hover:scale-[1.02] hover:border-indigo-200 transition-all duration-200 cursor-pointer"
        >
          <div className="relative w-16 h-16 bg-[#c8d7ff] rounded-full flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src="/icons/users.png"
              alt="Users"
              className="absolute select-none pointer-events-none max-w-none"
              style={{
                width: "40.9px",
                height: "51.1px",
                left: "11.3px",
                top: "6.5px",
              }}
            />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Users</p>
            <p className="text-3xl font-extrabold text-[#091b6f]">{usersCount}</p>
          </div>
        </div>

        {/* Trips Today */}
        <div
          onClick={() => setActiveStatModal("trips-today")}
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md hover:scale-[1.02] hover:border-rose-200 transition-all duration-200 cursor-pointer"
        >
          <div className="relative w-16 h-16 bg-[#ffe7cc] rounded-full flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src="/icons/trips_today.png"
              alt="Trips Today"
              className="absolute select-none pointer-events-none max-w-none"
              style={{
                width: "41.6px",
                height: "52px",
                left: "10.1px",
                top: "4.1px",
              }}
            />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Trips Today</p>
            <p className="text-3xl font-extrabold text-[#091b6f]">{tripsCount}</p>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Columns (7 grid units) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Ride Activity Chart Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 relative overflow-visible">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[#091b6f] font-bold text-lg">Ride Activity</h2>
                <p className="text-xs text-slate-400 font-medium">Ride Requests Today</p>
              </div>
              <div className="text-slate-300 hover:text-slate-500 cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </div>
            </div>

            {/* Interactive SVG Bar Chart */}
            <div className="relative h-56 w-full mt-2">
              <svg viewBox="0 0 450 180" className="w-full h-full">
                {/* Grid Lines */}
                <line x1="30" y1="20" x2="420" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="60" x2="420" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="100" x2="420" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="140" x2="420" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="150" x2="420" y2="150" stroke="#4967cf" strokeWidth="1" />

                {/* Y-Axis Labels */}
                <text x="15" y="24" className="text-[10px] fill-slate-400 font-bold text-right" textAnchor="end">40</text>
                <text x="15" y="64" className="text-[10px] fill-slate-400 font-bold text-right" textAnchor="end">30</text>
                <text x="15" y="104" className="text-[10px] fill-slate-400 font-bold text-right" textAnchor="end">20</text>
                <text x="15" y="144" className="text-[10px] fill-slate-400 font-bold text-right" textAnchor="end">10</text>

                {/* Bars & Interactive Triggers */}
                {chartData.map((d, i) => {
                  const maxVal = 40;
                  const chartHeight = 130; // height from 20 to 150
                  const barHeight = (d.val / maxVal) * chartHeight;
                  const barWidth = 28;
                  const xSpacing = 65;
                  const startX = 50 + i * xSpacing;
                  const startY = 150 - barHeight;

                  return (
                    <g key={i}>
                      {/* Background highlight pill on hover */}
                      <rect
                        x={startX - 10}
                        y="10"
                        width={barWidth + 20}
                        height="145"
                        rx="8"
                        fill="transparent"
                        className="hover:fill-slate-50/50 cursor-pointer transition-colors"
                        onMouseEnter={() => {
                          setHoveredBarIndex(i);
                          setChartTooltip({
                            x: startX + barWidth / 2,
                            y: startY - 8,
                            val: d.val,
                            label: d.label,
                          });
                        }}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      />
                      {/* Actual Bar */}
                      <rect
                        x={startX}
                        y={startY}
                        width={barWidth}
                        height={barHeight}
                        rx="2"
                        className={`transition-all duration-300 ${
                          hoveredBarIndex === i ? "fill-[#2563eb]" : "fill-[#091b6f]"
                        }`}
                      />
                      {/* X-Axis Label */}
                      <text
                        x={startX + barWidth / 2}
                        y="168"
                        className="text-[9px] fill-slate-500 font-bold"
                        textAnchor="middle"
                      >
                        {d.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip Popup */}
              {hoveredBarIndex !== null && (
                <div
                  className="absolute bg-[#091b6f] text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all z-10"
                  style={{
                    left: `${(chartTooltip.x / 450) * 100}%`,
                    top: `${(chartTooltip.y / 180) * 100}%`,
                  }}
                >
                  {chartTooltip.val} Requests
                </div>
              )}
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="w-4 h-4 bg-[#091b6f] rounded-xs inline-block"></span>
              <span className="text-xs text-slate-500 font-bold">Ride Requests</span>
            </div>
          </div>

          {/* Recent Ride Requests Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#091b6f] font-bold text-lg">Recent Ride Request</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddRequestModal(true)}
                  className="text-xs text-[#091b6f] font-bold hover:underline cursor-pointer"
                >
                  + New Request
                </button>
                <button
                  onClick={() => setActiveTab("ride-requests")}
                  className="text-xs text-blue-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-3 text-left">Passenger</th>
                    <th className="pb-3 px-3 text-left">Driver</th>
                    <th className="pb-3 px-3 text-left">Location</th>
                    <th className="pb-3 text-right pr-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold divide-y divide-slate-50">
                  {rideRequests.slice(0, 3).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-3 text-left text-slate-700">{r.passenger}</td>
                      <td className="py-3.5 px-3 text-left text-slate-600">{r.driver}</td>
                      <td className="py-3.5 px-3 text-left text-slate-500">{r.location}</td>
                      <td className="py-3.5 text-right pr-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === "Completed"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : r.status === "In Transit"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Columns (5 grid units) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#091b6f] font-bold text-lg">Quick Actions</h2>
            </div>

            <button
              onClick={() => setActiveTab("create-driver")}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-3 group cursor-pointer hover:scale-[1.01]"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="group-hover:rotate-90 transition-transform duration-200"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Driver</span>
            </button>
          </div>

          {/* Recent Management Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#091b6f] font-bold text-lg">Recent Management</h2>
              <button
                onClick={() => setActiveTab("users")}
                className="text-xs text-blue-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <table className="w-full text-left border-collapse border-b border-slate-50">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-3 text-left">Driver</th>
                    <th className="pb-3 px-3 text-left">TODA</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold divide-y divide-slate-50">
                  {drivers.slice(0, 3).map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3.5 pl-3 text-left">
                        <p className="text-slate-700">{d.name}</p>
                        <p className="text-[10px] text-slate-400">{d.bodyNumber}</p>
                      </td>
                      <td
                        className="py-3.5 px-3 text-left text-slate-600 max-w-[150px] truncate"
                        title={d.toda}
                      >
                        {d.toda}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === "Active"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
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
                                plateNumber: d.plateNumber || "",
                              });
                              setShowEditDriverModal(true);
                            }}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeactivateToggle(d.id)}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                              d.status === "Active"
                                ? "text-rose-500 bg-rose-50 hover:bg-rose-100"
                                : "text-emerald-500 bg-emerald-50 hover:bg-emerald-100"
                            }`}
                          >
                            {d.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Earnings Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#091b6f] font-bold text-lg">Earnings Summary</h2>
            </div>

            <div className="flex flex-col gap-4">
              {/* Today's Earnings */}
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
                <div>
                  <p className="text-slate-600 text-sm font-semibold">Today's Earnings</p>
                  <p className="text-[10px] text-slate-400 font-bold">Target: ₱3,500</p>
                </div>
                <p className="text-[#091b6f] font-extrabold text-lg">₱ {earningsToday.toLocaleString()}</p>
              </div>

              {/* Weekly Earnings */}
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
                <div>
                  <p className="text-slate-600 text-sm font-semibold">Weekly Earnings</p>
                  <p className="text-[10px] text-slate-400 font-bold">Target: ₱18,200</p>
                </div>
                <p className="text-[#091b6f] font-extrabold text-lg">₱ {earningsWeekly.toLocaleString()}</p>
              </div>

              {/* Monthly Earnings */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-slate-600 text-sm font-semibold">Monthly Earnings</p>
                  <p className="text-[10px] text-slate-400 font-bold">Target: ₱72,500</p>
                </div>
                <button
                  onClick={() => setActiveTab("earnings")}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  View Earnings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
