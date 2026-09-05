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
              <h2 className="text-[#000C7D] font-bold text-lg">Earnings Summary</h2>
              <button
                onClick={() => setActiveTab("earnings")}
                className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
              >
                View Earnings
              </button>
            </div>

            <div className="flex flex-col divide-y divide-slate-50">
              {todaEarnings.slice(0, 4).map((record) => (
                <div key={record.toda} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-slate-700 text-sm font-bold truncate">{record.toda}</p>
                    <p className="text-xs text-slate-400 font-semibold">{record.rides} completed rides</p>
                  </div>
                  <p className="text-[#000C7D] font-extrabold text-lg shrink-0">{money(record.total)}</p>
                </div>
              ))}
              {todaEarnings.length === 0 && (
                <p className="py-6 text-center text-slate-400 text-sm font-semibold">No completed earnings yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
