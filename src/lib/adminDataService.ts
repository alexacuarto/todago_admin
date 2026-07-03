import { supabase } from "./supabase";
import { Driver, EarningsRecord, Passenger, RideRequest } from "../types";

type ProfileRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: "passenger" | "driver" | "admin";
  is_active: boolean;
};

type DriverRow = {
  id: string;
  user_id: string;
  license_number: string | null;
  tricycle_body_number: string | null;
  plate_number: string | null;
  status: "offline" | "online" | "busy" | "suspended";
  created_at: string;
};

type PassengerRow = {
  id: string;
  user_id: string;
  created_at: string;
};

type RideRow = {
  id: string;
  passenger_id: string;
  driver_id: string | null;
  pickup_address: string;
  dropoff_address: string | null;
  status: string;
  fare_amount: number;
  requested_at: string;
};

type DriverEarningRow = {
  id: string;
  driver_id: string;
  ride_id: string;
  created_at: string;
  gross_fare: number;
};

function statusToAdmin(status: string): RideRequest["status"] {
  if (status === "completed") return "Completed";
  if (status === "cancelled" || status === "rejected") return "Cancelled";
  if (status === "accepted" || status === "arrived" || status === "in_progress") return "In Transit";
  return "Pending";
}

function errorMessage(error: unknown) {
  if (!error) return "Unknown Supabase error.";
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message);
  }
  return String(error);
}

function assertNoError(label: string, error: unknown) {
  if (error) {
    throw new Error(`${label}: ${errorMessage(error)}`);
  }
}

export async function fetchAdminDashboardData() {
  const [profilesResult, driversResult, passengersResult, ridesResult, earningsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone, email, role, is_active"),
    supabase
      .from("drivers")
      .select("id, user_id, license_number, tricycle_body_number, plate_number, status, created_at"),
    supabase
      .from("passengers")
      .select("id, user_id, created_at"),
    supabase
      .from("rides")
      .select("id, passenger_id, driver_id, pickup_address, dropoff_address, status, fare_amount, requested_at"),
    supabase
      .from("driver_earnings")
      .select("id, driver_id, ride_id, created_at, gross_fare"),
  ]);

  assertNoError("profiles", profilesResult.error);
  assertNoError("drivers", driversResult.error);
  assertNoError("passengers", passengersResult.error);
  assertNoError("rides", ridesResult.error);
  assertNoError("driver_earnings", earningsResult.error);

  const profiles = (profilesResult.data ?? []) as ProfileRow[];
  const driverRows = (driversResult.data ?? []) as DriverRow[];
  const passengerRows = (passengersResult.data ?? []) as PassengerRow[];
  const rideRows = (ridesResult.data ?? []) as RideRow[];
  const earningRows = (earningsResult.data ?? []) as DriverEarningRow[];

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const driversById = new Map(driverRows.map((driver) => [driver.id, driver]));
  const passengersById = new Map(passengerRows.map((passenger) => [passenger.id, passenger]));
  const ridesById = new Map(rideRows.map((ride) => [ride.id, ride]));

  const drivers: Driver[] = driverRows.map((row) => {
    const profile = profilesById.get(row.user_id);
    return {
      id: row.id,
      name: profile?.full_name ?? "Driver",
      toda: row.tricycle_body_number ?? "Unassigned",
      status: profile?.is_active === false || row.status === "suspended" ? "Inactive" : "Active",
      phone: profile?.phone ?? "",
      license: row.license_number ?? "PENDING",
      bodyNumber: row.tricycle_body_number ?? "-",
      trips: rideRows.filter((ride) => ride.driver_id === row.id && ride.status === "completed").length,
      joinedDate: row.created_at?.split("T")[0] ?? "",
      email: profile?.email ?? "",
      plateNumber: row.plate_number ?? "",
    };
  });

  const passengers: Passenger[] = passengerRows.map((row) => {
    const profile = profilesById.get(row.user_id);
    const passengerRides = rideRows.filter((ride) => ride.passenger_id === row.id);
    return {
      id: row.id,
      name: profile?.full_name ?? "Passenger",
      contact: profile?.phone ?? "",
      canceledTrips: passengerRides.filter((ride) => ride.status === "cancelled").length,
      status: profile?.is_active === false ? "Inactive" : "Active",
      joinedDate: row.created_at?.split("T")[0] ?? "",
      ridesTaken: passengerRides.length,
    };
  });

  const rideRequests: RideRequest[] = rideRows.map((row) => {
    const passenger = passengersById.get(row.passenger_id);
    const passengerProfile = passenger ? profilesById.get(passenger.user_id) : null;
    const driver = row.driver_id ? driversById.get(row.driver_id) : null;
    const driverProfile = driver ? profilesById.get(driver.user_id) : null;

    return {
      id: row.id,
      passenger: passengerProfile?.full_name ?? "Passenger",
      driver: driverProfile?.full_name ?? "-",
      location: row.pickup_address ?? "",
      destination: row.dropoff_address ?? "",
      status: statusToAdmin(row.status),
      fare: Number(row.fare_amount ?? 0),
      time: row.requested_at ? new Date(row.requested_at).toLocaleString() : "",
      toda: driver?.tricycle_body_number ?? "-",
    };
  });

  const earningsRecords: EarningsRecord[] = earningRows.map((row) => {
    const ride = ridesById.get(row.ride_id);
    const driver = driversById.get(row.driver_id);
    const driverProfile = driver ? profilesById.get(driver.user_id) : null;

    return {
      id: row.id,
      date: row.created_at ? new Date(row.created_at).toLocaleDateString() : "",
      toda: driver?.tricycle_body_number ?? "-",
      completedRides: ride?.status === "completed" ? 1 : 0,
      totalEarnings: Number(row.gross_fare ?? 0),
      driverName: driverProfile?.full_name ?? "Driver",
    };
  });

  return { drivers, passengers, rideRequests, earningsRecords };
}

export function subscribeAdminOperationalData(onChange: () => void) {
  return supabase
    .channel("admin-operational-data")
    .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "passengers" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "rides" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "driver_earnings" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "ride_ratings" }, onChange)
    .subscribe();
}
