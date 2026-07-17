export interface Driver {
  id: string; // UUID from database
  name: string;
  toda: string;
  status: "Active" | "Inactive";
  phone: string;
  license: string;
  trips: number;
  email: string;
  plateNumber: string;
  isOnline: boolean;
  licensePhotoUrl?: string | null;
  joinedDate: string;
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
}

export interface Passenger {
  id: string; // UUID
  name: string;
  contact: string;
  canceledTrips: number;
  status: string;
  joinedDate: string;
  ridesTaken: number;
  warningStatus?: boolean;
  bookingRestrictionUntil?: string | null;
  lastCancelDate?: string | null;
}

export interface RideRequest {
  id: string; // UUID or ID
  passenger: string;
  passengerId: string;
  driver: string;
  driverId: string;
  location: string;
  destination: string;
  status: "Pending" | "In Transit" | "Scheduled" | "Completed" | "Cancelled";
  fare: number;
  time: string;
  toda: string;
  cancelled_by?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  cancel_reason?: string | null;
  cancel_details?: string | null;
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
