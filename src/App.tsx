import { useState, useMemo } from "react";
import { createDriverAccount } from "./lib/driverService";

// Mock Data & Types
import {
  Driver,
  Passenger,
  RideRequest,
  EarningsRecord,
  initialDrivers,
  initialPassengers,
  initialRideRequests,
  initialEarningsRecords,
  chartData,
} from "./data/mockData";

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
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<"dashboard" | "ride-requests" | "earnings" | "users" | "profile" | "create-driver">("dashboard");
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

  // Drivers, Passengers, Ride Requests, Earnings List States
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [passengers, setPassengers] = useState<Passenger[]>(initialPassengers);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>(initialRideRequests);
  const [earningsRecords] = useState<EarningsRecord[]>(initialEarningsRecords);

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

  // Calculated derived statistics
  const totalDriversCount = drivers.length;
  const activeDriversCount = drivers.filter(d => d.status === "Active").length;
  const usersCount = passengers.length + drivers.length;
  const tripsCount = rideRequests.length + 206;

  const earningsToday = useMemo(() => {
    return rideRequests
      .filter(r => r.status === "Completed")
      .reduce((sum, r) => sum + r.fare, 50000);
  }, [rideRequests]);

  const earningsWeekly = useMemo(() => {
    return 18200 + (earningsToday - 50000);
  }, [earningsToday]);

  const earningsMonthly = useMemo(() => {
    return 72500 + (earningsToday - 50000);
  }, [earningsToday]);

  // Handlers
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Add to local state so it shows in the UI immediately
      const newDriver: Driver = {
        id: Date.now(),
        name: formData.name,
        toda: formData.toda,
        status: "Active",
        phone: formData.phone,
        license: "PENDING",
        bodyNumber: "T-" + Math.floor(1000 + Math.random() * 9000),
        trips: 0,
        joinedDate: new Date().toISOString().split("T")[0],
        email: formData.email,
        plateNumber: formData.plateNumber,
        licenseImageName: formData.licenseImageName || "driver_license.pdf"
      };
      setDrivers(prev => [newDriver, ...prev]);

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
    } catch (err: any) {
      alert(`Unexpected error: ${err.message || err}`);
    } finally {
      setIsCreatingDriver(false);
    }
  };

  const handleEditDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;
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
              plateNumber: editFormData.plateNumber
            }
          : d
      )
    );
    setShowEditDriverModal(false);
    setEditingDriver(null);
  };

  const handleDeactivateToggle = (id: number) => {
    setDrivers(prev =>
      prev.map(d => {
        if (d.id === id) {
          const nextStatus = d.status === "Active" ? "Inactive" : "Active";
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
    // Sync view modal if active
    if (viewingUser && viewingUser.id === id && viewingUserType === "driver") {
      setViewingUser(prev => prev ? { ...prev, status: prev.status === "Active" ? "Inactive" : "Active" } : null);
    }
  };

  const handleDeactivatePassengerToggle = (id: number) => {
    setPassengers(prev =>
      prev.map(p => {
        if (p.id === id) {
          if (p.canceledTrips >= 3 && p.status === "Inactive") {
            alert("Cannot reactivate passenger! Canceled trips limit (3) exceeded.");
            return p;
          }
          const nextStatus = p.status === "Active" ? "Inactive" : "Active";
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
    // Sync view modal if active
    if (viewingUser && viewingUser.id === id && viewingUserType === "passenger") {
      setViewingUser(prev => {
        if (!prev) return null;
        if ((prev as Passenger).canceledTrips >= 3 && prev.status === "Inactive") return prev;
        return { ...prev, status: prev.status === "Active" ? "Inactive" : "Active" };
      });
    }
  };

  const handleIncrementCanceledTrips = (id: number) => {
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

  const handleResetCanceledTrips = (id: number) => {
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
