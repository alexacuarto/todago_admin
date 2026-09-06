import { useState } from "react";
import { Driver, RideRequest } from "../../types";

interface DashboardViewProps {
  rideRequests: RideRequest[];
  drivers: Driver[];
  onlineDriversCount: number;
  activeDriversCount: number;
  totalEarnings: number;
  setActiveTab: (tab: "dashboard" | "ride-requests" | "earnings" | "users" | "feedback" | "profile" | "create-driver" | "fare-settings") => void;
  setActiveStatModal?: (modal: string | null) => void;
}

const money = (value: number) => `₱ ${value.toLocaleString()}`;

const statusClass = (status: RideRequest["status"]) => {
  if (status === "Completed") return "bg-emerald-50 text-emerald-600 border border-emerald-100";
  if (status === "In Transit") return "bg-blue-50 text-blue-600 border border-blue-100";
  if (status === "Cancelled") return "bg-rose-50 text-rose-600 border border-rose-100";
  return "bg-amber-50 text-amber-600 border border-amber-100";
};

const TODA_PALETTE: Record<string, { fill: string; hover: string; stroke: string; dot: string; text: string }> = {
  "LHITC-TODA": {
    fill: "#000C7D",
    hover: "#001099",
    stroke: "#000852",
    dot: "bg-[#000C7D]",
    text: "text-[#000C7D]",
  },
  "BYPASS ILAYANG BAGUIO-TODA": {
    fill: "#0284C7",
    hover: "#0ea5e9",
    stroke: "#0369A1",
    dot: "bg-sky-600",
    text: "text-sky-600",
  },
  "CHOT-TODA": {
    fill: "#10B981",
    hover: "#34d399",
    stroke: "#059669",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
  },
};

const EXTRA_PALETTE = [
  { fill: "#F59E0B", hover: "#fbbf24", stroke: "#d97706", dot: "bg-amber-500", text: "text-amber-600" },
  { fill: "#8B5CF6", hover: "#a78bfa", stroke: "#7c3aed", dot: "bg-purple-500", text: "text-purple-600" },
  { fill: "#EC4899", hover: "#f472b6", stroke: "#db2777", dot: "bg-pink-500", text: "text-pink-600" },
];

function getTodaStyle(toda: string, index: number) {
  if (TODA_PALETTE[toda]) {
    return TODA_PALETTE[toda];
  }
  return EXTRA_PALETTE[index % EXTRA_PALETTE.length];
}

function getDonutSlicePath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
): string {
  const diff = endAngle - startAngle;
  if (diff <= 0.0001) return "";

  if (diff >= 2 * Math.PI - 0.0001) {
    const midAngle = startAngle + Math.PI;
    const p1 = getDonutSlicePath(cx, cy, rInner, rOuter, startAngle, midAngle);
    const p2 = getDonutSlicePath(cx, cy, rInner, rOuter, midAngle, endAngle);
    return `${p1} ${p2}`;
  }

  const x1Outer = cx + rOuter * Math.cos(startAngle);
  const y1Outer = cy + rOuter * Math.sin(startAngle);
  const x2Outer = cx + rOuter * Math.cos(endAngle);
  const y2Outer = cy + rOuter * Math.sin(endAngle);

  const x1Inner = cx + rInner * Math.cos(endAngle);
  const y1Inner = cy + rInner * Math.sin(endAngle);
  const x2Inner = cx + rInner * Math.cos(startAngle);
  const y2Inner = cy + rInner * Math.sin(startAngle);

  const largeArcFlag = diff > Math.PI ? 1 : 0;

  return [
    `M ${x1Outer} ${y1Outer}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
    `L ${x1Inner} ${y1Inner}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x2Inner} ${y2Inner}`,
    "Z",
  ].join(" ");
}

export default function DashboardView({
  rideRequests,
  drivers,
  onlineDriversCount,
  activeDriversCount,
  totalEarnings,
  setActiveTab,
}: DashboardViewProps) {
  const todaEarnings = Object.values(
    rideRequests
      .filter((request) => request.status === "Completed")
      .reduce<Record<string, { toda: string; rides: number; total: number }>>((groups, request) => {
        const resolvedDriver = drivers.find(
          (d) => d.id === request.driverId || d.profileId === request.driverId || (request.driver && d.name === request.driver)
        );
        const toda = (request.toda && request.toda !== "Not provided" && request.toda !== "Unassigned")
          ? request.toda
          : resolvedDriver?.toda && resolvedDriver.toda !== "Not provided"
            ? resolvedDriver.toda
            : "LHITC-TODA";

        groups[toda] ??= { toda, rides: 0, total: 0 };
        groups[toda].rides += 1;
        groups[toda].total += request.fare || 0;
        return groups;
      }, {
        "LHITC-TODA": { toda: "LHITC-TODA", rides: 0, total: 0 },
        "BYPASS ILAYANG BAGUIO-TODA": { toda: "BYPASS ILAYANG BAGUIO-TODA", rides: 0, total: 0 },
        "CHOT-TODA": { toda: "CHOT-TODA", rides: 0, total: 0 },
      })
  ).filter((g) => g.toda !== "Not provided" && g.toda !== "Unassigned")
    .sort((a, b) => b.total - a.total);

  const [hoveredToda, setHoveredToda] = useState<string | null>(null);

  const todaSum = todaEarnings.reduce((sum, item) => sum + item.total, 0);

  let currentAngle = -Math.PI / 2;
  const pieSlices = todaEarnings.map((record, idx) => {
    const share = todaSum > 0 ? record.total / todaSum : 0;
    const angleDelta = share * 2 * Math.PI;
    const start = currentAngle;
    const end = currentAngle + angleDelta;
    currentAngle += angleDelta;

    return {
      toda: record.toda,
      rides: record.rides,
      total: record.total,
      share,
      percentageStr: `${(share * 100).toFixed(1)}%`,
      startAngle: start,
      endAngle: end,
      style: getTodaStyle(record.toda, idx),
    };
  });

  const activeHoveredSlice = pieSlices.find((s) => s.toda === hoveredToda);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Online Drivers</span>
          <span className="text-3xl font-extrabold text-[#000C7D] mt-1">{onlineDriversCount}</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Active Drivers</span>
          <span className="text-3xl font-extrabold text-[#000C7D] mt-1">{activeDriversCount}</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Earnings</span>
          <span className="text-3xl font-extrabold text-[#000C7D] mt-1">{money(totalEarnings)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#000C7D] font-bold text-lg">Recent Ride Request</h2>
            <button
              onClick={() => setActiveTab("ride-requests")}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-3">Passenger</th>
                  <th className="pb-3 px-3">Driver</th>
                  <th className="pb-3 px-3">Location</th>
                  <th className="pb-3 text-right pr-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold divide-y divide-slate-50">
                {rideRequests.slice(0, 4).map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 pl-3 text-slate-700">{request.passenger}</td>
                    <td className="py-3.5 px-3 text-slate-600">{request.driver}</td>
                    <td className="py-3.5 px-3 text-slate-600 min-w-[220px]">
                      <p className="font-bold">{request.location}</p>
                      <p className="text-xs text-slate-400">{request.destination}</p>
                    </td>
                    <td className="py-3.5 text-right pr-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusClass(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {rideRequests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400 font-medium">
                      No ride requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#000C7D] font-bold text-lg">Recent Driver Management</h2>
              <button
                onClick={() => setActiveTab("users")}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border-b border-slate-50">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-3">Driver</th>
                    <th className="pb-3 px-3">TODA</th>
                    <th className="pb-3 text-right pr-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold divide-y divide-slate-50">
                  {drivers.slice(0, 4).map((driver) => (
                    <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-3 text-slate-700">{driver.name}</td>
                      <td className="py-3.5 px-3 text-slate-600 max-w-[180px] truncate" title={driver.toda}>
                        {driver.toda}
                      </td>
                      <td className="py-3.5 pr-3 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            driver.status === "Active"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                        >
                          {driver.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {drivers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-10 text-center text-slate-400 font-medium">
                        No drivers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[#000C7D] font-bold text-lg">TODA Earnings Breakdown</h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Distribution by tricycle association</p>
              </div>
              <button
                onClick={() => setActiveTab("earnings")}
                className="text-xs text-blue-600 font-bold hover:underline cursor-pointer shrink-0"
              >
                View Details
              </button>
            </div>

            {todaSum > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                {/* SVG Donut / Pie Chart */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <svg
                    width="190"
                    height="190"
                    viewBox="0 0 210 210"
                    className="overflow-visible select-none"
                  >
                    <defs>
                      <filter id="pie-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.18" />
                      </filter>
                    </defs>

                    {pieSlices.map((slice) => {
                      const isHovered = hoveredToda === slice.toda;
                      const rOuter = isHovered ? 88 : 82;
                      const rInner = isHovered ? 49 : 52;
                      const pathData = getDonutSlicePath(
                        105,
                        105,
                        rInner,
                        rOuter,
                        slice.startAngle,
                        slice.endAngle
                      );

                      if (!pathData) return null;

                      return (
                        <path
                          key={slice.toda}
                          d={pathData}
                          fill={slice.style.fill}
                          stroke="#ffffff"
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          className="transition-all duration-200 cursor-pointer"
                          style={{
                            filter: isHovered ? "url(#pie-glow)" : "none",
                            transformOrigin: "105px 105px",
                          }}
                          onMouseEnter={() => setHoveredToda(slice.toda)}
                          onMouseLeave={() => setHoveredToda(null)}
                        >
                          <title>{`${slice.toda}: ${money(slice.total)} (${slice.percentageStr})`}</title>
                        </path>
                      );
                    })}
                  </svg>

                  {/* Centered Donut Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                    {activeHoveredSlice ? (
                      <>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[100px]">
                          {activeHoveredSlice.toda.replace(/-TODA$/, "")}
                        </span>
                        <span className="text-base font-extrabold text-[#000C7D] leading-tight mt-0.5">
                          {money(activeHoveredSlice.total)}
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-1">
                          {activeHoveredSlice.percentageStr}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Total
                        </span>
                        <span className="text-base font-extrabold text-[#000C7D] leading-tight mt-0.5">
                          {money(todaSum)}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          All TODAs
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Legend & Breakdown Cards */}
                <div className="flex flex-col gap-2 w-full flex-1">
                  {pieSlices.map((slice) => {
                    const isHovered = hoveredToda === slice.toda;
                    return (
                      <div
                        key={slice.toda}
                        onMouseEnter={() => setHoveredToda(slice.toda)}
                        onMouseLeave={() => setHoveredToda(null)}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isHovered
                            ? "bg-slate-50 border-slate-300 shadow-xs scale-[1.01]"
                            : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: slice.style.fill }}
                          />
                          <div className="min-w-0">
                            <p className="text-slate-800 text-xs font-bold truncate" title={slice.toda}>
                              {slice.toda}
                            </p>
                            <p className="text-[11px] text-slate-400 font-semibold">
                              {slice.rides} rides • <span className="font-bold text-slate-600">{slice.percentageStr}</span>
                            </p>
                          </div>
                        </div>
                        <p className={`text-sm font-extrabold shrink-0 ${slice.style.text}`}>
                          {money(slice.total)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <svg width="120" height="120" viewBox="0 0 120 120" className="text-slate-200">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="16" />
                </svg>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  No completed earnings yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
