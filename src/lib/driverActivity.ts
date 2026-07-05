import type { Driver } from "../types";

/**
 * Determines driver activity status based on the date of their most recent
 * completed trip. This is the SINGLE SOURCE OF TRUTH for driver activity
 * classification across the entire admin dashboard.
 *
 * Rules (strict):
 *   🟢 Active   — Last completed trip within 0–7 days
 *   🟡 Moderate — Last completed trip within 8–14 days
 *   ⚪ Inactive — No completed trips in 15+ days, or no bookings at all
 *
 * @param lastCompletedTripDate  ISO date string of the driver's most recent
 *                               completed booking, or null if they have none.
 * @returns "Active" | "Moderate" | "Inactive"
 */
export function getDriverActivityStatus(
  lastCompletedTripDate: string | null
): Driver["activityStatus"] {
  if (!lastCompletedTripDate) return "Inactive";

  const now = new Date();
  const tripDate = new Date(lastCompletedTripDate);
  const diffMs = now.getTime() - tripDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return "Active";
  if (diffDays <= 14) return "Moderate";
  return "Inactive";
}

/**
 * Returns Tailwind class strings for an activity status badge.
 * Use this everywhere a driver activity badge is rendered to ensure
 * visual consistency across DashboardView, UsersView, and ViewUserModal.
 */
export function getActivityBadgeClasses(
  activityStatus: Driver["activityStatus"]
): string {
  switch (activityStatus) {
    case "Active":
      return "bg-blue-50 text-blue-600 border border-blue-100";
    case "Moderate":
      return "bg-amber-50 text-amber-600 border border-amber-100";
    case "Inactive":
    default:
      return "bg-slate-50 text-slate-500 border border-slate-200";
  }
}
