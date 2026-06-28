import React from "react";
import { Driver, Passenger, RideRequest } from "../../data/mockData";

interface StatBreakdownModalProps {
  isOpen: boolean;
  activeStatModal: string | null;
  onClose: () => void;
  drivers: Driver[];
  passengers: Passenger[];
  rideRequests: RideRequest[];
  earningsToday: number;
}

export default function StatBreakdownModal({
  isOpen,
  activeStatModal,
  onClose,
  drivers,
  passengers,
  rideRequests,
  earningsToday,
}: StatBreakdownModalProps) {
  if (!isOpen || !activeStatModal) return null;

  // Helper helper to get title based on type
  const getModalTitle = (type: string) => {
    switch (type) {
      case "total-drivers":
        return "Total Drivers Registered";
      case "active-drivers":
        return "Active Tricycle Drivers";
      case "users":
        return "Platform User Registry";
      case "trips-today":
        return "Today's Dispatch List";
      case "total-earnings":
        return "Total Transacted Volume";
      case "completed-rides":
        return "Lifetime Completed Rides";
      case "commission-earned":
        return "Platform Commissions (15%)";
      case "active-passengers":
        return "Active Passengers";
      case "registered-passengers":
        return "All Registered Passengers";
      default:
        return "System Audit Details";
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#0b1b6e] text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">Database Audit Log</span>
            <h3 className="font-bold text-lg">{getModalTitle(activeStatModal)}</h3>
          </div>
          <button onClick={onClose} className="text-white/85 hover:text-white transition-colors cursor-pointer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Contents */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-left">
          {/* CONTENT FOR: total-drivers */}
          {activeStatModal === "total-drivers" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-slate-500 font-semibold">
                Currently registered drivers in Tayabas TodaGo Portal. Total: {drivers.length}
              </p>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Name</th>
                      <th className="p-3">TODA</th>
                      <th className="p-3">Plate / Body</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {drivers.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <p className="font-bold text-[#091b6f]">{d.name}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{d.phone}</p>
                        </td>
                        <td className="p-3">{d.toda}</td>
                        <td className="p-3">
                          <p>{d.plateNumber}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{d.bodyNumber}</p>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              d.status === "Active"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-rose-50 text-rose-600 border border-rose-100"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONTENT FOR: active-drivers */}
          {activeStatModal === "active-drivers" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-slate-500 font-semibold">
                Currently active drivers. Total: {drivers.filter((d) => d.status === "Active").length}
              </p>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Name</th>
                      <th className="p-3">TODA</th>
                      <th className="p-3">Plate / Body</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {drivers
                      .filter((d) => d.status === "Active")
                      .map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <p className="font-bold text-[#091b6f]">{d.name}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{d.phone}</p>
                          </td>
                          <td className="p-3">{d.toda}</td>
                          <td className="p-3">
                            <p>{d.plateNumber}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{d.bodyNumber}</p>
                          </td>
                          <td className="p-3">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONTENT FOR: users */}
          {activeStatModal === "users" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 shrink-0">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Drivers</p>
                  <p className="text-2xl font-extrabold text-[#091b6f]">{drivers.length}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Passengers</p>
                  <p className="text-2xl font-extrabold text-indigo-600">{passengers.length}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-bold uppercase mt-2">Passenger Client Registry</p>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Name</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Rides Taken</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {passengers.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-[#091b6f]">{p.name}</td>
                        <td className="p-3">{p.contact}</td>
                        <td className="p-3">{p.ridesTaken} Rides</td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              p.status === "Active"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-rose-50 text-rose-600 border border-rose-100"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONTENT FOR: trips-today */}
          {activeStatModal === "trips-today" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-slate-500 font-semibold">
                Today's Ride Requests and Dispatches. Total: {rideRequests.length}
              </p>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Passenger</th>
                      <th className="p-3">Pickup / Destination</th>
                      <th className="p-3">Driver / TODA</th>
                      <th className="p-3">Fare</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {rideRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-[#091b6f]">{r.passenger}</td>
                        <td className="p-3">
                          <p className="font-bold text-slate-700">{r.location}</p>
                          <p className="text-[10px] text-slate-400 font-normal">→ {r.destination}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-600">{r.driver}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{r.toda}</p>
                        </td>
                        <td className="p-3 font-bold text-[#091b6f]">₱{r.fare}</td>
                        <td className="p-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              r.status === "Completed"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : r.status === "In Transit"
                                ? "bg-blue-50 text-blue-600 border border-blue-100"
                                : r.status === "Pending"
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-rose-50 text-rose-600 border border-rose-100"
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
          )}

          {/* CONTENT FOR: total-earnings */}
          {activeStatModal === "total-earnings" && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#091b6f] text-white p-5 rounded-2xl text-center">
                <p className="text-xs text-sky-200 font-bold uppercase tracking-wider">
                  Total Earnings (Baseline + Active Volume)
                </p>
                <p className="text-4xl font-extrabold mt-1">₱ {earningsToday.toLocaleString()}</p>
              </div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">TODA Earnings breakdown</h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3 font-semibold text-slate-600 text-sm">
                <div className="flex justify-between">
                  <span>LHITC-TODA (45%)</span>
                  <span className="font-bold text-slate-800">
                    ₱ {((earningsToday) * 0.45).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200/50 pt-2">
                  <span>CHOT-TODA (30%)</span>
                  <span className="font-bold text-slate-800">
                    ₱ {((earningsToday) * 0.30).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200/50 pt-2">
                  <span>BYPASS ILAYANG BAGUIO-TODA (25%)</span>
                  <span className="font-bold text-slate-800">
                    ₱ {((earningsToday) * 0.25).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200/50 pt-2 font-bold text-[#091b6f]">
                  <span>Total transacted volume</span>
                  <span>₱ {earningsToday.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT FOR: completed-rides */}
          {activeStatModal === "completed-rides" && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#091b6f] text-white p-5 rounded-2xl text-center">
                <p className="text-xs text-sky-200 font-bold uppercase tracking-wider">Total Completed Rides</p>
                <p className="text-4xl font-extrabold mt-1">1,250</p>
              </div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                completed transactions by association
              </h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3 font-semibold text-slate-600 text-sm">
                <div className="flex justify-between">
                  <span>LHITC-TODA</span>
                  <span className="font-bold text-slate-800">562 completed rides</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/50 pt-2">
                  <span>CHOT-TODA</span>
                  <span className="font-bold text-slate-800">375 completed rides</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/50 pt-2">
                  <span>BYPASS ILAYANG BAGUIO-TODA</span>
                  <span className="font-bold text-slate-800">313 completed rides</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/50 pt-2 font-bold text-[#091b6f]">
                  <span>Total platform rides</span>
                  <span>1,250 Completed Rides</span>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT FOR: commission-earned */}
          {activeStatModal === "commission-earned" && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#091b6f] text-white p-5 rounded-2xl text-center">
                <p className="text-xs text-sky-200 font-bold uppercase tracking-wider">
                  Total Platform Commission (15%)
                </p>
                <p className="text-4xl font-extrabold mt-1">₱ 10,000</p>
              </div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                commission breakdown by association
              </h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3 font-semibold text-slate-600 text-sm">
                <div className="flex justify-between">
                  <span>LHITC-TODA Commission Share</span>
                  <span className="font-bold text-slate-800">₱ 4,500</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/50 pt-2">
                  <span>CHOT-TODA Commission Share</span>
                  <span className="font-bold text-slate-800">₱ 3,000</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/50 pt-2">
                  <span>BYPASS ILAYANG BAGUIO-TODA Commission Share</span>
                  <span className="font-bold text-slate-800">₱ 2,500</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/50 pt-2 font-bold text-[#091b6f]">
                  <span>Total Platform Earnings Share</span>
                  <span>₱ 10,000</span>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT FOR: active-passengers */}
          {activeStatModal === "active-passengers" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-slate-500 font-semibold">
                Active passengers list. Total active: {passengers.filter((p) => p.status === "Active").length}
              </p>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Passenger</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Rides Taken</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {passengers
                      .filter((p) => p.status === "Active")
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-[#091b6f]">{p.name}</td>
                          <td className="p-3">{p.contact}</td>
                          <td className="p-3">{p.ridesTaken} Rides</td>
                          <td className="p-3">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONTENT FOR: registered-passengers */}
          {activeStatModal === "registered-passengers" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-slate-500 font-semibold">
                All registered passenger accounts. Total: {passengers.length}
              </p>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Passenger</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Rides Taken</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {passengers.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-[#091b6f]">{p.name}</td>
                        <td className="p-3">{p.contact}</td>
                        <td className="p-3">{p.ridesTaken} Rides</td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              p.status === "Active"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-rose-50 text-rose-600 border border-rose-100"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 shrink-0 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#091b6f] hover:bg-blue-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-sm hover:shadow"
          >
            Close Audit Detail
          </button>
        </div>
      </div>
    </div>
  );
}
