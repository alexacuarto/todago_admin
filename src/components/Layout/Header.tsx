import React from "react";

interface HeaderProps {
  adminProfile: {
    name: string;
    avatarUrl: string;
    avatarColor: string;
  };
  setActiveTab: (tab: "dashboard" | "ride-requests" | "earnings" | "users" | "profile" | "create-driver") => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Header({
  adminProfile,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}: HeaderProps) {
  return (
    <header className="bg-[#0b1b6e] text-white flex items-center justify-between px-6 py-3 shadow-md z-20 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile menu hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded hover:bg-white/10 transition-colors"
          aria-label="Toggle Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xl tracking-wider bg-white text-[#0b1b6e] px-2.5 py-0.5 rounded-md shadow-sm">
            TodaGo
          </span>
          <span className="text-sky-200 text-xs font-semibold uppercase tracking-widest hidden sm:inline-block border-l border-white/20 pl-2">
            Management Portal
          </span>
        </div>
      </div>

      <div
        onClick={() => setActiveTab("profile")}
        className="flex items-center gap-3 cursor-pointer group relative"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold tracking-wide">{adminProfile.name}</p>
          <p className="text-[10px] text-sky-200">System Operator</p>
        </div>

        {/* Beautiful Custom Avatar */}
        <div className="relative">
          {adminProfile.avatarUrl ? (
            <img
              src={adminProfile.avatarUrl}
              alt="Admin Avatar"
              className="w-[38px] h-[38px] rounded-full object-cover shadow-inner border-2 border-sky-300"
            />
          ) : (
            <svg width="38" height="38" viewBox="0 0 40 40" className="rounded-full shadow-inner border-2 border-sky-300">
              <circle cx="20" cy="20" r="18" fill={adminProfile.avatarColor || "#38bdf8"} />
              <mask id="mask-avatar" maskUnits="userSpaceOnUse" x="2" y="2" width="36" height="36">
                <circle cx="20" cy="20" r="18" fill="#FFFFFF" />
              </mask>
              <g mask="url(#mask-avatar)">
                <path d="M9 16C9 10 14 8 20 8C26 8 31 10 31 16C31 22 28 24 28 27C28 30 20 31 20 31C20 31 12 30 12 27C12 24 9 22 9 16Z" fill="#1e1b4b" />
                <circle cx="20" cy="19" r="7" fill="#fed7aa" />
                <path d="M14 15C16 13 18 13 20 14C22 13 24 13 26 15C26 15 24 11 20 11C16 11 14 15 14 15Z" fill="#1e1b4b" />
                <path d="M10 36C10 31 14 29 20 29C26 29 30 31 30 36H10Z" fill="#4f46e5" />
                <path d="M20 29V32" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" />
              </g>
            </svg>
          )}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0b1b6e] rounded-full"></span>
        </div>

        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-200 group-hover:text-white transition-colors">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </header>
  );
}
