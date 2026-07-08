import { useEffect, useState, useMemo } from "react";
import { getCurrentAdminProfile } from "./lib/authService";
import {
  fetchAdminDashboardData,
  fetchFareSettings,
  subscribeAdminOperationalData,
  updateDriverAccount,
  updateDriverActiveStatus,
  updateDriverVerification,
  updateFareSetting,
  updatePassengerAccount,
  updatePassengerActiveStatus,
  uploadDriverLicenseImage,
} from "./lib/adminDataService";
import { createDriverAccount } from "./lib/driverService";
import {
  AdminNotification,
  fetchAdminNotifications,
  markAdminNotificationsRead,
  subscribeAdminNotifications,
} from "./lib/notificationService";

// Types
import {
  Driver,
  FareSetting,
  AdminTab,
  Passenger,
  RideRequest,
  EarningsRecord,
} from "./types";

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
import EditPassengerModal from "./components/modals/EditPassengerModal";
import AddRequestModal from "./components/modals/AddRequestModal";
import ViewRequestModal from "./components/modals/ViewRequestModal";
import ViewUserModal from "./components/modals/ViewUserModal";
import ViewEarningsModal from "./components/modals/ViewEarningsModal";
import StatBreakdownModal from "./components/modals/StatBreakdownModal";

export default function App() {
  // Authentication & Navigation State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreatingDriver, setIsCreatingDriver] = useState(false);

  // Admin Profile State
  const [adminProfile, setAdminProfile] = useState({
    name: "Alexa Cuarto",
    email: "cuartoalexa22@gmail.com",
    status: "Active",
    password: "password123",
    avatarSeed: "alexa",
    avatarColor: "#38bdf8",
    avatarUrl: ""
  });

  useEffect(() => {
    let isMounted = true;

    getCurrentAdminProfile()
      .then((profile) => {
        if (!isMounted) return;
        if (profile) {
          setAdminProfile(prev => ({
            ...prev,
            name: profile.full_name,
            email: profile.email ?? prev.email,
            status: profile.is_active ? "Active" : "Inactive",
          }));
          setIsLoggedIn(true);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Drivers, Passengers, Ride Requests, Earnings List States
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [earningsRecords, setEarningsRecords] = useState<EarningsRecord[]>([]);
  const [fareSettings, setFareSettings] = useState<FareSetting[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoadingOperationalData, setIsLoadingOperationalData] = useState(false);
  const [isLoadingFareSettings, setIsLoadingFareSettings] = useState(false);
  const [isSavingFareSetting, setIsSavingFareSetting] = useState("");
  const [operationalDataError, setOperationalDataError] = useState("");
  const [fareSettingsError, setFareSettingsError] = useState("");
  const [operationalReloadKey, setOperationalReloadKey] = useState(0);
  const [notificationReloadKey, setNotificationReloadKey] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) return;

    let isMounted = true;

    const loadOperationalData = async () => {
      setIsLoadingOperationalData(true);
      setIsLoadingFareSettings(true);
      setOperationalDataError("");
      setFareSettingsError("");
      try {
        const [data, settings] = await Promise.all([
          fetchAdminDashboardData(),
          fetchFareSettings(),
        ]);
        if (!isMounted) return;
        setDrivers(data.drivers);
        setPassengers(data.passengers);
        setRideRequests(data.rideRequests);
        setEarningsRecords(data.earningsRecords);
        setFareSettings(settings);
      } catch (error) {
        console.error("Unable to load Supabase operational data", error);
        if (isMounted) {
          const message =
            error instanceof Error
              ? error.message
              : typeof error === "object" && error !== null && "message" in error
                ? String((error as { message?: unknown }).message)
                : String(error || "Unable to load Supabase operational data.");
          setOperationalDataError(message);
          setFareSettingsError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingOperationalData(false);
          setIsLoadingFareSettings(false);
        }
      }
    };

    loadOperationalData();
    const channel = subscribeAdminOperationalData(loadOperationalData);

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [isLoggedIn, operationalReloadKey]);

  useEffect(() => {
    if (!isLoggedIn) return;

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const data = await fetchAdminNotifications();
        if (isMounted) setNotifications(data);
      } catch (error) {
        console.error("Unable to load notifications", error);
      }
    };

    loadNotifications();
    const channel = subscribeAdminNotifications(loadNotifications);

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [isLoggedIn, notificationReloadKey]);

  const handleRefreshDashboard = () => {
    setOperationalReloadKey(key => key + 1);
    setNotificationReloadKey(key => key + 1);
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await markAdminNotificationsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true })),
      );
    } catch (error) {
      console.error("Unable to mark notifications read", error);
    }
  };

  // Modal display states
  const [showEditDriverModal, setShowEditDriverModal] = useState(false);
  const [showEditPassengerModal, setShowEditPassengerModal] = useState(false);
  const [showAddRequestModal, setShowAddRequestModal] = useState(false);
  const [showViewRequestModal, setShowViewRequestModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showViewEarningsModal, setShowViewEarningsModal] = useState(false);
  const [activeStatModal, setActiveStatModal] = useState<string | null>(null);

  // Selected item states
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
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
    password: "",
    plateNumber: "",
    isVerified: false,
    licenseImage: null as File | null,
    licenseImageName: ""
  });

  const [passengerEditFormData, setPassengerEditFormData] = useState({
    name: "",
    contact: "",
    email: "",
    status: "Active" as "Active" | "Inactive",
    password: "",
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
  const [usersSubTab, setUsersSubTab] = useState<"all" | "drivers" | "passengers">("drivers");

  // Pagination states
  const [requestsPage, setRequestsPage] = useState(1);
  const [driversPage, setDriversPage] = useState(1);
  const [passengersPage, setPassengersPage] = useState(1);
  const [earningsPage, setEarningsPage] = useState(1);

  // Chart hover states
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [chartTooltip, setChartTooltip] = useState({ x: 0, y: 0, val: 0, label: "" });

  // Calculated derived statistics
  const totalDriversCount = drivers.length;
  const activeDriversCount = drivers.filter(d => d.status === "Active").length;
  const activePassengersCount = passengers.filter(p => p.status === "Active").length;
  const registeredPassengersCount = passengers.length;
  const usersCount = passengers.length + drivers.length;
  const tripsCount = rideRequests.length;

  const earningsToday = useMemo(() => {
    const today = new Date().toDateString();
    return rideRequests
      .filter(r => r.status === "Completed" && new Date(r.time).toDateString() === today)
      .reduce((sum, r) => sum + r.fare, 0);
  }, [rideRequests]);

  const earningsWeekly = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return rideRequests
      .filter(r => r.status === "Completed" && new Date(r.time) >= weekStart)
      .reduce((sum, r) => sum + r.fare, 0);
  }, [rideRequests]);

  const earningsMonthly = useMemo(() => {
    const now = new Date();
    return rideRequests
      .filter(r => {
        const rideDate = new Date(r.time);
        return r.status === "Completed" &&
          rideDate.getMonth() === now.getMonth() &&
          rideDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, r) => sum + r.fare, 0);
  }, [rideRequests]);

  const chartData = useMemo(() => {
    const hours = [8, 9, 10, 11, 12, 13];
    return hours.map(hour => {
      const labelDate = new Date();
      labelDate.setHours(hour, 0, 0, 0);
      return {
        label: labelDate.toLocaleTimeString([], { hour: "numeric" }),
        val: rideRequests.filter(r => {
          const rideDate = new Date(r.time);
          return rideDate.toDateString() === new Date().toDateString() &&
            rideDate.getHours() === hour;
        }).length,
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
        alert(`Failed to create driver account: ${result.error}`);
        return;
      }

      if (formData.licenseImage) {
        if (!result.driverId) {
          alert("Driver account was created, but the license image could not be uploaded because the new driver ID was not resolved. Open the driver edit modal and upload the license image there.");
        } else {
          await uploadDriverLicenseImage(result.driverId, formData.licenseImage);
        }
      }

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
      setOperationalReloadKey(key => key + 1);
      alert(`Driver account created successfully for ${result.driverName}!\nThe driver can now log in with the Flutter app.`);
    } catch (err: any) {
      alert(`Unexpected error: ${err.message || err}`);
    } finally {
      setIsCreatingDriver(false);
    }
  };

  const handleEditDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;
    try {
      await updateDriverAccount(editingDriver, editFormData);
      let licenseImageUrl = editingDriver.licenseImageUrl;
      let licenseImageName = editingDriver.licenseImageName;
      if (editFormData.licenseImage) {
        licenseImageUrl = await uploadDriverLicenseImage(
          editingDriver.id,
          editFormData.licenseImage,
        );
        licenseImageName = editFormData.licenseImageName;
      }
      setDrivers(prev =>
        prev.map(d =>
          d.id === editingDriver.id
            ? {
                ...d,
                name: editFormData.name,
                phone: editFormData.phone,
                license: editFormData.license,
                bodyNumber: editFormData.bodyNumber,
                toda: editFormData.toda,
                status: editFormData.status,
                email: editFormData.email,
                plateNumber: editFormData.plateNumber,
                isVerified: editFormData.isVerified,
                licenseImageUrl,
                licenseImageName
              }
            : d
        )
      );
      setShowEditDriverModal(false);
      setEditingDriver(null);
      setEditFormData(prev => ({ ...prev, password: "" }));
    } catch (error) {
      alert(`Unable to update driver account: ${error instanceof Error ? error.message : error}`);
    }
  };

  const handleEditPassenger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPassenger) return;
    try {
      await updatePassengerAccount(editingPassenger, passengerEditFormData);
      setPassengers(prev =>
        prev.map(p =>
          p.id === editingPassenger.id
            ? {
                ...p,
                name: passengerEditFormData.name,
                contact: passengerEditFormData.contact,
                email: passengerEditFormData.email,
                status: passengerEditFormData.status,
              }
            : p
        )
      );
      if (viewingUser?.id === editingPassenger.id && viewingUserType === "passenger") {
        setViewingUser(prev =>
          prev
            ? {
                ...prev,
                name: passengerEditFormData.name,
                contact: passengerEditFormData.contact,
                email: passengerEditFormData.email,
                status: passengerEditFormData.status,
              } as Passenger
            : null
        );
      }
      setShowEditPassengerModal(false);
      setEditingPassenger(null);
      setPassengerEditFormData(prev => ({ ...prev, password: "" }));
    } catch (error) {
      alert(`Unable to update passenger account: ${error instanceof Error ? error.message : error}`);
    }
  };

  const handleDriverVerificationToggle = async (id: number | string) => {
    const driver = drivers.find(d => d.id === id);
    if (!driver) return;
    const nextIsVerified = !driver.isVerified;

    try {
      await updateDriverVerification(id, nextIsVerified);
      setDrivers(prev =>
        prev.map(d => d.id === id ? { ...d, isVerified: nextIsVerified } : d)
      );
      if (viewingUser && viewingUser.id === id && viewingUserType === "driver") {
        setViewingUser(prev => prev ? { ...prev, isVerified: nextIsVerified } as Driver : null);
      }
    } catch (error) {
      alert(`Unable to update driver verification: ${error instanceof Error ? error.message : error}`);
    }
  };

  const handleFareSettingChange = (
    tripType: FareSetting["tripType"],
    updates: Partial<FareSetting>,
  ) => {
    setFareSettings(prev =>
      prev.map(setting =>
        setting.tripType === tripType ? { ...setting, ...updates } : setting,
      ),
    );
  };

  const handleSaveFareSetting = async (setting: FareSetting) => {
    setIsSavingFareSetting(setting.tripType);
    setFareSettingsError("");
    try {
      const saved = await updateFareSetting({
        ...setting,
        baseFare: Math.max(Number(setting.baseFare) || 0, 0),
        includedKm: Math.max(Number(setting.includedKm) || 0, 0),
        perSucceedingKm: Math.max(Number(setting.perSucceedingKm) || 0, 0),
        studentDiscountPercent: Math.min(Math.max(Number(setting.studentDiscountPercent) || 0, 0), 100),
        pwdDiscountPercent: Math.min(Math.max(Number(setting.pwdDiscountPercent) || 0, 0), 100),
        seniorDiscountPercent: Math.min(Math.max(Number(setting.seniorDiscountPercent) || 0, 0), 100),
      });
      setFareSettings(prev =>
        prev.map(item => item.tripType === saved.tripType ? saved : item),
      );
    } catch (error) {
      setFareSettingsError(`Unable to save fare settings: ${error instanceof Error ? error.message : error}`);
    } finally {
      setIsSavingFareSetting("");
    }
  };

  const handleDeactivateToggle = async (id: number | string) => {
    const driver = drivers.find(d => d.id === id);
    if (!driver) return;
    const nextStatus = driver.status === "Active" ? "Inactive" : "Active";

    try {
      await updateDriverActiveStatus(driver, nextStatus);
      setDrivers(prev =>
        prev.map(d => d.id === id ? { ...d, status: nextStatus } : d)
      );
      if (viewingUser && viewingUser.id === id && viewingUserType === "driver") {
        setViewingUser(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (error) {
      alert(`Unable to update driver status: ${error instanceof Error ? error.message : error}`);
    }
  };

  const handleDeactivatePassengerToggle = async (id: number | string) => {
    const passenger = passengers.find(p => p.id === id);
    if (!passenger) return;

    if (passenger.canceledTrips >= 3 && passenger.status === "Inactive") {
      alert("Cannot reactivate passenger! Canceled trips limit (3) exceeded.");
      return;
    }

    const nextStatus = passenger.status === "Active" ? "Inactive" : "Active";

    try {
      await updatePassengerActiveStatus(passenger, nextStatus);
      setPassengers(prev =>
        prev.map(p => p.id === id ? { ...p, status: nextStatus } : p)
      );
      if (viewingUser && viewingUser.id === id && viewingUserType === "passenger") {
        setViewingUser(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (error) {
      alert(`Unable to update passenger status: ${error instanceof Error ? error.message : error}`);
    }
  };

  const handleIncrementCanceledTrips = (id: number | string) => {
    setPassengers(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextCanceled = p.canceledTrips + 1;
          const nextStatus = nextCanceled >= 3 ? "Inactive" : p.status;
          if (nextCanceled >= 3) {
            alert(`Passenger ${p.name} has reached 3 canceled trips and is now automatically deactivated!`);
          }
          return { ...p, canceledTrips: nextCanceled, status: nextStatus };
        }
        return p;
      })
    );
    // Sync view modal if active
    if (viewingUser && viewingUser.id === id && viewingUserType === "passenger") {
      setViewingUser(prev => {
        if (!prev) return null;
        const p = prev as Passenger;
        const nextCanceled = p.canceledTrips + 1;
        const nextStatus = nextCanceled >= 3 ? "Inactive" : p.status;
        return { ...p, canceledTrips: nextCanceled, status: nextStatus };
      });
    }
  };

  const handleResetCanceledTrips = (id: number | string) => {
    setPassengers(prev =>
      prev.map(p => {
        if (p.id === id) {
          return { ...p, canceledTrips: 0, status: "Active" };
        }
        return p;
      })
    );
    if (viewingUser && viewingUser.id === id && viewingUserType === "passenger") {
      setViewingUser(prev => {
        if (!prev) return null;
        const p = prev as Passenger;
        return { ...p, canceledTrips: 0, status: "Active" };
      });
    }
  };

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestData.passenger || !newRequestData.location || !newRequestData.destination || !newRequestData.fare) {
      alert("Please fill in all fields.");
      return;
    }
    const assignedDriver = drivers.find(d => d.id === Number(newRequestData.driverId));
    const assignedDriverName = assignedDriver?.name || "-";
    const assignedDriverToda = assignedDriver?.toda || "-";

    const newReq: RideRequest = {
      id: Date.now(),
      passenger: newRequestData.passenger,
      driver: assignedDriverName,
      location: newRequestData.location,
      destination: newRequestData.destination,
      pickupLatitude: null,
      pickupLongitude: null,
      dropoffLatitude: null,
      dropoffLongitude: null,
      status: newRequestData.status,
      fare: Number(newRequestData.fare),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toda: assignedDriverToda
    };
    setRideRequests(prev => [newReq, ...prev]);
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
  };

  const handleDownloadReport = () => {
    const headers = "Date,TODA Association,Completed Rides,Total Earnings,Driver Assigned\n";
    const rows = earningsRecords.map(r =>
      `"${r.date}","${r.toda}",${r.completedRides},${r.totalEarnings},"${r.driverName || 'N/A'}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `TodaGo_Earnings_Report_${new Date().toISOString().split("T")[0]}.csv`);
    a.click();
    alert("Report download initiated!");
  };

  // Filter lists
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
        p.contact.includes(driverSearch) ||
        p.email.toLowerCase().includes(driverSearch.toLowerCase());
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

  // Login View render condition
  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f8fc] text-[#091b6f] font-bold">
        Loading...
      </div>
    );
  }

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

  return (
    <div className="flex flex-col h-screen bg-[#f3f8fc] font-sans antialiased text-slate-800">
      {/* HEADER SECTION */}
      <Header
        adminProfile={adminProfile}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onRefreshDashboard={handleRefreshDashboard}
        isRefreshingDashboard={isLoadingOperationalData || isLoadingFareSettings}
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
          {isLoadingOperationalData && (
            <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-[#091b6f]">
              Loading Supabase operational data...
            </div>
          )}

          {operationalDataError && (
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 sm:flex-row sm:items-center sm:justify-between">
              <span>Supabase data load failed: {operationalDataError}</span>
              <button
                type="button"
                onClick={() => setOperationalReloadKey(key => key + 1)}
                disabled={isLoadingOperationalData}
                className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                Retry
              </button>
            </div>
          )}

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
              earningsMonthly={earningsMonthly}
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

          {activeTab === "fare-settings" && (
            <FareSettingsView
              fareSettings={fareSettings}
              fareSettingsError={fareSettingsError}
              isLoadingFareSettings={isLoadingFareSettings}
              isSavingFareSetting={isSavingFareSetting}
              onFareSettingChange={handleFareSettingChange}
              onSaveFareSetting={handleSaveFareSetting}
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
              setEditingDriver={setEditingDriver}
              setEditFormData={setEditFormData}
              setShowEditDriverModal={setShowEditDriverModal}
              setEditingPassenger={setEditingPassenger}
              setPassengerEditFormData={setPassengerEditFormData}
              setShowEditPassengerModal={setShowEditPassengerModal}
              setActiveStatModal={setActiveStatModal}
              activePassengerCount={activePassengersCount}
              activeDriverCount={activeDriversCount}
              registeredPassengerCount={registeredPassengersCount}
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

      <EditPassengerModal
        isOpen={showEditPassengerModal}
        onClose={() => {
          setShowEditPassengerModal(false);
          setEditingPassenger(null);
        }}
        editingPassenger={editingPassenger}
        editFormData={passengerEditFormData}
        setEditFormData={setPassengerEditFormData}
        onSubmit={handleEditPassenger}
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
        onDriverVerificationToggle={handleDriverVerificationToggle}
        onDeactivatePassengerToggle={handleDeactivatePassengerToggle}
        onIncrementCanceledTrips={handleIncrementCanceledTrips}
        onResetCanceledTrips={handleResetCanceledTrips}
        onEdit={() => {
          if (!viewingUser || !viewingUserType) return;
          if (viewingUserType === "driver") {
            const driver = viewingUser as Driver;
            setEditingDriver(driver);
            setEditFormData({
              name: driver.name,
              phone: driver.phone,
              license: driver.license,
              bodyNumber: driver.bodyNumber,
              toda: driver.toda,
              status: driver.status,
              email: driver.email || "",
              password: "",
              plateNumber: driver.plateNumber || "",
              isVerified: driver.isVerified,
              licenseImage: null,
              licenseImageName: driver.licenseImageName || "",
            });
            setShowEditDriverModal(true);
          } else {
            const passenger = viewingUser as Passenger;
            setEditingPassenger(passenger);
            setPassengerEditFormData({
              name: passenger.name,
              contact: passenger.contact,
              email: passenger.email || "",
              status: passenger.status,
              password: "",
            });
            setShowEditPassengerModal(true);
          }
        }}
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
