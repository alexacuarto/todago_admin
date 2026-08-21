import { useState, useMemo, useEffect } from "react";
import { createDriverAccount } from "./lib/driverService";
import { getDriverActivityStatus } from "./lib/driverActivity";
import { supabase } from "./lib/supabase";
import { Driver, Passenger, RideRequest, EarningsRecord } from "./types";

// Layout components
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";

// Views
import LoginView from "./components/views/LoginView";
import DashboardView from "./components/views/DashboardView";
import RideRequestsView from "./components/views/RideRequestsView";
import EarningsView from "./components/views/EarningsView";
import UsersView from "./components/views/UsersView";
import ProfileView from "./components/views/ProfileView";
import CreateDriverView from "./components/views/CreateDriverView";
import FareSettingsView from "./components/views/FareSettingsView";

// Modals
import EditDriverModal from "./components/modals/EditDriverModal";
import AddRequestModal from "./components/modals/AddRequestModal";
import ViewRequestModal from "./components/modals/ViewRequestModal";
import ViewUserModal from "./components/modals/ViewUserModal";
import ViewEarningsModal from "./components/modals/ViewEarningsModal";
import StatBreakdownModal from "./components/modals/StatBreakdownModal";

export default function App() {
  // Authentication & Navigation State
  const [isVerifyingRole, setIsVerifyingRole] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<"dashboard" | "ride-requests" | "earnings" | "users" | "profile" | "create-driver" | "fare-settings">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreatingDriver, setIsCreatingDriver] = useState(false);

  // Admin Profile State
  const [adminProfile, setAdminProfile] = useState({
    name: "",
    email: "",
    status: "Active",
    password: "",
    avatarSeed: "alexa",
    avatarColor: "#38bdf8",
    avatarUrl: ""
  });

  // Drivers, Passengers, Ride Requests
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);

  // Modal display states
  const [showEditDriverModal, setShowEditDriverModal] = useState(false);
  const [showAddRequestModal, setShowAddRequestModal] = useState(false);
  const [showViewRequestModal, setShowViewRequestModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showViewEarningsModal, setShowViewEarningsModal] = useState(false);
  const [activeStatModal, setActiveStatModal] = useState<string | null>(null);

  // Selected item states
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [viewingRequest, setViewingRequest] = useState<RideRequest | null>(null);
  const [viewingUser, setViewingUser] = useState<Driver | Passenger | null>(null);
  const [viewingUserType, setViewingUserType] = useState<"driver" | "passenger" | null>(null);
  const [viewingEarningsRecord, setViewingEarningsRecord] = useState<EarningsRecord | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    plateNumber: "",
    toda: "LHITC-TODA",
    status: "Active" as "Active" | "Inactive",
    licenseFrontImage: null as File | null,
    licenseFrontName: "",
    licenseBackImage: null as File | null,
    licenseBackName: "",
    licenseNumber: "",
    licenseExpiryDate: "",
    franchiseImage: null as File | null,
    franchiseImageName: "",
    franchiseNumber: "",
    franchiseExpiryDate: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    license: "",
    toda: "",
    status: "Active" as "Active" | "Inactive",
    email: "",
    plateNumber: "",
    licenseExpiryDate: "",
    franchiseNumber: "",
    franchiseExpiryDate: ""
  });

  const [newRequestData, setNewRequestData] = useState({
    passenger: "",
    driverId: "",
    location: "",
    destination: "",
    status: "Pending" as "Pending" | "In Transit" | "Scheduled" | "Completed" | "Cancelled",
    fare: ""
  });

  // Search & Filter states
  const [driverSearch, setDriverSearch] = useState("");
  const [requestSearch, setRequestSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [requestTodaFilter, setRequestTodaFilter] = useState("All");
  const [earningsTodaFilter, setEarningsTodaFilter] = useState("All");
  const [earningsDriverFilter, setEarningsDriverFilter] = useState("All");
  const [earningsDateRange, setEarningsDateRange] = useState("April 1, 2024- April 30, 2026");
  const [userTodaFilter, setUserTodaFilter] = useState("All");
  const [userStatusFilter, setUserStatusFilter] = useState("All");
  const [usersSubTab, setUsersSubTab] = useState<"all" | "drivers" | "passengers">("all");


  // Load live data from Supabase
  const fetchData = async () => {
    setIsLoadingData(true);
    setErrorState(null);
    try {
      console.log("[Supabase Query] Fetching profiles...");
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
      if (profilesError) throw profilesError;
      console.log("[Supabase Response] Profiles fetched:", profiles.length);

      console.log("[Supabase Query] Fetching passengers map...");
      const { data: passengersData, error: passengersError } = await supabase
        .from("passengers")
        .select(`
          id,
          profile_id,
          cancel_count,
          last_cancel_date,
          booking_restriction_until,
          warning_status,
          account_passenger_type,
          discount_document_url,
          discount_document_status,
          discount_document_type,
          discount_document_rejection_reason,
          discount_document_submitted_at,
          discount_document_reviewed_at,
          discount_eligible
        `);
      if (passengersError) throw passengersError;
      console.log("[Supabase Response] Passengers fetched:", passengersData?.length);

      console.log("[Supabase Query] Fetching vehicles...");
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("*");
      if (vehiclesError) throw vehiclesError;
      console.log("[Supabase Response] Vehicles fetched:", vehiclesData?.length);

      console.log("[Supabase Query] Fetching drivers with profiles and vehicles...");
      const { data: driversData, error: driversError } = await supabase
        .from("drivers")
        .select(`
          id,
          status,
          license_number,
          license_photo_url,
          is_online,
          created_at,
          toda_association,
          account_status,
          document_status,
          license_front_url,
          license_back_url,
          license_expiry_date,
          franchise_url,
          franchise_number,
          franchise_expiry_date,
          profile_id,
          last_online_at,
          total_online_minutes,
          last_completed_ride_at,
          admin_action_type,
          admin_action_reason,
          admin_action_date,
          admin_action_by,
          document_issue_reason
        `);
      if (driversError) throw driversError;
      console.log("[Supabase Response] Drivers fetched:", driversData.length);

      console.log("[Supabase Query] Fetching bookings...");
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id,
          passenger_id,
          driver_id,
          status,
          pickup_address,
          dropoff_address,
          estimated_fare,
          actual_fare,
          regular_fare,
          provisional_discounted_fare,
          final_fare,
          discount_review_status,
          created_at,
          cancelled_by,
          cancelled_at,
          cancel_reason,
          cancel_details,
          booking_discount_requests (
            id,
            booking_id,
            discount_type,
            companion_index,
            id_image_path,
            status,
            reviewed_by_driver_id,
            reviewed_at,
            rejection_reason
          )
        `)
        .order("created_at", { ascending: false });
      if (bookingsError) throw bookingsError;
      console.log("[Supabase Response] Bookings fetched:", bookings.length);

      // Map Passengers
      const allPassengerIds = new Set<string>();
      (profiles || [])
        .filter(p => p.role === "passenger")
        .forEach(p => allPassengerIds.add(p.id));
      (passengersData || []).forEach(pd => {
        if (pd.profile_id) allPassengerIds.add(pd.profile_id);
        allPassengerIds.add(pd.id);
      });

      const mappedPassengers: Passenger[] = Array.from(allPassengerIds).map(id => {
        const p = (profiles || []).find(prof => prof.id === id);
        const pd = (passengersData || []).find(pass => pass.profile_id === id || pass.id === id);
        const passengerId = pd ? pd.id : id;
        const profileId = pd?.profile_id || p?.id || id;

        const passengerBookings = bookings.filter(b => b.passenger_id === passengerId || b.passenger_id === id);
        const ridesTaken = passengerBookings.filter(b => b.status === "droppedOff" || b.status === "paymentSent" || b.status === "completed").length;
        const canceledTrips = pd ? (pd.cancel_count || 0) : 0;
        const lastCancelDate = pd ? (pd.last_cancel_date || null) : null;

        let resolvedName = "Incomplete Profile";
        let resolvedContact = "No Contact";
        let resolvedStatus = "Inactive";
        let resolvedJoinedDate = new Date().toISOString().split("T")[0];
        let warningStatus = false;
        let bookingRestrictionUntil = null;

        if (p) {
          const fullName = `${p.first_name || ""} ${p.last_name || ""}`.trim();
          if (fullName) {
            resolvedName = fullName;
          }
          resolvedContact = p.phone_number || p.email || "No Contact";
          
          warningStatus = pd ? (pd.warning_status || false) : false;
          bookingRestrictionUntil = pd ? (pd.booking_restriction_until || null) : null;

          if (bookingRestrictionUntil && new Date(bookingRestrictionUntil) > new Date()) {
            const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
            const dateStr = new Date(bookingRestrictionUntil).toLocaleDateString('en-US', options);
            resolvedStatus = `Restricted until ${dateStr}`;
          } else if (warningStatus) {
            resolvedStatus = "Warning";
          } else {
            resolvedStatus = p.is_active ? "Active" : "Inactive";
          }
          resolvedJoinedDate = p.created_at ? p.created_at.split("T")[0] : resolvedJoinedDate;
        }

        return {
          id: passengerId,
          profileId,
          name: resolvedName,
          contact: resolvedContact,
          email: p?.email || "",
          canceledTrips,
          status: resolvedStatus,
          joinedDate: resolvedJoinedDate,
          ridesTaken,
          warningStatus,
          bookingRestrictionUntil,
          lastCancelDate,
          accountPassengerType: pd?.account_passenger_type || "Regular",
          discountDocumentUrl: pd?.discount_document_url || null,
          discountDocumentStatus: pd?.discount_document_status || "NOT_REQUIRED",
          discountDocumentType: pd?.discount_document_type || null,
          discountDocumentRejectionReason: pd?.discount_document_rejection_reason || null,
          discountDocumentSubmittedAt: pd?.discount_document_submitted_at || null,
          discountDocumentReviewedAt: pd?.discount_document_reviewed_at || null,
          discountEligible: pd?.discount_eligible || false
        };
      }).filter(passenger => passenger.name !== "Incomplete Profile" && passenger.name !== "Unnamed Passenger");

      // Map Drivers
      const mappedDrivers: Driver[] = driversData.map((d: any) => {
        const profile = (profiles || []).find((p: any) => p.id === d.profile_id) || {};
        const vehicle = (vehiclesData || []).find((v: any) => v.driver_id === d.id) || {};
        const driverBookings = bookings.filter(b => b.driver_id === d.id && (b.status === "droppedOff" || b.status === "paymentSent" || b.status === "completed"));
        const tripsCount = driverBookings.length;

        const toda = d.toda_association || "Not provided";

        // Compute activityStatus via single source of truth utility
        let lastCompletedTripDate: string | null = null;
        if (driverBookings.length > 0) {
          lastCompletedTripDate = driverBookings.reduce((latest: string | null, b: any) => {
            const date = b.completed_at || b.created_at;
            if (!date) return latest;
            if (!latest) return date;
            return new Date(date) > new Date(latest) ? date : latest;
          }, null);
        }
        const lastOnlineVal = d.last_online_at || null;
        const lastCompletedRideVal = d.last_completed_ride_at || lastCompletedTripDate;
        const activityStatus = getDriverActivityStatus(lastOnlineVal, lastCompletedRideVal, !!d.is_online);

        return {
          id: d.id,
          name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unnamed Driver",
          toda,
          // Status is derived from document_status + admin_action_type.
          // The legacy `status` column is kept for backward compat only.
          status: d.admin_action_type
            ? "Restricted"
            : d.document_status === "VERIFIED"
            ? "Active"
            : "Inactive",
          phone: profile.phone_number || "No Contact",
          license: d.license_number || "PENDING",
          trips: tripsCount,
          joinedDate: d.created_at ? d.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
          email: profile.email || "",
          plateNumber: vehicle.plate_number || "No Plate",
          isOnline: !!d.is_online,
          licensePhotoUrl: d.license_photo_url || null,
          activityStatus,
          accountStatus: d.account_status || "PENDING",
          licenseFrontUrl: d.license_front_url || null,
          licenseBackUrl: d.license_back_url || null,
          licenseExpiryDate: d.license_expiry_date || null,
          franchiseUrl: d.franchise_url || null,
          franchiseNumber: d.franchise_number || null,
          franchiseExpiryDate: d.franchise_expiry_date || null,
          documentStatus: d.document_status || "PENDING",
          rejectionReason: d.rejection_reason || null,
          profileId: d.profile_id,
          lastOnlineAt: lastOnlineVal,
          totalOnlineMinutes: d.total_online_minutes || 0,
          lastCompletedRideAt: lastCompletedRideVal,
          adminActionType: d.admin_action_type || null,
          adminActionReason: d.admin_action_reason || null,
          adminActionDate: d.admin_action_date || null,
          adminActionBy: d.admin_action_by || null,
          documentIssueReason: d.document_issue_reason || null,
        };
      });

      // Map Ride Requests
      const mappedRequests: RideRequest[] = bookings.map((b: any) => {
        let passengerProfile: any = profiles.find(p => p.id === b.passenger_id);

        if (!passengerProfile && passengersData) {
          const passengerRow = passengersData.find(pd => pd.id === b.passenger_id);
          if (passengerRow) {
            passengerProfile = profiles.find(p => p.id === passengerRow.profile_id);
          }
        }

        passengerProfile = passengerProfile || {};
        const passengerName = `${passengerProfile.first_name || ""} ${passengerProfile.last_name || ""}`.trim() || passengerProfile.phone_number || passengerProfile.email || "Unknown Passenger";

        const driverObj = driversData.find((d: any) => d.id === b.driver_id);
        const driverProfile: any = driverObj ? (profiles || []).find((p: any) => p.id === driverObj.profile_id) || {} : {};
        const driverName = driverObj ? `${driverProfile.first_name || ""} ${driverProfile.last_name || ""}`.trim() : "Not provided";

        let toda = "Not provided";
        if (driverObj) {
          toda = driverObj.toda_association || "Not provided";
        }

        let uiStatus: RideRequest["status"] = "Pending";
        if (b.status === "pending" || b.status === "searching") {
          uiStatus = "Pending";
        } else if (b.status === "accepted" || b.status === "pickedUp") {
          uiStatus = "In Transit";
        } else if (b.status === "droppedOff" || b.status === "paymentSent" || b.status === "completed") {
          uiStatus = "Completed";
        } else if (b.status === "cancelled") {
          uiStatus = "Cancelled";
        }

        return {
          id: b.id,
          passenger: passengerName,
          passengerId: b.passenger_id,
          driver: driverName,
          driverId: b.driver_id || "",
          location: b.pickup_address || "Unknown Pickup",
          destination: b.dropoff_address || "Unknown Dropoff",
          status: uiStatus,
          fare: Number(b.final_fare || b.actual_fare || b.estimated_fare || 0),
          regularFare: b.regular_fare != null ? Number(b.regular_fare) : null,
          provisionalDiscountedFare: b.provisional_discounted_fare != null ? Number(b.provisional_discounted_fare) : null,
          finalFare: b.final_fare != null ? Number(b.final_fare) : null,
          discountReviewStatus: b.discount_review_status || null,
          bookingDiscountRequests: Array.isArray(b.booking_discount_requests)
            ? b.booking_discount_requests.map((request: any) => ({
                id: request.id,
                bookingId: request.booking_id,
                discountType: request.discount_type,
                companionIndex: Number(request.companion_index || 0),
                idImagePath: request.id_image_path,
                status: request.status,
                reviewedByDriverId: request.reviewed_by_driver_id || null,
                reviewedAt: request.reviewed_at || null,
                rejectionReason: request.rejection_reason || null,
              }))
            : [],
          time: b.created_at ? new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
          toda,
          cancelled_by: b.cancelled_by || null,
          cancelled_at: b.cancelled_at || null,
          cancel_reason: b.cancel_reason || null,
          cancel_details: b.cancel_details || null
        };
      });

      setPassengers(mappedPassengers);
      setDrivers(mappedDrivers);
      setRideRequests(mappedRequests);
    } catch (err: any) {
      console.error("[Supabase Error] Error fetching live data:", err);
      setErrorState(err.message || "Failed to load database records.");
    } finally {
      setIsLoadingData(false);
    }
  };

  // Check session and authorize admin
  const checkSessionAndRole = async (session: any) => {
    if (!session) {
      console.log("SESSION USER: null");
      setIsLoggedIn(false);
      setIsAuthorized(null);
      setSessionChecked(true);
      return;
    }

    console.log("SESSION USER:", session.user);
    setIsVerifyingRole(true);

    try {
      console.log("[Supabase Query] Fetching profile for user ID:", session.user.id);
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name, first_name, last_name, phone_number')
        .eq('id', session.user.id)
        .maybeSingle();

      console.log("PROFILE FETCH RESULT:", profile);

      if (error) {
        console.error("Error fetching profile, attempting insert/re-fetch:", error);
      }

      // If profile is NULL, safely initialize a passenger profile row
      if (!profile) {
        console.log("PROFILE CREATED OR EXISTS: Creating new profile defaulting to role=passenger...");
        const meta = session.user.user_metadata || {};
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            role: 'passenger',
            first_name: meta.first_name || '',
            last_name: meta.last_name || '',
            phone_number: meta.phone_number || session.user.phone || null
          });

        if (insertError) {
          console.error("Error inserting default profile:", insertError);
        }

        // Re-fetch the profile immediately
        const { data: reFetchedProfile, error: reFetchError } = await supabase
          .from('profiles')
          .select('role, full_name, first_name, last_name, phone_number')
          .eq('id', session.user.id)
          .maybeSingle();

        if (reFetchError) {
          console.error("Error on re-fetching profile:", reFetchError);
        } else {
          profile = reFetchedProfile;
        }
      } else {
        console.log("PROFILE CREATED OR EXISTS: Exists");
      }

      // Check metadata role for promotion
      const meta = session.user.user_metadata || {};
      const isMetadataAdmin = meta.role === 'admin';

      if (isMetadataAdmin && profile && profile.role !== 'admin') {
        console.log("[Supabase Query] Promoting database profile role to admin based on metadata...");
        const { error: promoError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', session.user.id);

        if (!promoError) {
          profile.role = 'admin';
        } else {
          console.error("Failed to promote profile role to admin:", promoError);
        }
      }

      if (profile?.role === 'admin') {
        const firstLastName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
        const profileName = profile.full_name || firstLastName;
        setAdminProfile({
          name: profileName || session.user.email || "Administrator",
          email: session.user.email || "",
          status: "Active",
          password: "",
          avatarSeed: "alexa",
          avatarColor: "#38bdf8",
          avatarUrl: ""
        });
        setIsAuthorized(true);
        setIsLoggedIn(true);
        fetchData();
      } else {
        await supabase.auth.signOut();
        setIsAuthorized(false);
        setIsLoggedIn(false);
        setLoginError("Only administrator accounts can access the dashboard.");
      }
    } catch (err) {
      console.error("Unexpected error in checkSessionAndRole:", err);
      setIsAuthorized(false);
      setIsLoggedIn(true);
    } finally {
      setIsVerifyingRole(false);
      setSessionChecked(true);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkSessionAndRole(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkSessionAndRole(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Realtime update subscriptions for bookings, drivers, profiles, vehicles, and passengers
  useEffect(() => {
    if (isLoggedIn && isAuthorized) {
      console.log("[Supabase Realtime] Subscribing to bookings, drivers, profiles, vehicles, and passengers changes...");

      const bookingsSubscription = supabase
        .channel("bookings-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bookings" },
          () => {
            console.log("[Supabase Realtime] Booking change detected. Refetching...");
            fetchData();
          }
        )
        .subscribe();

      const driversSubscription = supabase
        .channel("drivers-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "drivers" },
          () => {
            console.log("[Supabase Realtime] Driver change detected (online status / record). Refetching...");
            fetchData();
          }
        )
        .subscribe();

      const profilesSubscription = supabase
        .channel("profiles-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "profiles" },
          () => {
            console.log("[Supabase Realtime] Profile change detected. Refetching...");
            fetchData();
          }
        )
        .subscribe();

      const vehiclesSubscription = supabase
        .channel("vehicles-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "vehicles" },
          () => {
            console.log("[Supabase Realtime] Vehicle change detected. Refetching...");
            fetchData();
          }
        )
        .subscribe();

      const passengersSubscription = supabase
        .channel("passengers-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "passengers" },
          () => {
            console.log("[Supabase Realtime] Passenger record change detected. Refetching...");
            fetchData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(bookingsSubscription);
        supabase.removeChannel(driversSubscription);
        supabase.removeChannel(profilesSubscription);
        supabase.removeChannel(vehiclesSubscription);
        supabase.removeChannel(passengersSubscription);
      };
    }
  }, [isLoggedIn, isAuthorized]);

  // Derived calculations
  const onlineDriversCount = drivers.filter(d => d.isOnline).length;
  const activeDriversCount = drivers.filter(d => d.activityStatus === "ACTIVE").length;

  const earningsToday = useMemo(() => {
    return rideRequests
      .filter(r => r.status === "Completed")
      .reduce((sum, r) => sum + r.fare, 0);
  }, [rideRequests]);

  const earningsWeekly = useMemo(() => {
    return earningsToday;
  }, [earningsToday]);

  const totalEarnings = useMemo(() => {
    return rideRequests
      .filter(r => r.status === "Completed")
      .reduce((sum, r) => sum + (r.fare || 0), 0);
  }, [rideRequests]);

  const earningsRecords = useMemo(() => {
    const recordsMap: { [key: string]: EarningsRecord } = {};
    rideRequests
      .filter(r => r.status === "Completed")
      .forEach(r => {
        const key = `${r.toda}`;
        if (!recordsMap[key]) {
          recordsMap[key] = {
            id: r.id,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            toda: r.toda,
            completedRides: 0,
            totalEarnings: 0,
            commissionEarned: 0,
            driverName: r.driver
          };
        }
        recordsMap[key].completedRides += 1;
        recordsMap[key].totalEarnings += r.fare;
        recordsMap[key].commissionEarned += r.fare * 0.15;
      });
    return Object.values(recordsMap);
  }, [rideRequests]);

  // Handlers
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingDriver) return;

    if (!formData.name || !formData.phone || !formData.email || !formData.password || !formData.plateNumber) {
      alert("Please fill in all required fields (Name, Phone, Email, Password, Plate Number, TODA).");
      return;
    }

    console.log("Initiating driver signup request...", {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      plateNumber: formData.plateNumber,
      toda: formData.toda
    });
    setIsCreatingDriver(true);

    try {
      const result = await createDriverAccount({
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        contactNumber: formData.phone,
        plateNumber: formData.plateNumber,
        todaAssociation: formData.toda,
        licenseFrontImage: formData.licenseFrontImage,
        licenseBackImage: formData.licenseBackImage,
        licenseNumber: formData.licenseNumber || undefined,
        licenseExpiryDate: formData.licenseExpiryDate || undefined,
        franchiseImage: formData.franchiseImage,
        franchiseNumber: formData.franchiseNumber || undefined,
        franchiseExpiryDate: formData.franchiseExpiryDate || undefined,
      });

      if (!result.success) {
        console.error("Signup failed:", result.error);
        alert(`Failed to create driver account: ${result.error}`);
        return;
      }

      console.log("Signup successful:", result);

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        plateNumber: "",
        toda: "LHITC-TODA",
        status: "Active",
        licenseFrontImage: null,
        licenseFrontName: "",
        licenseBackImage: null,
        licenseBackName: "",
        licenseNumber: "",
        licenseExpiryDate: "",
        franchiseImage: null,
        franchiseImageName: "",
        franchiseNumber: "",
        franchiseExpiryDate: "",
      });
      setActiveTab("users");
      setUsersSubTab("drivers");
      alert("Driver account successfully created");
      fetchData();
    } catch (err: any) {
      console.error("Unexpected error during signup:", err);
      alert(`Unexpected error: ${err.message || err}`);
    } finally {
      setIsCreatingDriver(false);
    }
  };

  const handleEditDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    console.log("[Supabase Query] Updating profile and driver...");
    const nameParts = editFormData.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    let profileId = editingDriver.profileId || (editingDriver as any).profile_id;
    if (!profileId) {
      console.log("Profile ID missing in editingDriver state. Fetching from database...");
      const { data: dRec } = await supabase
        .from('drivers')
        .select('profile_id')
        .eq('id', editingDriver.id)
        .maybeSingle();
      if (dRec?.profile_id) {
        profileId = dRec.profile_id;
      }
    }
    if (!profileId) {
      alert("Error: Profile ID is missing for this driver.");
      return;
    }
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone_number: editFormData.phone
      })
      .eq('id', profileId);

    if (profileError) {
      console.error("[Supabase Error] Profile update failed:", profileError);
      alert(`Failed to update profile: ${profileError.message}`);
      return;
    }



    // NOTE: document_status, status, and account_status are intentionally
    // NOT written here. The database trigger (fn_update_driver_status) computes
    // them automatically whenever any document field changes.
    const { error: driverError } = await supabase
      .from('drivers')
      .update({
        license_number: editFormData.license || null,
        license_expiry_date: editFormData.licenseExpiryDate || null,
        franchise_number: editFormData.franchiseNumber || null,
        franchise_expiry_date: editFormData.franchiseExpiryDate || null,
        toda_association: editFormData.toda,
      })
      .eq('id', editingDriver.id);

    if (driverError) {
      console.error("[Supabase Error] Driver update failed:", driverError);
      alert(`Failed to update driver: ${driverError.message}`);
      return;
    }

    // Update vehicle using driver's table primary key directly
    await supabase
      .from('vehicles')
      .update({
        plate_number: editFormData.plateNumber
      })
      .eq('driver_id', editingDriver.id);

    setShowEditDriverModal(false);
    setEditingDriver(null);
    alert("Driver profile updated successfully!");
    fetchData();
  };

  const handleDeactivateToggle = async (id: string) => {
    const driverObj = drivers.find(d => d.id === id);
    if (!driverObj) return;

    const isCurrentlyRestricted = driverObj.adminActionType != null;

    if (isCurrentlyRestricted) {
      // Clear admin restriction — the DB trigger will re-evaluate document_status
      // and restore eligibility automatically if documents are VERIFIED.
      console.log("[Supabase Query] Clearing driver admin restriction...");
      const { error } = await supabase
        .from('drivers')
        .update({
          admin_action_type: null,
          admin_action_reason: null,
          admin_action_date: null,
          admin_action_by: null,
        })
        .eq('id', id);

      if (error) {
        console.error("[Supabase Error] Driver restriction clear failed:", error);
        alert(`Failed to clear restriction: ${error.message}`);
        return;
      }

      if (viewingUser && viewingUser.id === id && viewingUserType === "driver") {
        setViewingUser((prev: any) => prev ? {
          ...prev,
          adminActionType: null,
          adminActionReason: null,
          status: prev.documentStatus === "VERIFIED" ? "Active" : "Inactive",
          accountStatus: prev.documentStatus === "VERIFIED" ? "ACTIVE" : "PENDING",
        } : null);
      }

      alert("Driver restriction removed. Eligibility will be restored automatically if documents are valid.");
    } else {
      // Suspend the driver by setting admin_action_type.
      // The DB trigger will force is_online = false and status = inactive.
      const reason = window.prompt(`Enter reason for suspending ${driverObj.name}:`);
      if (reason === null) return; // user cancelled

      console.log("[Supabase Query] Suspending driver via admin_action_type...");
      const { data: { session } } = await supabase.auth.getSession();
      const adminUserId = session?.user?.id || null;

      const { error } = await supabase
        .from('drivers')
        .update({
          admin_action_type: 'suspended',
          admin_action_reason: reason.trim() || 'Suspended by administrator.',
          admin_action_date: new Date().toISOString(),
          admin_action_by: adminUserId,
        })
        .eq('id', id);

      if (error) {
        console.error("[Supabase Error] Driver suspension failed:", error);
        alert(`Failed to suspend driver: ${error.message}`);
        return;
      }

      if (viewingUser && viewingUser.id === id && viewingUserType === "driver") {
        setViewingUser((prev: any) => prev ? {
          ...prev,
          status: "Restricted",
          accountStatus: "SUSPENDED",
          adminActionType: 'suspended',
        } : null);
      }

      alert("Driver suspended successfully.");
    }

    fetchData();
  };

  const handleDeactivatePassengerToggle = async (id: string) => {
    const passengerObj = passengers.find(p => p.id === id);
    if (!passengerObj) return;

    const nextStatus = passengerObj.status === "Active" ? false : true;
    const profileId = passengerObj.profileId || id;

    console.log("[Supabase Query] Toggling passenger is_active status...");
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: nextStatus })
      .eq('id', profileId);

    if (error) {
      console.error("[Supabase Error] Passenger toggle failed:", error);
      alert(`Failed to toggle passenger status: ${error.message}`);
      return;
    }

    if (viewingUser && viewingUser.id === id && viewingUserType === "passenger") {
      setViewingUser(prev => {
        if (!prev) return null;
        return { ...prev, status: prev.status === "Active" ? "Inactive" : "Active" };
      });
    }

    alert(`Passenger status updated successfully!`);
    fetchData();
  };

  const handleIncrementCanceledTrips = async (id: string) => {
    console.log("[Supabase Query] Simulating a cancelled booking...");
    const { error } = await supabase
      .from('bookings')
      .insert({
        passenger_id: id,
        pickup_address: "Simulated Cancel Location",
        dropoff_address: "Simulated Cancel Destination",
        status: "cancelled",
        cancelled_by: "passenger",
        cancel_reason: "Admin simulation",
        estimated_fare: 0
      });

    if (error) {
      console.error("[Supabase Error] Failed to simulate cancellation:", error);
      alert(`Failed to simulate cancellation: ${error.message}`);
    } else {
      alert("Simulated cancelled trip created!");
      fetchData();
    }
  };

  const handleResetCanceledTrips = async (id: string) => {
    console.log("[Supabase Query] Deleting cancelled bookings to reset count...");
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('passenger_id', id)
      .eq('status', 'cancelled');

    if (error) {
      console.error("[Supabase Error] Failed to reset cancellations:", error);
      alert(`Failed to reset cancellations: ${error.message}`);
    } else {
      const { data: passData } = await supabase
        .from('passengers')
        .select('profile_id')
        .eq('id', id)
        .maybeSingle();
      const profileId = passData ? passData.profile_id : id;

      await supabase
        .from('passengers')
        .update({
          cancel_count: 0,
          last_cancel_date: null,
          booking_restriction_until: null,
          warning_status: false
        })
        .eq('id', id);

      await supabase
        .from('profiles')
        .update({ is_active: true })
        .eq('id', profileId);

      alert("Cancellations reset and passenger reactivated!");
      fetchData();
    }
  };

  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestData.passenger || !newRequestData.location || !newRequestData.destination || !newRequestData.fare) {
      alert("Please fill in all fields.");
      return;
    }

    const matchPassenger = passengers.find(p => p.name.toLowerCase() === newRequestData.passenger.toLowerCase());
    const passengerId = matchPassenger?.id;
    if (!passengerId) {
      alert("Passenger name must match an existing passenger profile in the database.");
      return;
    }

    const assignedDriver = drivers.find(d => d.id === newRequestData.driverId);

    console.log("[Supabase Query] Inserting new booking...");
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        passenger_id: passengerId,
        driver_id: assignedDriver ? assignedDriver.id : null,
        pickup_address: newRequestData.location,
        dropoff_address: newRequestData.destination,
        estimated_fare: Number(newRequestData.fare),
        status: newRequestData.status === "Pending" ? "searching" :
          newRequestData.status === "In Transit" ? "pickedUp" :
            newRequestData.status === "Completed" ? "completed" : "cancelled"
      })
      .select('*')
      .single();

    if (error) {
      console.error("[Supabase Error] Error creating booking:", error);
      alert(`Failed to create ride request: ${error.message}`);
      return;
    }

    console.log("[Supabase Response] Booking created:", data);
    setShowAddRequestModal(false);
    setNewRequestData({
      passenger: "",
      driverId: "",
      location: "",
      destination: "",
      status: "Pending",
      fare: ""
    });
    alert("Ride request dispatched successfully!");
    fetchData();
  };

  const handleDownloadReport = () => {
    const headers = "Date,TODA Association,Completed Rides,Total Earnings,Commission Earned,Driver Assigned\n";
    const rows = earningsRecords.map(r =>
      `"${r.date}","${r.toda}",${r.completedRides},${r.totalEarnings},${r.commissionEarned},"${r.driverName || 'N/A'}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `TodaGo_Earnings_Report_${new Date().toISOString().split("T")[0]}.csv`);
    a.click();
    alert("Report download initiated!");
  };

  // Filters
  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchSearch = d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
        d.toda.toLowerCase().includes(driverSearch.toLowerCase()) ||
        d.plateNumber.toLowerCase().includes(driverSearch.toLowerCase()) ||
        d.license.toLowerCase().includes(driverSearch.toLowerCase());
      const matchToda = userTodaFilter === "All" || d.toda === userTodaFilter;
      const matchStatus = userStatusFilter === "All" || d.status === userStatusFilter;
      return matchSearch && matchToda && matchStatus;
    });
  }, [drivers, driverSearch, userTodaFilter, userStatusFilter]);

  const filteredPassengers = useMemo(() => {
    return passengers.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
        p.contact.includes(driverSearch);
      const matchStatus = userStatusFilter === "All" || p.status === userStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [passengers, driverSearch, userStatusFilter]);

  const filteredRequests = useMemo(() => {
    return rideRequests.filter(r => {
      const matchSearch = r.passenger.toLowerCase().includes(requestSearch.toLowerCase()) ||
        r.driver.toLowerCase().includes(requestSearch.toLowerCase()) ||
        r.location.toLowerCase().includes(requestSearch.toLowerCase()) ||
        r.destination.toLowerCase().includes(requestSearch.toLowerCase());
      const matchToda = requestTodaFilter === "All" || r.toda === requestTodaFilter;
      let matchStatus = false;
      if (statusFilter === "All") {
        matchStatus = true;
      } else if (statusFilter === "Ongoing") {
        matchStatus = r.status === "Pending" || r.status === "In Transit";
      } else {
        matchStatus = r.status === statusFilter;
      }
      return matchSearch && matchStatus && matchToda;
    });
  }, [rideRequests, requestSearch, statusFilter, requestTodaFilter]);

  const filteredEarnings = useMemo(() => {
    return earningsRecords.filter(r => {
      const matchToda = earningsTodaFilter === "All" || r.toda === earningsTodaFilter;
      const matchDriver = earningsDriverFilter === "All" || r.driverName === earningsDriverFilter;
      return matchToda && matchDriver;
    });
  }, [earningsRecords, earningsTodaFilter, earningsDriverFilter]);

  // Loading screen
  if (!sessionChecked || isVerifyingRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f3f8fc] font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#000C7D] border-t-transparent"></div>
        <p className="text-[#000C7D] font-semibold mt-4 text-sm">Verifying Session...</p>
      </div>
    );
  }

  // Login View render condition
  if (!isLoggedIn) {
    return (
      <LoginView
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        loginError={loginError}
        setLoginError={setLoginError}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        setIsLoggedIn={setIsLoggedIn}
      />
    );
  }

  // Unauthorized View block removed to bypass access restriction check.

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f8fc] font-sans antialiased text-slate-800">
      {/* HEADER SECTION */}
      <Header
        adminProfile={adminProfile}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* SIDEBAR NAVIGATION */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          usersSubTab={usersSubTab}
          setUsersSubTab={setUsersSubTab}
        />

        {/* MAIN PANEL CONTENT VIEW */}
        <main className="flex-1 p-6 overflow-y-auto z-0 relative">
          {errorState && (
            <div className="mb-6 p-4 bg-rose-100 border border-rose-200 text-rose-800 rounded-2xl text-sm font-semibold flex items-center justify-between">
              <span>⚠️ Error: {errorState}</span>
              <button onClick={fetchData} className="px-4 py-1.5 bg-rose-200 hover:bg-rose-300 rounded-lg text-xs font-bold transition-all">Retry</button>
            </div>
          )}

          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent mb-3"></div>
              <p className="text-xs font-bold uppercase tracking-wider">Syncing Supabase Database...</p>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardView
                  rideRequests={rideRequests}
                  drivers={drivers}
                  onlineDriversCount={onlineDriversCount}
                  activeDriversCount={activeDriversCount}
                  earningsToday={earningsToday}
                  earningsWeekly={earningsWeekly}
                  totalEarnings={totalEarnings}
                  setActiveTab={setActiveTab}
                  setShowAddRequestModal={setShowAddRequestModal}
                  setShowEditDriverModal={setShowEditDriverModal}
                  setEditingDriver={setEditingDriver}
                  setEditFormData={setEditFormData}
                  handleDeactivateToggle={handleDeactivateToggle}
                  setActiveStatModal={setActiveStatModal}
                />
              )}

              {activeTab === "ride-requests" && (
                <RideRequestsView
                  filteredRequests={filteredRequests}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  requestTodaFilter={requestTodaFilter}
                  setRequestTodaFilter={setRequestTodaFilter}
                  requestSearch={requestSearch}
                  setRequestSearch={setRequestSearch}
                  setViewingRequest={setViewingRequest}
                  setShowViewRequestModal={setShowViewRequestModal}
                />
              )}

              {activeTab === "earnings" && (
                <EarningsView
                  drivers={drivers}
                  filteredEarnings={filteredEarnings}
                  earningsTodaFilter={earningsTodaFilter}
                  setEarningsTodaFilter={setEarningsTodaFilter}
                  earningsDriverFilter={earningsDriverFilter}
                  setEarningsDriverFilter={setEarningsDriverFilter}
                  earningsDateRange={earningsDateRange}
                  setEarningsDateRange={setEarningsDateRange}
                  handleDownloadReport={handleDownloadReport}
                  setViewingEarningsRecord={setViewingEarningsRecord}
                  setShowViewEarningsModal={setShowViewEarningsModal}
                />
              )}

              {activeTab === "users" && (
                <UsersView
                  filteredDrivers={filteredDrivers}
                  filteredPassengers={filteredPassengers}
                  driverSearch={driverSearch}
                  setDriverSearch={setDriverSearch}
                  userTodaFilter={userTodaFilter}
                  setUserTodaFilter={setUserTodaFilter}
                  userStatusFilter={userStatusFilter}
                  setUserStatusFilter={setUserStatusFilter}
                  usersSubTab={usersSubTab}
                  setUsersSubTab={setUsersSubTab}
                  setViewingUser={setViewingUser}
                  setViewingUserType={setViewingUserType}
                  setShowViewUserModal={setShowViewUserModal}
                />
              )}

              {activeTab === "profile" && (
                <ProfileView
                  adminProfile={adminProfile}
                  setAdminProfile={setAdminProfile}
                  setActiveTab={setActiveTab}
                  setIsLoggedIn={setIsLoggedIn}
                  setLoginEmail={setLoginEmail}
                  setLoginPassword={setLoginPassword}
                  setLoginError={setLoginError}
                />
              )}
              {activeTab === "create-driver" && (
                <CreateDriverView
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleAddDriver}
                  onCancel={() => setActiveTab("dashboard")}
                  isCreatingDriver={isCreatingDriver}
                />
              )}
              {activeTab === "fare-settings" && (
                <FareSettingsView />
              )}
            </>
          )}
        </main>
      </div>

      {/* MODAL WINDOWS */}

      <EditDriverModal
        isOpen={showEditDriverModal}
        onClose={() => {
          setShowEditDriverModal(false);
          setEditingDriver(null);
        }}
        editingDriver={editingDriver}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onSubmit={handleEditDriver}
      />

      <AddRequestModal
        isOpen={showAddRequestModal}
        onClose={() => setShowAddRequestModal(false)}
        newRequestData={newRequestData}
        setNewRequestData={setNewRequestData}
        drivers={drivers}
        onSubmit={handleAddRequest}
      />

      <ViewRequestModal
        isOpen={showViewRequestModal}
        onClose={() => {
          setShowViewRequestModal(false);
          setViewingRequest(null);
        }}
        viewingRequest={viewingRequest}
      />

      <ViewUserModal
        isOpen={showViewUserModal}
        onClose={() => {
          setShowViewUserModal(false);
          setViewingUser(null);
          setViewingUserType(null);
        }}
        viewingUser={viewingUser}
        viewingUserType={viewingUserType}
        onDeactivatePassengerToggle={handleDeactivatePassengerToggle}
        onIncrementCanceledTrips={handleIncrementCanceledTrips}
        onResetCanceledTrips={handleResetCanceledTrips}
        onRefreshData={fetchData}
        rideRequests={rideRequests}
      />

      <ViewEarningsModal
        isOpen={showViewEarningsModal}
        onClose={() => {
          setShowViewEarningsModal(false);
          setViewingEarningsRecord(null);
        }}
        viewingEarningsRecord={viewingEarningsRecord}
      />

      <StatBreakdownModal
        isOpen={activeStatModal !== null}
        activeStatModal={activeStatModal}
        onClose={() => setActiveStatModal(null)}
        drivers={drivers}
        passengers={passengers}
        rideRequests={rideRequests}
        earningsToday={earningsToday}
      />
    </div>
  );
}
