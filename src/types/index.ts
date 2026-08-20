/**
 * Shared domain types for the TodaGo Admin Dashboard.
 * All data is sourced from Supabase — these types reflect the
 * live booking, profile, driver, passenger, and fare rows used by the app.
 */

export interface Driver {
  id: string;
  name: string;
  toda: string;
  status: "Active" | "Inactive" | "Restricted";
  isVerified?: boolean;
  phone: string;
  license: string;
  bodyNumber?: string;
  trips: number;
  joinedDate: string;
  email: string;
  plateNumber: string;
  isOnline: boolean;
  licensePhotoUrl?: string | null;
  avatarUrl?: string;
  licenseImageUrl?: string;
  licenseImageName?: string;
  activityStatus: "ACTIVE" | "INACTIVE";
  accountStatus?: string;
  licenseFrontUrl?: string | null;
  licenseBackUrl?: string | null;
  licenseExpiryDate?: string | null;
  franchiseUrl?: string | null;
  franchiseNumber?: string | null;
  franchiseExpiryDate?: string | null;
  documentStatus?: string;
  rejectionReason?: string | null;
  profileId: string;
  lastOnlineAt?: string | null;
  totalOnlineMinutes?: number;
  lastCompletedRideAt?: string | null;
  adminActionType?: string | null;
  adminActionReason?: string | null;
  adminActionDate?: string | null;
  adminActionBy?: string | null;
  documentIssueReason?: string | null;
}

export interface Passenger {
  id: string;
  profileId?: string;
  name: string;
  contact: string;
  email?: string;
  canceledTrips: number;
  status: string;
  joinedDate: string;
  ridesTaken: number;
  warningStatus?: boolean;
  bookingRestrictionUntil?: string | null;
  lastCancelDate?: string | null;
  avatarUrl?: string;
}

export interface RideRequest {
  id: string;
  passenger: string;
  passengerId: string;
  driver: string;
  driverId: string;
  location: string;
  destination: string;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  dropoffLatitude?: number | null;
  dropoffLongitude?: number | null;
  status: "Pending" | "In Transit" | "Scheduled" | "Completed" | "Cancelled";
  fare: number;
  time: string;
  requestedAt?: string;
  toda: string;
  cancelled_by?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  cancel_reason?: string | null;
  cancel_details?: string | null;
  regularPassengerCount?: number;
  studentPassengerCount?: number;
  pwdPassengerCount?: number;
  seniorPassengerCount?: number;
  earningId?: string;
  earningAmount?: number;
  earningDate?: string;
}

export interface EarningsRecord {
  id: string;
  date: string;
  toda: string;
  completedRides: number;
  totalEarnings: number;
  commissionEarned: number;
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

export interface CreateDriverFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  licenseNumber: string;
  plateNumber: string;
  toda: string;
  status: "Active" | "Inactive";
  licenseImage: File | null;
  licenseImageName: string;
}

export interface DriverEditFormData {
  name: string;
  phone: string;
  license: string;
  bodyNumber: string;
  toda: string;
  status: "Active" | "Inactive";
  email: string;
  password: string;
  plateNumber: string;
  isVerified: boolean;
  licenseImage: File | null;
  licenseImageName: string;
}

export interface PassengerEditFormData {
  name: string;
  contact: string;
  email: string;
  status: "Active" | "Inactive";
  password: string;
}
