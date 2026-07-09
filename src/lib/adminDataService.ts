import { supabase } from "./supabase";
import { AdminAccount, Driver, EarningsRecord, FareSetting, Passenger, RideRequest } from "../types";

type ProfileRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: "passenger" | "driver" | "admin";
  is_active: boolean;
  avatar_url: string | null;
  is_primary_admin: boolean;
  created_at: string;
};

type DriverRow = {
  id: string;
  user_id: string;
  license_number: string | null;
  tricycle_body_number: string | null;
  plate_number: string | null;
  status: "offline" | "online" | "busy" | "suspended";
  is_verified: boolean;
  license_image_url: string | null;
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
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  dropoff_address: string | null;
  dropoff_latitude: number | null;
  dropoff_longitude: number | null;
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

type FareSettingRow = {
  trip_type: "one_way" | "round_trip";
  label: string;
  base_fare: number;
  included_km: number;
  per_succeeding_km: number;
  student_discount_percent: number;
  pwd_discount_percent: number;
  senior_discount_percent: number;
  is_active: boolean;
  updated_at: string;
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

function withTimeout<T>(promise: PromiseLike<T>, label: string, timeoutMs = 15000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`${label} timed out. Check the internet connection and try again.`));
    }, timeoutMs);

    Promise.resolve(promise)
      .then(resolve, reject)
      .finally(() => window.clearTimeout(timer));
  });
}

export async function fetchAdminDashboardData() {
  const [profilesResult, driversResult, passengersResult, ridesResult, earningsResult] = await Promise.all([
    withTimeout(supabase
      .from("profiles")
      .select("id, full_name, phone, email, role, is_active, avatar_url, is_primary_admin, created_at"), "profiles load"),
    withTimeout(supabase
      .from("drivers")
      .select("id, user_id, license_number, license_image_url, tricycle_body_number, plate_number, status, is_verified, created_at"), "drivers load"),
    withTimeout(supabase
      .from("passengers")
      .select("id, user_id, created_at"), "passengers load"),
    withTimeout(supabase
      .from("rides")
      .select("id, passenger_id, driver_id, pickup_address, pickup_latitude, pickup_longitude, dropoff_address, dropoff_latitude, dropoff_longitude, status, fare_amount, requested_at"), "rides load"),
    withTimeout(supabase
      .from("driver_earnings")
      .select("id, driver_id, ride_id, created_at, gross_fare"), "earnings load"),
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
  const earningsByRideId = new Map(earningRows.map((earning) => [earning.ride_id, earning]));

  const drivers: Driver[] = await Promise.all(driverRows.map(async (row) => {
    const profile = profilesById.get(row.user_id);
    const licenseImageUrl = row.license_image_url
      ? await createDriverDocumentSignedUrl(row.license_image_url)
      : undefined;
    return {
      id: row.id,
      name: profile?.full_name ?? "Driver",
      toda: row.tricycle_body_number ?? "Unassigned",
      status: profile?.is_active === false || row.status === "suspended" ? "Inactive" : "Active",
      isVerified: row.is_verified === true,
      phone: profile?.phone ?? "",
      license: row.license_number ?? "PENDING",
      bodyNumber: row.tricycle_body_number ?? "-",
      trips: rideRows.filter((ride) => ride.driver_id === row.id && ride.status === "completed").length,
      joinedDate: row.created_at?.split("T")[0] ?? "",
      email: profile?.email ?? "",
      plateNumber: row.plate_number ?? "",
      avatarUrl: profile?.avatar_url ?? undefined,
      licenseImageUrl,
      licenseImageName: row.license_image_url ? row.license_image_url.split("/").pop() : undefined,
    };
  }));

  const passengers: Passenger[] = passengerRows.map((row) => {
    const profile = profilesById.get(row.user_id);
    const passengerRides = rideRows.filter((ride) => ride.passenger_id === row.id);
    return {
      id: row.id,
      name: profile?.full_name ?? "Passenger",
      contact: profile?.phone ?? "",
      email: profile?.email ?? "",
      canceledTrips: passengerRides.filter((ride) => ride.status === "cancelled").length,
      status: profile?.is_active === false ? "Inactive" : "Active",
      joinedDate: row.created_at?.split("T")[0] ?? "",
      ridesTaken: passengerRides.length,
      avatarUrl: profile?.avatar_url ?? undefined,
    };
  });

  const rideRequests: RideRequest[] = rideRows.map((row) => {
    const passenger = passengersById.get(row.passenger_id);
    const passengerProfile = passenger ? profilesById.get(passenger.user_id) : null;
    const driver = row.driver_id ? driversById.get(row.driver_id) : null;
    const driverProfile = driver ? profilesById.get(driver.user_id) : null;
    const earning = earningsByRideId.get(row.id);

    return {
      id: row.id,
      passenger: passengerProfile?.full_name ?? "Passenger",
      driver: driverProfile?.full_name ?? "-",
      location: row.pickup_address ?? "",
      destination: row.dropoff_address ?? "",
      pickupLatitude: row.pickup_latitude == null ? null : Number(row.pickup_latitude),
      pickupLongitude: row.pickup_longitude == null ? null : Number(row.pickup_longitude),
      dropoffLatitude: row.dropoff_latitude == null ? null : Number(row.dropoff_latitude),
      dropoffLongitude: row.dropoff_longitude == null ? null : Number(row.dropoff_longitude),
      status: statusToAdmin(row.status),
      fare: Number(row.fare_amount ?? 0),
      time: row.requested_at ? new Date(row.requested_at).toLocaleString() : "",
      requestedAt: row.requested_at ?? "",
      toda: driver?.tricycle_body_number ?? "-",
      earningId: earning?.id,
      earningAmount: Number(earning?.gross_fare ?? 0),
      earningDate: earning?.created_at ? new Date(earning.created_at).toLocaleString() : "",
    };
  }).sort((a, b) => {
    const bTime = Date.parse(b.requestedAt || b.time || "");
    const aTime = Date.parse(a.requestedAt || a.time || "");
    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
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

  const adminAccounts: AdminAccount[] = profiles
    .filter((profile) => profile.role === "admin")
    .sort((a, b) => {
      if (a.is_primary_admin !== b.is_primary_admin) return a.is_primary_admin ? -1 : 1;
      return (a.full_name || "").localeCompare(b.full_name || "");
    })
    .map((profile) => ({
      id: profile.id,
      name: profile.full_name ?? "Administrator",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      status: profile.is_active === false ? "Inactive" : "Active",
      isPrimaryAdmin: profile.is_primary_admin === true,
      createdAt: profile.created_at ? profile.created_at.split("T")[0] : "",
    }));

  return { drivers, passengers, rideRequests, earningsRecords, adminAccounts };
}

export async function updateDriverVerification(
  driverId: string | number,
  isVerified: boolean,
) {
  const { error } = await withTimeout(supabase
    .from("drivers")
    .update({ is_verified: isVerified })
    .eq("id", driverId), "update driver verification");

  assertNoError("update driver verification", error);
}

export async function updateDriverActiveStatus(
  driver: Driver,
  status: "Active" | "Inactive",
) {
  const driverId = String(driver.id);

  const { data: driverRow, error: driverReadError } = await withTimeout(supabase
    .from("drivers")
    .select("user_id")
    .eq("id", driverId)
    .single(), "read driver account");

  assertNoError("read driver account", driverReadError);

  const userId = (driverRow as { user_id: string }).user_id;

  const { error: profileError } = await withTimeout(supabase
    .from("profiles")
    .update({ is_active: status === "Active" })
    .eq("id", userId), "update driver active status");

  assertNoError("update driver active status", profileError);

  const { error: driverError } = await withTimeout(supabase
    .from("drivers")
    .update({ status: status === "Inactive" ? "suspended" : "offline" })
    .eq("id", driverId), "update driver availability status");

  assertNoError("update driver availability status", driverError);
}

export async function updateDriverAccount(
  driver: Driver,
  updates: {
    name: string;
    phone: string;
    license: string;
    bodyNumber: string;
    toda: string;
    status: "Active" | "Inactive";
    email: string;
    password?: string;
    plateNumber: string;
    isVerified: boolean;
  },
) {
  const driverId = String(driver.id);

  const { data: driverRow, error: driverReadError } = await withTimeout(supabase
    .from("drivers")
    .select("user_id")
    .eq("id", driverId)
    .single(), "read driver account");

  assertNoError("read driver account", driverReadError);

  const userId = (driverRow as { user_id: string }).user_id;

  await updateAuthAccount(userId, {
    email: updates.email.trim() !== (driver.email ?? "").trim() ? updates.email : undefined,
    password: updates.password,
  });

  const { error: profileError } = await withTimeout(supabase
    .from("profiles")
    .update({
      full_name: updates.name,
      phone: updates.phone,
      email: updates.email || null,
      is_active: updates.status === "Active",
    })
    .eq("id", userId), "update driver profile");

  assertNoError("update driver profile", profileError);

  const { error: driverError } = await withTimeout(supabase
    .from("drivers")
    .update({
      license_number: updates.license,
      tricycle_body_number: updates.toda || updates.bodyNumber || null,
      plate_number: updates.plateNumber || null,
      status: updates.status === "Inactive" ? "suspended" : "offline",
      is_verified: updates.isVerified,
    })
    .eq("id", driverId), "update driver record");

  assertNoError("update driver record", driverError);
}

export async function updatePassengerAccount(
  passenger: Passenger,
  updates: {
    name: string;
    contact: string;
    email: string;
    status: "Active" | "Inactive";
    password?: string;
  },
) {
  const passengerId = String(passenger.id);

  const { data: passengerRow, error: passengerReadError } = await withTimeout(supabase
    .from("passengers")
    .select("user_id")
    .eq("id", passengerId)
    .single(), "read passenger account");

  assertNoError("read passenger account", passengerReadError);

  const userId = (passengerRow as { user_id: string }).user_id;

  await updateAuthAccount(userId, {
    email: updates.email.trim() !== (passenger.email ?? "").trim() ? updates.email : undefined,
    password: updates.password,
  });

  const { error: profileError } = await withTimeout(supabase
    .from("profiles")
    .update({
      full_name: updates.name,
      phone: updates.contact,
      email: updates.email || null,
      is_active: updates.status === "Active",
    })
    .eq("id", userId), "update passenger profile");

  assertNoError("update passenger profile", profileError);
}

export async function updatePassengerActiveStatus(
  passenger: Passenger,
  status: "Active" | "Inactive",
) {
  const passengerId = String(passenger.id);

  const { data: passengerRow, error: passengerReadError } = await withTimeout(supabase
    .from("passengers")
    .select("user_id")
    .eq("id", passengerId)
    .single(), "read passenger account");

  assertNoError("read passenger account", passengerReadError);

  const userId = (passengerRow as { user_id: string }).user_id;

  const { error: profileError } = await withTimeout(supabase
    .from("profiles")
    .update({ is_active: status === "Active" })
    .eq("id", userId), "update passenger active status");

  assertNoError("update passenger active status", profileError);
}

async function updateAuthAccount(
  userId: string,
  updates: { email?: string; password?: string },
) {
  const email = updates.email?.trim();
  const password = updates.password?.trim();
  if (!email && !password) return;

  const { data, error } = await withTimeout(supabase.functions.invoke("admin-update-auth-user", {
    body: {
      userId,
      email: email || undefined,
      password: password || undefined,
    },
  }), "update auth account", 20000);

  assertNoError("update auth account", error);
  if (data && data.success === false) {
    throw new Error(data.error || "update auth account failed");
  }
}

export async function uploadDriverLicenseImage(
  driverId: string | number,
  file: File,
) {
  const driverIdString = String(driverId);
  const extension = extensionFor(file.name);
  const path = `${driverIdString}/license.${extension}`;

  const { error: uploadError } = await withTimeout(supabase.storage
    .from("driver-documents")
    .upload(path, file, {
      upsert: true,
      contentType: file.type || contentTypeFor(extension),
    }), "upload driver license image", 30000);

  assertNoError("upload driver license image", uploadError);

  const { error: updateError } = await withTimeout(supabase
    .from("drivers")
    .update({ license_image_url: path })
    .eq("id", driverIdString), "save driver license image URL");

  assertNoError("save driver license image URL", updateError);
  return createDriverDocumentSignedUrl(path);
}

function mapFareSetting(row: FareSettingRow): FareSetting {
  return {
    tripType: row.trip_type,
    label: row.label,
    baseFare: Number(row.base_fare ?? 0),
    includedKm: Number(row.included_km ?? 0),
    perSucceedingKm: Number(row.per_succeeding_km ?? 0),
    studentDiscountPercent: Number(row.student_discount_percent ?? 20),
    pwdDiscountPercent: Number(row.pwd_discount_percent ?? 20),
    seniorDiscountPercent: Number(row.senior_discount_percent ?? 20),
    isActive: row.is_active === true,
    updatedAt: row.updated_at,
  };
}

export async function fetchFareSettings() {
  const { data, error } = await withTimeout(supabase
    .from("fare_settings")
    .select("trip_type, label, base_fare, included_km, per_succeeding_km, student_discount_percent, pwd_discount_percent, senior_discount_percent, is_active, updated_at")
    .order("trip_type", { ascending: true }), "fare settings load");

  assertNoError("fare_settings", error);
  return ((data ?? []) as FareSettingRow[]).map(mapFareSetting);
}

export async function updateFareSetting(setting: FareSetting) {
  const { data, error } = await withTimeout(supabase
    .from("fare_settings")
    .update({
      label: setting.label,
      base_fare: setting.baseFare,
      included_km: setting.includedKm,
      per_succeeding_km: setting.perSucceedingKm,
      student_discount_percent: setting.studentDiscountPercent,
      pwd_discount_percent: setting.pwdDiscountPercent,
      senior_discount_percent: setting.seniorDiscountPercent,
      is_active: setting.isActive,
    })
    .eq("trip_type", setting.tripType)
    .select("trip_type, label, base_fare, included_km, per_succeeding_km, student_discount_percent, pwd_discount_percent, senior_discount_percent, is_active, updated_at")
    .single(), "update fare setting");

  assertNoError("update fare setting", error);
  return mapFareSetting(data as FareSettingRow);
}

async function createDriverDocumentSignedUrl(path: string) {
  if (path.startsWith("http")) return path;
  const { data, error } = await withTimeout(supabase.storage
    .from("driver-documents")
    .createSignedUrl(path, 60 * 60), "sign driver license image URL");

  assertNoError("sign driver license image URL", error);
  if (!data?.signedUrl) {
    throw new Error("sign driver license image URL: no signed URL returned.");
  }
  return data.signedUrl;
}

function extensionFor(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".png")) return "png";
  if (lower.endsWith(".webp")) return "webp";
  if (lower.endsWith(".pdf")) return "pdf";
  return "jpg";
}

function contentTypeFor(extension: string) {
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "pdf") return "application/pdf";
  return "image/jpeg";
}

export function subscribeAdminOperationalData(onChange: () => void) {
  return supabase
    .channel("admin-operational-data")
    .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "passengers" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "rides" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "ride_location_logs" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "driver_locations" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "driver_earnings" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "ride_ratings" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "fare_settings" }, onChange)
    .subscribe();
}
