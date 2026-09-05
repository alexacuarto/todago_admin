import { Driver, RideRequest } from "../../types";

interface EarningsViewProps {
  drivers: Driver[];
  rideRequests: RideRequest[];
  earningsTodaFilter: string;
  setEarningsTodaFilter: (val: string) => void;
}

const money = (value: number) => `₱${value.toLocaleString()}`;

export default function EarningsView({
  drivers,
  rideRequests,
  earningsTodaFilter,
  setEarningsTodaFilter,
}: EarningsViewProps) {
  const CANONICAL_TODAS = [
    "LHITC-TODA",
    "BYPASS ILAYANG BAGUIO-TODA",
    "CHOT-TODA"
  ];

  const todaOptions = Array.from(
    new Set([
      ...CANONICAL_TODAS,
      ...drivers.map((driver) => driver.toda).filter(Boolean)
    ])
  ).filter((t) => t !== "Not provided" && t !== "Unassigned").sort();

  const completedRequests = rideRequests.filter((request) => request.status === "Completed");
  const visibleRequests = earningsTodaFilter === "All"
    ? completedRequests
    : completedRequests.filter((request) => {
        const resolvedDriver = drivers.find(
          (d) => d.id === request.driverId || d.profileId === request.driverId || (request.driver && d.name === request.driver)
        );
        const toda = (request.toda && request.toda !== "Not provided" && request.toda !== "Unassigned")
          ? request.toda
          : resolvedDriver?.toda && resolvedDriver.toda !== "Not provided"
            ? resolvedDriver.toda
            : "LHITC-TODA";
        return toda === earningsTodaFilter;
      });

  const total = visibleRequests.reduce((sum, request) => sum + (request.fare || 0), 0);
  const totalRides = visibleRequests.length;

  const baseTodaTotals: Record<string, { toda: string; rides: number; total: number }> = {
    "LHITC-TODA": { toda: "LHITC-TODA", rides: 0, total: 0 },
    "BYPASS ILAYANG BAGUIO-TODA": { toda: "BYPASS ILAYANG BAGUIO-TODA", rides: 0, total: 0 },
    "CHOT-TODA": { toda: "CHOT-TODA", rides: 0, total: 0 },
  };

  const todaTotals = Object.values(
    completedRequests.reduce<Record<string, { toda: string; rides: number; total: number }>>((groups, request) => {
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
    }, baseTodaTotals)
  ).filter((g) => g.toda !== "Not provided" && g.toda !== "Unassigned")
   .sort((a, b) => b.total - a.total);

  const driverRows = Object.values(
    visibleRequests.reduce<Record<string, { driver: string; toda: string; rides: number; total: number }>>((groups, request) => {
      const resolvedDriver = drivers.find(
        (d) => d.id === request.driverId || d.profileId === request.driverId || (request.driver && d.name === request.driver)
      );
      const driverName = (request.driver && request.driver !== "Not provided" && request.driver !== "Unassigned")
        ? request.driver
        : resolvedDriver?.name || "Assigned Driver";
      const toda = (request.toda && request.toda !== "Not provided" && request.toda !== "Unassigned")
        ? request.toda
        : resolvedDriver?.toda && resolvedDriver.toda !== "Not provided"
          ? resolvedDriver.toda
          : "LHITC-TODA";

      const key = request.driverId || driverName;
      groups[key] ??= {
        driver: driverName,
        toda,
        rides: 0,
        total: 0,
      };
      groups[key].rides += 1;
      groups[key].total += request.fare || 0;
      return groups;
    }, {})
  ).sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Selected Total</p>
          <p className="text-3xl font-extrabold text-[#000C7D] mt-2">{money(total)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Completed Rides</p>
          <p className="text-3xl font-extrabold text-[#000C7D] mt-2">{totalRides}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">TODA Coverage</p>
          <p className="text-3xl font-extrabold text-[#000C7D] mt-2">{todaTotals.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-[#000C7D] font-bold text-xl">Earnings Breakdown</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Completed bookings grouped from Supabase data.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <select
              value={earningsTodaFilter}
              onChange={(event) => setEarningsTodaFilter(event.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#000C7D] cursor-pointer appearance-none outline-hidden focus:border-blue-500"
            >
              <option value="All">All TODAs</option>
              {todaOptions.map((toda) => (
                <option key={toda} value={toda}>
                  {toda}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>

        {earningsTodaFilter === "All" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {todaTotals.map((record) => (
              <div key={record.toda} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                <p className="text-sm font-bold text-[#000C7D] truncate" title={record.toda}>{record.toda}</p>
                <p className="text-xs text-slate-400 font-semibold mt-1">{record.rides} completed rides</p>
                <p className="text-xl font-extrabold text-slate-800 mt-3">{money(record.total)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3 pl-3">Driver</th>
                <th className="pb-3 px-3">TODA</th>
                <th className="pb-3 px-3">Completed Rides</th>
                <th className="pb-3 pr-3 text-right">Total Earnings</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold divide-y divide-slate-50">
              {driverRows.map((record) => (
                <tr key={`${record.toda}-${record.driver}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 pl-3 text-[#000C7D] font-bold">{record.driver}</td>
                  <td className="py-4 px-3 text-slate-600 max-w-[220px] truncate" title={record.toda}>
                    {record.toda}
                  </td>
                  <td className="py-4 px-3 text-slate-700">{record.rides}</td>
                  <td className="py-4 pr-3 text-right text-[#000C7D] font-extrabold">{money(record.total)}</td>
                </tr>
              ))}
              {driverRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    No completed earnings found for the selected TODA.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
