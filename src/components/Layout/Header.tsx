import { AdminNotification } from "../../lib/notificationService";
interface HeaderProps {
  adminProfile: {
    name: string;
    avatarUrl: string;
    avatarColor: string;
    isPrimaryAdmin?: boolean;
  };
  notifications: AdminNotification[];
  onMarkNotificationsRead: () => void;
  onRefreshDashboard: () => void;
  isRefreshingDashboard: boolean;
  onOpenProfile: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Header({
  adminProfile,
  notifications,
  onMarkNotificationsRead,
  onRefreshDashboard,
  isRefreshingDashboard,
  onOpenProfile,
  mobileMenuOpen,
  setMobileMenuOpen,
}: HeaderProps) {
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <header className="bg-[#0b1b6e] text-white flex items-center justify-between gap-2 px-3 py-3 shadow-md z-30 shrink-0 sticky top-0 sm:px-5 sm:py-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Mobile menu hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Toggle Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="flex min-w-0 items-center gap-2">
          <img
            src="/icons/todago-white.png"
            alt="TodaGo Logo"
            className="h-11 object-contain sm:h-14 lg:h-16"
          />
          <span className="text-sky-200 text-xs font-semibold uppercase tracking-widest hidden sm:inline-block border-l border-white/20 pl-2">
            Management Portal
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={onRefreshDashboard}
          disabled={isRefreshingDashboard}
          className="rounded-full bg-white/15 p-2 transition-colors hover:bg-white/20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 sm:p-2.5"
          aria-label="Refresh dashboard"
          title="Refresh dashboard"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            className={isRefreshingDashboard ? "animate-spin" : ""}
          >
            <path d="M21 12a9 9 0 0 1-15.5 6.2" />
            <path d="M3 12A9 9 0 0 1 18.5 5.8" />
            <path d="M18 2v4h-4" />
            <path d="M6 22v-4h4" />
          </svg>
        </button>
        <div className="relative group">
          <button
            className="relative rounded-full bg-white/15 p-2 hover:bg-white/20 transition-colors cursor-pointer sm:p-2.5"
            aria-label="Notifications"
            onClick={onMarkNotificationsRead}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <div className="invisible fixed right-2 top-16 z-30 w-[calc(100vw-1rem)] max-w-80 translate-y-1 rounded-xl border border-slate-100 bg-white p-3 text-slate-700 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 sm:absolute sm:right-0 sm:top-11 sm:w-80">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#091b6f]">Notifications</p>
              <span className="text-[10px] font-bold text-slate-400">{unreadCount} unread</span>
            </div>
            {notifications.length === 0 ? (
              <p className="py-5 text-center text-xs font-semibold text-slate-400">No notifications yet.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.slice(0, 8).map((notification) => (
                  <div
                    key={notification.id}
                    className={`mb-2 rounded-lg p-3 text-left ${notification.isRead ? "bg-slate-50" : "bg-blue-50"
                      }`}
                  >
                    <p className="break-anywhere text-sm font-extrabold text-[#091b6f]">{notification.title}</p>
                    <p className="break-anywhere mt-1 text-xs font-semibold text-slate-500">{notification.message}</p>
                    <p className="mt-2 text-[10px] font-bold text-slate-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer group relative"
        >
          <div className="text-right hidden sm:block">
            <p className="max-w-36 truncate text-sm font-bold tracking-wide">{adminProfile.name}</p>
            <p className="text-[10px] text-sky-200">
              {adminProfile.isPrimaryAdmin ? "Super Admin" : "Administrator"}
            </p>
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

          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden text-sky-200 transition-colors group-hover:text-white sm:block">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </header>
  );
}
