import React from "react";

interface SidebarProps {
  activeTab: "dashboard" | "ride-requests" | "earnings" | "users" | "profile" | "create-driver";
  setActiveTab: (tab: "dashboard" | "ride-requests" | "earnings" | "users" | "profile" | "create-driver") => void;
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
  usersSubTab,
  setUsersSubTab,
}: SidebarProps) {
  return (
    <>
      <aside
        className={`
          bg-[#c7ebff] w-64 flex flex-col shrink-0 transition-transform duration-300 z-10
          absolute inset-y-0 left-0 md:relative md:translate-x-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          shadow-lg md:shadow-none
        `}
      >
        <nav className="flex-1 py-4 flex flex-col gap-1">
          {/* Dashboard Tab */}
          <button
            onClick={() => {
              setActiveTab("dashboard");
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-5 py-3 font-bold transition-all text-left border-l-4 w-full cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-white text-[#091b6f] border-[#091b6f] shadow-sm"
                : "text-[#091b6f] border-transparent hover:bg-white/40"
            }`}
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
            className={`flex items-center gap-3 px-5 py-3 font-bold transition-all text-left border-l-4 cursor-pointer w-full ${
              activeTab === "create-driver"
                ? "bg-white text-[#091b6f] border-[#091b6f] shadow-xs"
                : "text-[#091b6f] border-transparent hover:bg-white/40"
            }`}
          >
            {/* Philippine Tricycle Icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
              <path d="M5.5 16h13M8.5 10l2-4h5v4M4 11.5a2.5 2.5 0 0 1 2.5-2.5h2" />
              <path d="M12 10v6M18.5 16v-6h-7M3.5 13.5h2" />
            </svg>
            <span>Create Driver Account</span>
          </button>

          {/* Ride Requests Tab */}
          <button
            onClick={() => {
              setActiveTab("ride-requests");
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-5 py-3 font-bold transition-all text-left border-l-4 cursor-pointer w-full ${
              activeTab === "ride-requests"
                ? "bg-white text-[#091b6f] border-[#091b6f] shadow-xs"
                : "text-[#091b6f] border-transparent hover:bg-white/40"
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Ride Requests</span>
          </button>

          {/* Earnings Tab */}
          <button
            onClick={() => {
              setActiveTab("earnings");
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-5 py-3 font-bold transition-all text-left border-l-4 cursor-pointer w-full ${
              activeTab === "earnings"
                ? "bg-white text-[#091b6f] border-[#091b6f] shadow-xs"
                : "text-[#091b6f] border-transparent hover:bg-white/40"
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 8h6.5a2.5 2.5 0 0 1 0 5H8" />
              <path d="M8 10h6M8 12h6M8 8v10" />
            </svg>
            <span>Earnings</span>
          </button>

          {/* Users Management Tab */}
          <button
            onClick={() => {
              setActiveTab("users");
              setUsersSubTab("all");
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-5 py-3 font-bold transition-all text-left border-l-4 cursor-pointer w-full ${
              activeTab === "users"
                ? "bg-white text-[#091b6f] border-[#091b6f] shadow-xs"
                : "text-[#091b6f] border-transparent hover:bg-white/40"
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Users Management</span>
          </button>
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
