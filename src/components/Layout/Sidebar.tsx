interface SidebarProps {
  activeTab: "dashboard" | "ride-requests" | "earnings" | "users" | "profile" | "create-driver" | "fare-settings";
  setActiveTab: (tab: "dashboard" | "ride-requests" | "earnings" | "users" | "profile" | "create-driver" | "fare-settings") => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  usersSubTab: "all" | "drivers" | "passengers";
  setUsersSubTab: (subTab: "all" | "drivers" | "passengers") => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  setUsersSubTab,
}: SidebarProps) {
  const getTabClass = (tab: typeof activeTab) => {
    const isActive = activeTab === tab;
    if (isActive) {
      return "flex items-center gap-3 px-5 py-3 font-extrabold text-[#172554] bg-white border-y-2 border-r-2 border-l-[6px] border-[#172554] shadow-sm transition-all text-left w-full cursor-pointer";
    }
    return "flex items-center gap-3 px-5 py-3 font-bold text-[#000C7D] border-l-4 border-transparent hover:bg-white/40 transition-all text-left w-full cursor-pointer";
  };

  return (
    <>
      <aside
        className={`
          bg-[#d2f4ff] w-64 flex flex-col shrink-0 transition-transform duration-300 z-10
          absolute inset-y-0 left-0 md:relative md:translate-x-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          shadow-lg md:shadow-none
        `}
      >
        <div className="p-4 flex justify-center bg-transparent">
          <img src="/branding/toda_go_logo_dark.png" alt="Tricycle Icon" className="w-[140px] h-auto object-contain" />
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1">
          {/* Dashboard Tab */}
          <button
            onClick={() => {
              setActiveTab("dashboard");
              setMobileMenuOpen(false);
            }}
            className={getTabClass("dashboard")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Dashboard</span>
          </button>

          {/* Create Driver Account Tab */}
          <button
            onClick={() => {
              setActiveTab("create-driver");
              setMobileMenuOpen(false);
            }}
            className={getTabClass("create-driver")}
          >
            {/* Philippine Tricycle Icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
              <path d="M5.5 16h13M8.5 10l2-4h5v4M4 11.5a2.5 2.5 0 0 1 2.5-2.5h2" />
              <path d="M12 10v6M18.5 16v-6h-7M3.5 13.5h2" />
            </svg>
            <span>Create Driver</span>
          </button>

          {/* Booking Logs Tab */}
          <button
            onClick={() => {
              setActiveTab("ride-requests");
              setMobileMenuOpen(false);
            }}
            className={getTabClass("ride-requests")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Ride Requests</span>
          </button>

          {/* Fare Settings Tab */}
          <button
            onClick={() => {
              setActiveTab("fare-settings");
              setMobileMenuOpen(false);
            }}
            className={getTabClass("fare-settings")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span>Fare Settings</span>
          </button>

          {/* Users Management Tab */}
          <div className="relative group w-full">
            <button
              onClick={() => {
                setActiveTab("users");
                setUsersSubTab("all");
                setMobileMenuOpen(false);
              }}
              className={getTabClass("users")}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Users Management</span>
            </button>

            {/* Hover Submenu Flyout */}
            <div className="absolute left-[calc(100%-10px)] top-0 ml-2 hidden group-hover:flex flex-col bg-white border border-slate-150 rounded-2xl shadow-xl p-2.5 z-50 w-44 animate-in fade-in slide-in-from-left-2 duration-150">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab("users");
                  setUsersSubTab("drivers");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-[#000C7D] rounded-lg transition-colors cursor-pointer"
              >
                Tricycle Drivers
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab("users");
                  setUsersSubTab("passengers");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-[#000C7D] rounded-lg transition-colors cursor-pointer mt-1"
              >
                Passengers List
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden absolute inset-0 bg-black/40 backdrop-blur-xs z-10"
        ></div>
      )}
    </>
  );
}
