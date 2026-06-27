export interface Driver {
  id: number;
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
  licenseImageName?: string;
}

export interface Passenger {
  id: number;
  name: string;
  contact: string;
  canceledTrips: number;
  status: "Active" | "Inactive";
  joinedDate: string;
  ridesTaken: number;
}

export interface RideRequest {
  id: number;
  passenger: string;
  driver: string;
  location: string;
  destination: string;
  status: "Pending" | "In Transit" | "Scheduled" | "Completed" | "Cancelled";
  fare: number;
  time: string;
  toda: string;
}

export interface EarningsRecord {
  id: number;
  date: string;
  toda: string;
  completedRides: number;
  totalEarnings: number;
  commissionEarned: number;
  driverName?: string;
}

export const initialDrivers: Driver[] = [
  { id: 1, name: "Joross Pogi", toda: "BYPASS ILAYANG BAGUIO-TODA", status: "Active", phone: "09123456789", license: "ABC123456", bodyNumber: "T-1042", trips: 45, joinedDate: "2026-01-12", email: "joross@gmail.com", plateNumber: "ABC-1234" },
  { id: 2, name: "Mark Reyes", toda: "CHOT-TODA", status: "Active", phone: "09187654321", license: "XYZ678910", bodyNumber: "T-2091", trips: 32, joinedDate: "2026-02-20", email: "mark@gmail.com", plateNumber: "XYZ-5678" },
  { id: 3, name: "Leo Mendoza", toda: "LHITC-TODA", status: "Inactive", phone: "09223334444", license: "GHL345678", bodyNumber: "T-0582", trips: 28, joinedDate: "2026-03-05", email: "leo@gmail.com", plateNumber: "GHL-9012" },
  { id: 4, name: "Ricky Cruz", toda: "LHITC-TODA", status: "Active", phone: "09456789012", license: "NMO567890", bodyNumber: "T-0912", trips: 14, joinedDate: "2026-03-18", email: "ricky@gmail.com", plateNumber: "NMO-3456" },
  { id: 5, name: "Ernie Dela Cruz", toda: "CHOT-TODA", status: "Active", phone: "09998887777", license: "JKL255689", bodyNumber: "T-1152", trips: 60, joinedDate: "2026-01-05", email: "ernie@gmail.com", plateNumber: "JKL-7890" },
  { id: 6, name: "Pedro Santos", toda: "CHOT-TODA", status: "Active", phone: "09172223333", license: "PD-998877", bodyNumber: "T-3021", trips: 22, joinedDate: "2026-03-10", email: "pedro@gmail.com", plateNumber: "PDR-1212" },
  { id: 7, name: "Mario Reyes", toda: "LHITC-TODA", status: "Active", phone: "09154445555", license: "MR-887766", bodyNumber: "T-4011", trips: 52, joinedDate: "2026-01-20", email: "mario@gmail.com", plateNumber: "MRO-2323" },
  { id: 8, name: "Juan Cruz", toda: "BYPASS ILAYANG BAGUIO-TODA", status: "Active", phone: "09165556666", license: "JC-776655", bodyNumber: "T-5011", trips: 18, joinedDate: "2026-04-01", email: "juan.cruz@gmail.com", plateNumber: "JUA-3434" },
  { id: 9, name: "Thomas Dizon", toda: "BYPASS ILAYANG BAGUIO-TODA", status: "Active", phone: "09181112222", license: "TD-665544", bodyNumber: "T-6011", trips: 35, joinedDate: "2026-02-15", email: "thomas@gmail.com", plateNumber: "THM-4545" },
  { id: 10, name: "Roberto Bautista", toda: "BYPASS ILAYANG BAGUIO-TODA", status: "Active", phone: "09192223333", license: "RB-554433", bodyNumber: "T-7011", trips: 41, joinedDate: "2026-02-28", email: "roberto@gmail.com", plateNumber: "RBT-5656" },
  { id: 11, name: "Joross Buera", toda: "BYPASS ILAYANG BAGUIO-TODA", status: "Active", phone: "09203334444", license: "JB-443322", bodyNumber: "T-8011", trips: 29, joinedDate: "2026-03-01", email: "buera@gmail.com", plateNumber: "JRS-6767" },
  { id: 12, name: "Alliah Adamos", toda: "CHOT-TODA", status: "Active", phone: "09214445555", license: "AA-332211", bodyNumber: "T-9011", trips: 12, joinedDate: "2026-04-10", email: "alliah@gmail.com", plateNumber: "ALH-7878" },
  { id: 13, name: "Manuel Roxas", toda: "BYPASS ILAYANG BAGUIO-TODA", status: "Inactive", phone: "09456789011", license: "N04-56-789012", bodyNumber: "T-0912", trips: 14, joinedDate: "2026-03-18", email: "manuel@gmail.com", plateNumber: "MNL-1010" },
  { id: 14, name: "Jose Rizal", toda: "LHITC-TODA", status: "Active", phone: "09998887771", license: "N05-88-990011", bodyNumber: "T-1152", trips: 60, joinedDate: "2026-01-05", email: "rizal@gmail.com", plateNumber: "JSE-1111" },
  { id: 15, name: "Benigno Aquino", toda: "LHITC-TODA", status: "Active", phone: "09228889999", license: "BA-221100", bodyNumber: "T-1250", trips: 7, joinedDate: "2026-04-20", email: "benigno@gmail.com", plateNumber: "BEN-2222" },
  { id: 16, name: "Ramon Magsaysay", toda: "CHOT-TODA", status: "Active", phone: "09239990000", license: "RM-110099", bodyNumber: "T-1350", trips: 92, joinedDate: "2025-12-01", email: "ramon@gmail.com", plateNumber: "RMN-3333" },
  { id: 17, name: "Carlos Garcia", toda: "BYPASS ILAYANG BAGUIO-TODA", status: "Active", phone: "09240001111", license: "CG-009988", bodyNumber: "T-1450", trips: 44, joinedDate: "2026-01-15", email: "carlos@gmail.com", plateNumber: "CRL-4444" },
  { id: 18, name: "Diosdado Macapagal", toda: "LHITC-TODA", status: "Inactive", phone: "09251112222", license: "DM-998877", bodyNumber: "T-1550", trips: 3, joinedDate: "2026-05-01", email: "diosdado@gmail.com", plateNumber: "DSD-5555" },
  { id: 19, name: "Fidel Ramos", toda: "CHOT-TODA", status: "Active", phone: "09262223333", license: "FR-887766", bodyNumber: "T-1650", trips: 110, joinedDate: "2025-10-10", email: "fidel@gmail.com", plateNumber: "FDL-6666" },
  { id: 20, name: "Joseph Estrada", toda: "BYPASS ILAYANG BAGUIO-TODA", status: "Active", phone: "09273334444", license: "JE-776655", bodyNumber: "T-1750", trips: 85, joinedDate: "2025-11-20", email: "joseph@gmail.com", plateNumber: "JSP-7777" }
];

export const initialPassengers: Passenger[] = [
  { id: 1, name: "Ana Garcia", contact: "09123456789", canceledTrips: 0, status: "Active", joinedDate: "2026-01-15", ridesTaken: 24 },
  { id: 2, name: "Alexa Cuarto", contact: "09987654321", canceledTrips: 1, status: "Active", joinedDate: "2026-02-10", ridesTaken: 15 },
  { id: 3, name: "Alliah Adanos", contact: "09134679852", canceledTrips: 3, status: "Inactive", joinedDate: "2026-03-01", ridesTaken: 42 },
  { id: 4, name: "Elmer Ramos", contact: "09784510235", canceledTrips: 2, status: "Active", joinedDate: "2026-03-12", ridesTaken: 9 },
  { id: 5, name: "Michelle Cruz", contact: "09090319579", canceledTrips: 0, status: "Active", joinedDate: "2026-01-05", ridesTaken: 55 },
  { id: 6, name: "Carlo Diaz", contact: "09281112222", canceledTrips: 0, status: "Active", joinedDate: "2026-02-18", ridesTaken: 18 },
  { id: 7, name: "Maria Cruz", contact: "09292223333", canceledTrips: 3, status: "Inactive", joinedDate: "2026-01-20", ridesTaken: 30 },
  { id: 8, name: "Ana Reyes", contact: "09303334444", canceledTrips: 0, status: "Active", joinedDate: "2026-02-22", ridesTaken: 12 },
  { id: 9, name: "James Ignaco", contact: "09314445555", canceledTrips: 1, status: "Active", joinedDate: "2026-03-05", ridesTaken: 8 },
  { id: 10, name: "John Santos", contact: "09325556666", canceledTrips: 3, status: "Inactive", joinedDate: "2026-02-05", ridesTaken: 21 },
  { id: 11, name: "Patrick Sision", contact: "09336667777", canceledTrips: 0, status: "Active", joinedDate: "2026-03-20", ridesTaken: 16 },
  { id: 12, name: "Andy Lim", contact: "09347778888", canceledTrips: 2, status: "Active", joinedDate: "2026-04-02", ridesTaken: 5 },
  { id: 13, name: "Joseph Villadiego", contact: "09358889999", canceledTrips: 0, status: "Active", joinedDate: "2026-04-12", ridesTaken: 11 },
  { id: 14, name: "Ramon Fileca", contact: "09369990000", canceledTrips: 1, status: "Active", joinedDate: "2026-04-18", ridesTaken: 14 },
  { id: 15, name: "Clara Cruz", contact: "09370001111", canceledTrips: 0, status: "Active", joinedDate: "2026-05-01", ridesTaken: 2 }
];

export const initialRideRequests: RideRequest[] = [
  { id: 1, passenger: "Maria Cruz", driver: "-", location: "Tayabas Market", destination: "Brgy. Baguio", status: "Pending", fare: 80, time: "8:45 AM", toda: "-" },
  { id: 2, passenger: "Carlo Diaz", driver: "Pedro Santos", location: "Minor Basilica", destination: "Tayabas Market", status: "In Transit", fare: 120, time: "11:15 AM", toda: "CHOT-TODA" },
  { id: 3, passenger: "Ana Reyes", driver: "Mario Reyes", location: "Primark", destination: "Mateuna Sub.", status: "In Transit", fare: 65, time: "1:30 PM", toda: "LHITC-TODA" },
  { id: 4, passenger: "James Ignaco", driver: "Thomas Dizon", location: "SLSU", destination: "Luis Palad", status: "Pending", fare: 90, time: "1:45 PM", toda: "BYPASS ILAYANG BAGUIO-TODA" },
  { id: 5, passenger: "John Santos", driver: "Pedro Santos", location: "Minor Basilica", destination: "Tayabas Market", status: "Pending", fare: 75, time: "2:00 PM", toda: "CHOT-TODA" },
  { id: 6, passenger: "Patrick Sision", driver: "Roberto Bautista", location: "Brgy. Lalo", destination: "Ibaba Palale", status: "In Transit", fare: 110, time: "2:15 PM", toda: "BYPASS ILAYANG BAGUIO-TODA" },
  { id: 7, passenger: "Andy Lim", driver: "-", location: "Sitio Babaysin", destination: "Lakawan", status: "Pending", fare: 85, time: "2:30 PM", toda: "-" },
  { id: 8, passenger: "Joseph Villadiego", driver: "Alliah Adamos", location: "Mt. Carmel", destination: "Alsam", status: "In Transit", fare: 95, time: "2:45 PM", toda: "CHOT-TODA" },
  { id: 9, passenger: "Ramon Fileca", driver: "Joross Buera", location: "Brgy. Silangan", destination: "Tayabas Market", status: "In Transit", fare: 130, time: "3:00 PM", toda: "BYPASS ILAYANG BAGUIO-TODA" },
  { id: 10, passenger: "Ben Santos", driver: "Mario Reyes", location: "SLSU", destination: "Brgy. Baguio", status: "In Transit", fare: 70, time: "3:15 PM", toda: "LHITC-TODA" },
  { id: 11, passenger: "Clara Cruz", driver: "Joross Buera", location: "Tayabas Market", destination: "Minor Basilica", status: "Pending", fare: 60, time: "3:30 PM", toda: "BYPASS ILAYANG BAGUIO-TODA" },
  { id: 12, passenger: "Danilo Lopez", driver: "Pedro Santos", location: "Plaza Mayor", destination: "Sitio Babaysin", status: "In Transit", fare: 115, time: "3:45 PM", toda: "CHOT-TODA" },
  { id: 13, passenger: "Elena Torres", driver: "Thomas Dizon", location: "Mateuna Sub.", destination: "Primark", status: "Pending", fare: 80, time: "4:00 PM", toda: "BYPASS ILAYANG BAGUIO-TODA" },
  { id: 14, passenger: "Felix Garcia", driver: "Alliah Adamos", location: "Alsam", destination: "Mt. Carmel", status: "In Transit", fare: 90, time: "4:15 PM", toda: "CHOT-TODA" },
  { id: 15, passenger: "Gardo Dimaano", driver: "-", location: "Lakawan", destination: "Brgy. Silangan", status: "Pending", fare: 100, time: "4:30 PM", toda: "-" },
  { id: 16, passenger: "Hannah Perez", driver: "Ricky Cruz", location: "Grand Terminal", destination: "SLSU", status: "Scheduled", fare: 150, time: "Tomorrow 7:00 AM", toda: "LHITC-TODA" },
  { id: 17, passenger: "Ian Romero", driver: "Ernie Dela Cruz", location: "City Hall", destination: "Tayabas Market", status: "Scheduled", fare: 80, time: "Tomorrow 9:00 AM", toda: "CHOT-TODA" },
  { id: 18, passenger: "Michelle Cruz", driver: "Jose Rizal", location: "Tayabas Market", destination: "Lucena", status: "Completed", fare: 250, time: "May 23, 10:15 AM", toda: "LHITC-TODA" },
  { id: 19, passenger: "Elmer Ramos", driver: "Juan Cruz", location: "SLSU", destination: "Brgy. Baguio", status: "Completed", fare: 75, time: "May 23, 11:30 AM", toda: "BYPASS ILAYANG BAGUIO-TODA" },
  { id: 20, passenger: "Katelyn Co", driver: "Mark Reyes", location: "Minor Basilica", destination: "Grand Terminal", status: "Completed", fare: 140, time: "May 23, 1:00 PM", toda: "CHOT-TODA" },
  { id: 21, passenger: "Alliah Adanos", driver: "-", location: "Mateuna Sub.", destination: "SLSU", status: "Cancelled", fare: 80, time: "May 22, 2:15 PM", toda: "CHOT-TODA" },
  { id: 22, passenger: "John Santos", driver: "-", location: "City Hall", destination: "Alsam", status: "Cancelled", fare: 95, time: "May 22, 4:00 PM", toda: "CHOT-TODA" }
];

export const initialEarningsRecords: EarningsRecord[] = [
  { id: 1, date: "April 8, 2026", toda: "LHITC-TODA", completedRides: 22, totalEarnings: 1340, commissionEarned: 280, driverName: "Mario Reyes" },
  { id: 2, date: "April 7, 2026", toda: "CHOT-TODA", completedRides: 26, totalEarnings: 1120, commissionEarned: 224, driverName: "Pedro Santos" },
  { id: 3, date: "April 7, 2026", toda: "BYPASS ILAYANG BAGUIO-TODA", completedRides: 22, totalEarnings: 880, commissionEarned: 176, driverName: "Juan Cruz" },
  { id: 4, date: "April 7, 2026", toda: "LHITC-TODA", completedRides: 35, totalEarnings: 1400, commissionEarned: 280, driverName: "Jose Rizal" },
  { id: 5, date: "April 6, 2026", toda: "CHOT-TODA", completedRides: 27, totalEarnings: 1080, commissionEarned: 216, driverName: "Ernie Dela Cruz" },
  { id: 6, date: "April 6, 2026", toda: "LHITC-TODA", completedRides: 25, totalEarnings: 1000, commissionEarned: 200, driverName: "Ricky Cruz" },
  { id: 7, date: "April 3, 2026", toda: "LHITC-TODA", completedRides: 30, totalEarnings: 1200, commissionEarned: 240, driverName: "Mario Reyes" },
  { id: 8, date: "April 2, 2026", toda: "BYPASS ILAYANG BAGUIO-TODA", completedRides: 25, totalEarnings: 1240, commissionEarned: 248, driverName: "Thomas Dizon" },
  { id: 9, date: "April 1, 2026", toda: "BYPASS ILAYANG BAGUIO-TODA", completedRides: 31, totalEarnings: 957, commissionEarned: 158, driverName: "Roberto Bautista" },
  { id: 10, date: "March 31, 2026", toda: "CHOT-TODA", completedRides: 20, totalEarnings: 980, commissionEarned: 196, driverName: "Mark Reyes" },
  { id: 11, date: "March 30, 2026", toda: "LHITC-TODA", completedRides: 18, totalEarnings: 850, commissionEarned: 170, driverName: "Jose Rizal" },
  { id: 12, date: "March 29, 2026", toda: "BYPASS ILAYANG BAGUIO-TODA", completedRides: 15, totalEarnings: 720, commissionEarned: 144, driverName: "Joross Buera" }
];

export const chartData = [
  { label: "8 AM", val: 38 },
  { label: "9 AM", val: 36 },
  { label: "10 AM", val: 21 },
  { label: "11 AM", val: 28 },
  { label: "12 PM", val: 16 },
  { label: "1 PM", val: 30 }
];
