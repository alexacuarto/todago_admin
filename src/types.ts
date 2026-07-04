export interface Driver {
  id: string; // UUID from database
  name: string;
  toda: string;
  status: "Active" | "Inactive";
  phone: string;
  license: string;
  bodyNumber: string;
  trips: number;
  joinedDate: string;
  email: string;
  plateNumber: string;
}

export interface Passenger {
  id: string; // UUID
  name: string;
  contact: string;
  canceledTrips: number;
  status: "Active" | "Inactive";
  joinedDate: string;
  ridesTaken: number;
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
