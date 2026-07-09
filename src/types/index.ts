/**
 * Shared domain types for the TodaGo Admin Dashboard.
 * All data is sourced from Supabase — these types reflect the
 * shape returned by adminDataService after mapping database rows.
 */

export interface Driver {
  id: number | string;
  name: string;
  toda: string;
  status: "Active" | "Inactive";
  isVerified: boolean;
  phone: string;
  license: string;
  bodyNumber: string;
  trips: number;
  joinedDate: string;
  email: string;
  plateNumber: string;
  avatarUrl?: string;
  licenseImageUrl?: string;
  licenseImageName?: string;
}

export interface Passenger {
  id: number | string;
  name: string;
  contact: string;
  email: string;
  canceledTrips: number;
  status: "Active" | "Inactive";
  joinedDate: string;
  ridesTaken: number;
  avatarUrl?: string;
}

export interface RideRequest {
  id: number | string;
  passenger: string;
  driver: string;
  location: string;
  destination: string;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  dropoffLatitude: number | null;
  dropoffLongitude: number | null;
  status: "Pending" | "In Transit" | "Scheduled" | "Completed" | "Cancelled";
  fare: number;
  time: string;
  requestedAt: string;
  toda: string;
  earningId?: string;
  earningAmount: number;
  earningDate: string;
}

export interface EarningsRecord {
  id: number | string;
  date: string;
  toda: string;
  completedRides: number;
  totalEarnings: number;
  driverName?: string;
}

export type TripType = "one_way" | "round_trip";
export type AdminTab =
  | "dashboard"
  | "ride-requests"
  | "fare-settings"
  | "admin-management"
  | "users"
  | "profile"
  | "create-driver";

export interface FareSetting {
  tripType: TripType;
  label: string;
  baseFare: number;
  includedKm: number;
  perSucceedingKm: number;
  studentDiscountPercent: number;
  pwdDiscountPercent: number;
  seniorDiscountPercent: number;
  isActive: boolean;
  updatedAt: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  isPrimaryAdmin: boolean;
  createdAt: string;
}
