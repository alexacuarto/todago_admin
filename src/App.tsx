import { useState, useMemo, useEffect } from "react";
import { createDriverAccount } from "./lib/driverService";
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

  const [activeTab, setActiveTab] = useState<"dashboard" | "ride-requests" | "earnings" | "users" | "profile" | "create-driver">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreatingDriver, setIsCreatingDriver] = useState(false);

  // Admin Profile State
  const [adminProfile, setAdminProfile] = useState({
    name: "Admin User",
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
    licenseImage: null as File | null,
    licenseImageName: ""
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    license: "",
    bodyNumber: "",
    toda: "",
    status: "Active" as "Active" | "Inactive",
    email: "",
    plateNumber: ""
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
  const [statusFilter, setStatusFilter] = useState("Ongoing");
  const [requestTodaFilter, setRequestTodaFilter] = useState("All");
  const [earningsTodaFilter, setEarningsTodaFilter] = useState("All");
  const [earningsDriverFilter, setEarningsDriverFilter] = useState("All");
  const [earningsDateRange, setEarningsDateRange] = useState("April 1, 2024- April 30, 2026");
  const [userTodaFilter, setUserTodaFilter] = useState("All");
  const [userStatusFilter, setUserStatusFilter] = useState("All");
  const [usersSubTab, setUsersSubTab] = useState<"all" | "drivers" | "passengers">("all");

  // Pagination states
  const [requestsPage, setRequestsPage] = useState(1);
  const [driversPage, setDriversPage] = useState(1);
  const [passengersPage, setPassengersPage] = useState(1);
  const [earningsPage, setEarningsPage] = useState(1);

  // Chart hover states
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [chartTooltip, setChartTooltip] = useState({ x: 0, y: 0, val: 0, label: "" });

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

      console.log("[Supabase Query] Fetching drivers with profiles and vehicles...");
      const { data: driversData, error: driversError } = await supabase
        .from("drivers")
        .select(`
          id,
          status,
          license_number,
          created_at,
          profiles!profile_id (
            id,
            first_name,
            last_name,
            phone_number
          ),
          vehicles (
            plate_number
          )
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
          created_at
        `)
        .order("created_at", { ascending: false });
      if (bookingsError) throw bookingsError;
      console.log("[Supabase Response] Bookings fetched:", bookings.length);

      // Map Passengers
      const mappedPassengers: Passenger[] = profiles
        .filter(p => p.role === "passenger")
        .map(p => {
          const passengerBookings = bookings.filter(b => b.passenger_id === p.id);
          const ridesTaken = passengerBookings.filter(b => b.status === "droppedOff" || b.status === "paymentSent").length;
          const canceledTrips = passengerBookings.filter(b => b.status === "cancelled").length;
          return {
            id: p.id,
            name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Unnamed Passenger",
            contact: p.phone_number || "No Contact",
            canceledTrips,
            status: p.is_active ? "Active" : "Inactive",
            joinedDate: p.created_at ? p.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            ridesTaken
          };
        });

      // Map Drivers
      const mappedDrivers: Driver[] = driversData.map((d: any) => {
        const profile = d.profiles || {};
        const vehicle = d.vehicles?.[0] || {};
        const driverBookings = bookings.filter(b => b.driver_id === d.id);
        const tripsCount = driverBookings.filter(b => b.status === "droppedOff" || b.status === "paymentSent").length;
        
        const todaOptions = ["LHITC-TODA", "BYPASS ILAYANG BAGUIO-TODA", "CHOT-TODA"];
        const todaIndex = Math.abs(d.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % todaOptions.length;
        const toda = todaOptions[todaIndex];

        return {
          id: d.id,
          name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unnamed Driver",
          toda,
          status: d.status === "approved" ? "Active" : "Inactive",
          phone: profile.phone_number || "No Contact",
          license: d.license_number || "PENDING",
          bodyNumber: "T-" + d.id.slice(0, 4).toUpperCase(),
          trips: tripsCount,
          joinedDate: d.created_at ? d.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
          email: "",
          plateNumber: vehicle.plate_number || "No Plate"
        };
      });

      // Map Ride Requests
      const mappedRequests: RideRequest[] = bookings.map((b: any) => {
        const passengerProfile: any = profiles.find(p => p.id === b.passenger_id) || {};
        const passengerName = `${passengerProfile.first_name || ""} ${passengerProfile.last_name || ""}`.trim() || "Unknown Passenger";
        
        const driverObj = driversData.find((d: any) => d.id === b.driver_id);
        const driverProfile: any = driverObj?.profiles || {};
        const driverName = driverObj ? `${driverProfile.first_name || ""} ${driverProfile.last_name || ""}`.trim() : "Not provided";
        
        const todaOptions = ["LHITC-TODA", "BYPASS ILAYANG BAGUIO-TODA", "CHOT-TODA"];
        let toda = "Not provided";
        if (driverObj) {
          const todaIndex = Math.abs(driverObj.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % todaOptions.length;
          toda = todaOptions[todaIndex];
        }

        let uiStatus: RideRequest["status"] = "Pending";
        if (b.status === "pending" || b.status === "searching") {
          uiStatus = "Pending";
        } else if (b.status === "pickedUp") {
          uiStatus = "In Transit";
        } else if (b.status === "droppedOff" || b.status === "paymentSent") {
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
          fare: Number(b.actual_fare || b.estimated_fare || 0),
          time: b.created_at ? new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
          toda
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
        .select('role, first_name, last_name, phone_number')
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
          .select('role, first_name, last_name, phone_number')
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

      console.log("FINAL ROLE VALUE:", profile?.role);

      if (profile && (profile.role === 'admin' || isMetadataAdmin)) {
        setAdminProfile({
          name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Admin User",
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
        console.error("Access denied. final role:", profile?.role);
        setIsAuthorized(false);
        setIsLoggedIn(true);
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

  // Realtime update subscription
  useEffect(() => {
    if (isLoggedIn && isAuthorized) {
      console.log("[Supabase Realtime] Subscribing to bookings changes...");
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

      return () => {
        supabase.removeChannel(bookingsSubscription);
      };
    }
  }, [isLoggedIn, isAuthorized]);

  // Derived calculations
  const totalDriversCount = drivers.length;
  const activeDriversCount = drivers.filter(d => d.status === "Active").length;
  const usersCount = passengers.length + drivers.length;
  const tripsCount = rideRequests.length;

  const earningsToday = useMemo(() => {
    return rideRequests
      .filter(r => r.status === "Completed")
      .reduce((sum, r) => sum + r.fare, 0);
  }, [rideRequests]);

  const earningsWeekly = useMemo(() => {
    return earningsToday;
  }, [earningsToday]);


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

  const chartData = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return labels.map((label, idx) => {
      const totalBookingsCount = rideRequests.length;
      const baseVal = Math.floor(totalBookingsCount / 7);
      const val = baseVal + (idx === 4 || idx === 5 ? 5 : 2);
      return {
        label,
        val: isNaN(val) ? 0 : val
      };
    });
  }, [rideRequests]);

  // Handlers
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingDriver) return;

    if (!formData.name || !formData.phone || !formData.email || !formData.password || !formData.plateNumber) {
      alert("Please fill in all fields.");
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
        licenseImage: null,
        licenseImageName: ""
      });
      setActiveTab("users");
      setUsersSubTab("drivers");
      alert(`Driver account created successfully for ${result.driverName}!\nThe driver can now log in with the Flutter app.`);
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

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone_number: editFormData.phone
      })
      .eq('id', editingDriver.id);

    if (profileError) {
      console.error("[Supabase Error] Profile update failed:", profileError);
      alert(`Failed to update profile: ${profileError.message}`);
      return;
    }

    const { error: driverError } = await supabase
      .from('drivers')
      .update({
        status: editFormData.status === "Active" ? "approved" : "pending",
        license_number: editFormData.license
      })
      .eq('id', editingDriver.id);

    if (driverError) {
      console.error("[Supabase Error] Driver update failed:", driverError);
      alert(`Failed to update driver: ${driverError.message}`);
      return;
    }

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
    const nextStatus = driverObj.status === "Active" ? "pending" : "approved";

    console.log("[Supabase Query] Toggling driver status...");
    const { error } = await supabase
      .from('drivers')
      .update({ status: nextStatus })
      .eq('id', id);

    if (error) {
      console.error("[Supabase Error] Driver toggle failed:", error);
      alert(`Failed to toggle driver status: ${error.message}`);
      return;
    }

    if (viewingUser && viewingUser.id === id && viewingUserType === "driver") {
      setViewingUser(prev => prev ? { ...prev, status: prev.status === "Active" ? "Inactive" : "Active" } : null);
    }

    alert(`Driver status updated successfully!`);
    fetchData();
  };

  const handleDeactivatePassengerToggle = async (id: string) => {
    const passengerObj = passengers.find(p => p.id === id);
    if (!passengerObj) return;
    
    const nextStatus = passengerObj.status === "Active" ? false : true;

    console.log("[Supabase Query] Toggling passenger is_active status...");
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: nextStatus })
      .eq('id', id);

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
        status: "cancelled",
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
      await supabase
        .from('profiles')
        .update({ is_active: true })
        .eq('id', id);
        
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
        status: newRequestData.status === "Pending" ? "pending" :
                newRequestData.status === "In Transit" ? "pickedUp" :
                newRequestData.status === "Completed" ? "droppedOff" : "cancelled"
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
        d.bodyNumber.toLowerCase().includes(driverSearch.toLowerCase()) ||
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
      if (statusFilter === "Ongoing") {
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#091b6f] border-t-transparent"></div>
        <p className="text-[#091b6f] font-semibold mt-4 text-sm">Verifying Session...</p>
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

  // Unauthorized View render condition
  if (isLoggedIn && isAuthorized === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f3f8fc] font-sans p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md border border-slate-100 flex flex-col items-center">
          <span className="text-5xl mb-4">⛔</span>
          <h2 className="text-[#091b6f] font-extrabold text-2xl mb-2">Access Denied</h2>
          <p className="text-slate-500 text-sm font-semibold mb-6">
            Only accounts with the administrator role can access the TodaGo Admin Dashboard. Your current account does not have permission.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer"
          >
            Log Out / Switch Account
          </button>
        </div>
      </div>
    );
  }

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
                  totalDriversCount={totalDriversCount}
                  activeDriversCount={activeDriversCount}
                  usersCount={usersCount}
                  tripsCount={tripsCount}
                  earningsToday={earningsToday}
                  earningsWeekly={earningsWeekly}
                  chartData={chartData}
                  hoveredBarIndex={hoveredBarIndex}
                  setHoveredBarIndex={setHoveredBarIndex}
                  chartTooltip={chartTooltip}
                  setChartTooltip={setChartTooltip}
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
                  requestsPage={requestsPage}
                  setRequestsPage={setRequestsPage}
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
                  earningsPage={earningsPage}
                  setEarningsPage={setEarningsPage}
                  handleDownloadReport={handleDownloadReport}
                  setViewingEarningsRecord={setViewingEarningsRecord}
                  setShowViewEarningsModal={setShowViewEarningsModal}
                  setActiveStatModal={setActiveStatModal}
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
                  driversPage={driversPage}
                  setDriversPage={setDriversPage}
                  passengersPage={passengersPage}
                  setPassengersPage={setPassengersPage}
                  setViewingUser={setViewingUser}
                  setViewingUserType={setViewingUserType}
                  setShowViewUserModal={setShowViewUserModal}
                  setActiveStatModal={setActiveStatModal}
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
        onDeactivateDriverToggle={handleDeactivateToggle}
        onDeactivatePassengerToggle={handleDeactivatePassengerToggle}
        onIncrementCanceledTrips={handleIncrementCanceledTrips}
        onResetCanceledTrips={handleResetCanceledTrips}
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
