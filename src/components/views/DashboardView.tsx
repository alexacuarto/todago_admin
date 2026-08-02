import { Driver, RideRequest } from "../../types";

interface DashboardViewProps {
  rideRequests: RideRequest[];
  drivers: Driver[];
  onlineDriversCount: number;
  activeDriversCount: number;
  earningsToday: number;
  earningsWeekly: number;
  totalEarnings: number;
  setActiveTab: (tab: "dashboard" | "ride-requests" | "earnings" | "users" | "profile" | "create-driver") => void;
  setShowAddRequestModal: (show: boolean) => void;
  setShowEditDriverModal: (show: boolean) => void;
  setEditingDriver: (driver: Driver | null) => void;
  setEditFormData: (formData: any) => void;
  handleDeactivateToggle: (id: string) => void;
  setActiveStatModal: (modal: string | null) => void;
}

export default function DashboardView({
  rideRequests,
  drivers,
  onlineDriversCount,
  activeDriversCount,
  earningsToday,
  earningsWeekly,
  totalEarnings,
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
      {/* Stat Cards Row (SaaS Stripe/KPI compact style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Online Drivers Card */}
        <div
          onClick={() => setActiveStatModal("online-drivers")}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Online Drivers</span>
            <span className="text-3xl font-extrabold text-[#000C7D]">{onlineDriversCount}</span>
          </div>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <span className="absolute flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
        </div>

        {/* Active Drivers Card */}
        <div
          onClick={() => setActiveStatModal("active-drivers")}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Active Drivers</span>
            <span className="text-3xl font-extrabold text-[#000C7D]">{activeDriversCount}</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {/* Front Wheel */}
              <circle cx="6" cy="18" r="3" />
              {/* Rear Wheel */}
              <circle cx="18" cy="18" r="3" />
              {/* Frame & Cabin Outline */}
              <path d="M6 15h12M9 15l2-7h6l1 7M11 8V5h3" />
            </svg>
          </div>
        </div>

        {/* Total Earnings Card */}
        <div
          onClick={() => setActiveTab("earnings")}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in"
        >
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Earnings</span>
            <span className="text-3xl font-extrabold text-[#000C7D]">₱ {totalEarnings.toLocaleString()}</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Recent Ride Requests */}
        <div className="flex flex-col gap-6">
          {/* Recent Ride Requests Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#000C7D] font-bold text-lg">Recent Ride Request</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddRequestModal(true)}
                    className="text-xs text-[#000C7D] font-bold hover:underline cursor-pointer"
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
                    {rideRequests.slice(0, 5).map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 pl-3 text-left text-slate-700">{r.passenger}</td>
                        <td className="py-3.5 px-3 text-left text-slate-600">{r.driver}</td>
                        <td className="py-3.5 px-3 text-left text-slate-500">{r.location}</td>
                        <td className="py-3.5 text-right pr-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${r.status === "Completed"
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
        </div>

        {/* Right Column - Recent Management & Earnings Summary */}
        <div className="flex flex-col gap-6">
          {/* Recent Management Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#000C7D] font-bold text-lg">Recent Management</h2>
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
                      </td>
                      <td
                        className="py-3.5 px-3 text-left text-slate-600 max-w-[150px] truncate"
                        title={d.toda}
                      >
                        {d.toda}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${d.status === "Active"
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
                                toda: d.toda,
                                status: d.status,
                                email: d.email || "",
                                plateNumber: d.plateNumber || "",
                                licenseExpiryDate: d.licenseExpiryDate || "",
                                franchiseNumber: d.franchiseNumber || "",
                                franchiseExpiryDate: d.franchiseExpiryDate || "",
                              });
                              setShowEditDriverModal(true);
                            }}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeactivateToggle(d.id)}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${d.status === "Restricted"
                              ? "text-emerald-500 bg-emerald-50 hover:bg-emerald-100"
                              : "text-rose-500 bg-rose-50 hover:bg-rose-100"
                              }`}
                          >
                            {d.status === "Restricted" ? "Reactivate" : "Suspend"}
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
              <h2 className="text-[#000C7D] font-bold text-lg">Earnings Summary</h2>
            </div>

            <div className="flex flex-col gap-4">
              {/* Today's Earnings */}
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
                <div>
                  <p className="text-slate-600 text-sm font-semibold">Today's Earnings</p>
                </div>
                <p className="text-[#000C7D] font-extrabold text-lg">₱ {earningsToday.toLocaleString()}</p>
              </div>

              {/* Weekly Earnings */}
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
                <div>
                  <p className="text-slate-600 text-sm font-semibold">Weekly Earnings</p>
                </div>
                <p className="text-[#000C7D] font-extrabold text-lg">₱ {earningsWeekly.toLocaleString()}</p>
              </div>

              {/* Monthly Earnings */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-slate-600 text-sm font-semibold">Monthly Earnings</p>
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
