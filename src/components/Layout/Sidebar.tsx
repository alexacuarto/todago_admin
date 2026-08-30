interface SidebarProps {
  activeTab: "dashboard" | "ride-requests" | "earnings" | "users" | "profile" | "create-driver" | "fare-settings";
  setActiveTab: (tab: "dashboard" | "ride-requests" | "earnings" | "users" | "profile" | "create-driver" | "fare-settings") => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  usersSubTab: "drivers" | "passengers";
  setUsersSubTab: (subTab: "drivers" | "passengers") => void;
}

type AdminNavTab = SidebarProps["activeTab"];

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  usersSubTab,
  setUsersSubTab,
}: SidebarProps) {
  const getTabClass = (tab: AdminNavTab) => {
    const isActive = activeTab === tab;
    if (isActive) {
      return "flex items-center gap-3 px-5 py-3 font-extrabold text-white bg-[#000C7D] border-y-2 border-r-2 border-l-[6px] border-[#000C7D] shadow-sm transition-all text-left w-full cursor-pointer";
    }
    return "flex items-center gap-3 px-5 py-3 font-bold text-[#000C7D] border-l-4 border-transparent hover:bg-white/40 transition-all text-left w-full cursor-pointer";
  };

  const goTo = (tab: AdminNavTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const goToUsers = (subTab: "drivers" | "passengers") => {
    setActiveTab("users");
    setUsersSubTab(subTab);
    setMobileMenuOpen(false);
  };

  const getUsersSubClass = (subTab: "drivers" | "passengers") =>
    `w-full text-left pl-14 pr-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
      activeTab === "users" && usersSubTab === subTab
        ? "text-[#000C7D] bg-white/70"
        : "text-slate-600 hover:text-[#000C7D] hover:bg-white/40"
    }`;

  return (
    <>
      <aside
        className={`
          bg-[#d2f4ff] w-64 h-full flex flex-col shrink-0 transition-transform duration-300 z-20
          absolute inset-y-0 left-0 md:relative md:inset-auto md:translate-x-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          shadow-lg md:shadow-none
        `}
      >
        <div className="p-4 flex justify-center bg-transparent">
          <img src="/branding/toda_go_logo_dark.png" alt="TodaGo" className="w-[140px] h-auto object-contain" />
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 overflow-hidden">
          <button onClick={() => goTo("dashboard")} className={getTabClass("dashboard")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button onClick={() => goTo("create-driver")} className={getTabClass("create-driver")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
              <path d="M5.5 16h13M8.5 10l2-4h5v4M4 11.5a2.5 2.5 0 0 1 2.5-2.5h2" />
              <path d="M12 10v6M18.5 16v-6h-7M3.5 13.5h2" />
            </svg>
            <span>Create Driver</span>
          </button>

          <button onClick={() => goTo("ride-requests")} className={getTabClass("ride-requests")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Ride Requests</span>
          </button>

          <button onClick={() => goTo("earnings")} className={getTabClass("earnings")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Earnings</span>
          </button>

          <button onClick={() => goTo("fare-settings")} className={getTabClass("fare-settings")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
            <span>Fare Settings</span>
          </button>

          <button onClick={() => goToUsers("drivers")} className={getTabClass("users")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Users Management</span>
          </button>
          <div className="flex flex-col">
            <button onClick={() => goToUsers("drivers")} className={getUsersSubClass("drivers")}>
              Drivers
            </button>
            <button onClick={() => goToUsers("passengers")} className={getUsersSubClass("passengers")}>
              Passengers
            </button>
          </div>
        </nav>
      </aside>

      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden absolute inset-0 bg-black/40 backdrop-blur-xs z-10"
        />
      )}
    </>
  );
}
