// ============================================================
// PROCUREMENT CONTEXT  (Auth + Data)
// Core application state: users, PRs, vendors, notifications
// Future: replace with Supabase / API service calls
// ============================================================

import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  User,
  Role,
  PurchaseRequest,
  PRStatus,
  PRItem,
  Vendor,
  Notification,
  ActivityLog,
} from "../../types";
import { STORAGE_KEYS } from "../../constants";

// ─── Seed Data ───────────────────────────────────────────────
const SEED_USERS: User[] = [
  { id: "1", name: "Alex Employee",    email: "employee@corp.com",  role: "Employee",  department: "IT & Systems", status: "Active" },
  { id: "2", name: "Sarah Approver",   email: "approver@corp.com",  role: "Approver",  department: "Finance",      status: "Active" },
  { id: "3", name: "David Purchasing", email: "purchasing@corp.com", role: "Purchasing",department: "Procurement",  status: "Active" },
  { id: "4", name: "Michael Admin",    email: "admin@corp.com",     role: "Admin",     department: "IT & Systems", status: "Active" },
];

const SEED_VENDORS: Vendor[] = [
  { id: "v1", name: "Global Tech Solutions", code: "VND-GLB-01", category: "Hardware & IT",    rating: 4.8, contact: "sales@globaltech.com",  status: "Active" },
  { id: "v2", name: "Office Depo Supplies",  code: "VND-OFF-02", category: "Office Supplies",   rating: 4.5, contact: "order@officedepo.com",   status: "Active" },
  { id: "v3", name: "Apex Logistics Corp",   code: "VND-APX-03", category: "Logistics",         rating: 4.2, contact: "contact@apexlog.com",     status: "Active" },
  { id: "v4", name: "Prime Builders Ltd",    code: "VND-PRM-04", category: "Facilities",        rating: 3.9, contact: "info@primebuilders.com",   status: "Active" },
];

const SEED_DEPARTMENTS = ["IT & Systems", "Operations", "Finance", "Human Resources", "Marketing", "Procurement"];

const SEED_PR: PurchaseRequest[] = [
  {
    id: "PR-2026-001",
    title: "MacBook Pro M3 upgrade for development team",
    department: "IT & Systems",
    priority: "High",
    purpose: "Replacing laptops for the three senior engineers whose devices are off-warranty.",
    status: "Completed",
    creator: { name: "Alex Employee", email: "employee@corp.com" },
    items: [{ id: "item1", name: "MacBook Pro 16\" (32GB RAM, 1TB SSD)", quantity: 3, unit: "Units", price: 2800 }],
    attachments: ["hardware_spec_2026.pdf"],
    createdAt: "2026-05-10T09:30:00Z",
    updatedAt: "2026-05-14T14:20:00Z",
    approverComments: "Approved for the development budget.",
    poNumber: "PO-2026-8801",
    poReleasedAt: "2026-05-14T14:20:00Z",
    vendorId: "v1",
  },
  {
    id: "PR-2026-002",
    title: "Q2 Office Supplies & Paper Stocks",
    department: "Human Resources",
    priority: "Medium",
    purpose: "Standard restocking of printing paper, notebooks, and writing materials.",
    status: "Waiting Approval",
    creator: { name: "Alex Employee", email: "employee@corp.com" },
    items: [
      { id: "item2", name: "A4 Printing Paper Boxes",       quantity: 20, unit: "Boxes", price: 35 },
      { id: "item3", name: "Premium Notebook Set (10-pack)", quantity: 5,  unit: "Packs", price: 45 },
    ],
    attachments: [],
    createdAt: "2026-05-24T11:00:00Z",
    updatedAt: "2026-05-24T11:00:00Z",
  },
  {
    id: "PR-2026-003",
    title: "Server Rack UPS Battery Replacement",
    department: "IT & Systems",
    priority: "Urgent",
    purpose: "The current battery in server rack B is degraded and failing self-test. Immediate hazard.",
    status: "Approved",
    creator: { name: "Alex Employee", email: "employee@corp.com" },
    items: [{ id: "item4", name: "APC Smart-UPS SRT 3000VA Battery Pack", quantity: 1, unit: "Unit", price: 1200 }],
    attachments: ["battery_failure_log.png"],
    createdAt: "2026-05-26T16:45:00Z",
    updatedAt: "2026-05-27T08:15:00Z",
    approverComments: "Approved immediately due to critical downtime risk.",
  },
  {
    id: "PR-2026-004",
    title: "Ergonomic Chairs for Operations Room",
    department: "Operations",
    priority: "Low",
    purpose: "Replacing outdated seating in the customer support bullpen.",
    status: "Rejected",
    creator: { name: "Alex Employee", email: "employee@corp.com" },
    items: [{ id: "item5", name: "Steelcase Gesture Ergonomic Chair", quantity: 5, unit: "Units", price: 950 }],
    attachments: ["chair_quotes.pdf"],
    createdAt: "2026-05-18T10:00:00Z",
    updatedAt: "2026-05-19T11:30:00Z",
    approverComments: "Budget for facilities is currently frozen. Re-submit in Q3.",
  },
];

const SEED_NOTIFICATIONS: Notification[] = [
  { id: "n1", userId: "approver@corp.com",  title: "New PR Submitted",       message: "PR-2026-002 'Q2 Office Supplies & Paper Stocks' requires your approval.",                                          read: false, createdAt: "2026-05-24T11:00:00Z" },
  { id: "n2", userId: "employee@corp.com",  title: "PR Approved",            message: "PR-2026-003 'Server Rack UPS Battery Replacement' has been approved by Sarah Approver.",                            read: false, createdAt: "2026-05-27T08:15:00Z" },
  { id: "n3", userId: "purchasing@corp.com",title: "PR Pending PO Release",  message: "PR-2026-003 has been approved and is ready for Purchase Order creation.",                                          read: false, createdAt: "2026-05-27T08:15:00Z" },
];

const SEED_LOGS: ActivityLog[] = [
  { id: "log1", userId: "1", userName: "Alex Employee",    userRole: "Employee",  action: "PR Created",   details: "Created Draft PR for MacBook Pro upgrade",                            ip: "192.168.1.45", createdAt: "2026-05-10T09:20:00Z" },
  { id: "log2", userId: "1", userName: "Alex Employee",    userRole: "Employee",  action: "PR Submitted",  details: "Submitted PR-2026-001 for approval",                                  ip: "192.168.1.45", createdAt: "2026-05-10T09:30:00Z" },
  { id: "log3", userId: "2", userName: "Sarah Approver",   userRole: "Approver",  action: "PR Approved",   details: "Approved PR-2026-001",                                                ip: "192.168.1.12", createdAt: "2026-05-12T10:15:00Z" },
  { id: "log4", userId: "3", userName: "David Purchasing", userRole: "Purchasing",action: "PO Released",   details: "Released PO-2026-8801 for PR-2026-001 (Global Tech Solutions)",        ip: "192.168.1.18", createdAt: "2026-05-14T14:20:00Z" },
];

// ─── Context Type ─────────────────────────────────────────────
interface ProcurementContextType {
  currentUser: User | null;
  users: User[];
  purchaseRequests: PurchaseRequest[];
  vendors: Vendor[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  departments: string[];
  addDepartment: (dept: string) => void;
  removeDepartment: (dept: string) => void;
  // Auth
  login: (email: string, role: Role) => boolean;
  logout: () => void;
  // Requisitions
  createPR: (pr: Omit<PurchaseRequest, "id" | "creator" | "createdAt" | "updatedAt" | "status">, isSubmit: boolean) => void;
  updatePRStatus: (id: string, status: PRStatus, comments?: string) => void;
  releasePO: (prId: string, vendorId: string) => void;
  // Notifications
  addNotification: (userId: string, title: string, message: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  // User management
  addUser: (user: Omit<User, "id">) => void;
  updateUser: (id: string, updated: Partial<User>) => void;
  // Vendor management
  addVendor: (vendor: Omit<Vendor, "id">) => void;
  updateVendor: (id: string, updated: Partial<Vendor>) => void;
  // Audit
  addActivityLog: (action: string, details: string) => void;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

// ─── Helper: load from storage with fallback ─────────────────
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ─── Provider ────────────────────────────────────────────────
export const ProcurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser,     setCurrentUser]     = useState<User | null>(() => loadFromStorage(STORAGE_KEYS.CURRENT_USER, null));
  const [users,           setUsers]           = useState<User[]>(() => loadFromStorage(STORAGE_KEYS.DB_USERS, SEED_USERS));
  const [purchaseRequests,setPurchaseRequests]= useState<PurchaseRequest[]>(() => loadFromStorage(STORAGE_KEYS.DB_PR, SEED_PR));
  const [vendors,         setVendors]         = useState<Vendor[]>(() => loadFromStorage(STORAGE_KEYS.DB_VENDORS, SEED_VENDORS));
  const [notifications,   setNotifications]   = useState<Notification[]>(() => loadFromStorage(STORAGE_KEYS.DB_NOTIFICATIONS, SEED_NOTIFICATIONS));
  const [activityLogs,    setActivityLogs]    = useState<ActivityLog[]>(() => loadFromStorage(STORAGE_KEYS.DB_LOGS, SEED_LOGS));
  const [departments,     setDepartments]     = useState<string[]>(() => loadFromStorage("procurement-db-departments", SEED_DEPARTMENTS));

  // ─── Sync to LocalStorage ─────────────────────────────────
  useEffect(() => { localStorage.setItem("procurement-db-departments", JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DB_USERS,         JSON.stringify(users));           }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DB_PR,            JSON.stringify(purchaseRequests));}, [purchaseRequests]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DB_VENDORS,       JSON.stringify(vendors));         }, [vendors]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DB_NOTIFICATIONS, JSON.stringify(notifications));   }, [notifications]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DB_LOGS,          JSON.stringify(activityLogs));    }, [activityLogs]);

  // ─── Audit helpers ────────────────────────────────────────
  const writeAuditLog = (uId: string, name: string, role: string, action: string, details: string) => {
    const log: ActivityLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: uId, userName: name, userRole: role, action, details,
      ip: `192.168.1.${Math.floor(Math.random() * 254 + 1)}`,
      createdAt: new Date().toISOString(),
    };
    setActivityLogs(prev => [log, ...prev]);
  };

  const addActivityLog = (action: string, details: string) => {
    if (!currentUser) return;
    writeAuditLog(currentUser.id, currentUser.name, currentUser.role, action, details);
  };

  // ─── Auth ────────────────────────────────────────────────
  const login = (email: string, selectedRole: Role): boolean => {
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.status === "Active");
    if (!matched) return false;
    const activeUser = { ...matched, role: selectedRole };
    setCurrentUser(activeUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(activeUser));
    writeAuditLog(activeUser.id, activeUser.name, activeUser.role, "User Login", `Logged in as ${activeUser.role}`);
    return true;
  };

  const logout = () => {
    if (currentUser) {
      writeAuditLog(currentUser.id, currentUser.name, currentUser.role, "User Logout", "Logged out of session");
    }
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  // ─── Notifications ───────────────────────────────────────
  const addNotification = (userId: string, title: string, message: string) => {
    const notif: Notification = {
      id: `NOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId, title, message, read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev =>
      prev.map(n => (n.userId === currentUser.email || n.userId === "all") ? { ...n, read: true } : n)
    );
  };

  // ─── Requisitions ────────────────────────────────────────
  const createPR = (
    prData: Omit<PurchaseRequest, "id" | "creator" | "createdAt" | "updatedAt" | "status">,
    isSubmit: boolean
  ) => {
    if (!currentUser) return;
    const prId = `PR-2026-${String(purchaseRequests.length + 1).padStart(3, "0")}`;
    const status: PRStatus = isSubmit ? "Waiting Approval" : "Draft";
    const newPR: PurchaseRequest = {
      ...prData, id: prId, status,
      creator: { name: currentUser.name, email: currentUser.email },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPurchaseRequests(prev => [newPR, ...prev]);
    writeAuditLog(currentUser.id, currentUser.name, currentUser.role,
      isSubmit ? "PR Submitted" : "PR Draft Created",
      `${isSubmit ? "Submitted" : "Created draft for"} Purchase Requisition: ${prId}`
    );
    if (isSubmit) {
      addNotification("approver@corp.com", "New Requisition Submitted",
        `${prId} '${newPR.title}' created by ${currentUser.name} is waiting for your review.`
      );
    }
  };

  const updatePRStatus = (id: string, status: PRStatus, comments?: string) => {
    if (!currentUser) return;
    setPurchaseRequests(prev =>
      prev.map(pr => {
        if (pr.id !== id) return pr;
        const updated = {
          ...pr, status,
          approverComments: comments !== undefined ? comments : pr.approverComments,
          updatedAt: new Date().toISOString(),
        };
        writeAuditLog(currentUser.id, currentUser.name, currentUser.role,
          `PR ${status}`, `Status updated to ${status} for ${id}. Comments: ${comments || "None"}`
        );
        if (status === "Approved") {
          addNotification(pr.creator.email, "Requisition Approved", `Your Requisition ${id} has been approved by ${currentUser.name}.`);
          addNotification("purchasing@corp.com", "Requisition Pending PO", `Requisition ${id} has been approved and is ready for PO creation.`);
        } else if (status === "Rejected") {
          addNotification(pr.creator.email, "Requisition Rejected", `Your Requisition ${id} was rejected by ${currentUser.name}. Reason: ${comments}`);
        }
        return updated;
      })
    );
  };

  const releasePO = (prId: string, vendorId: string) => {
    if (!currentUser) return;
    const poNum = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const vendor = vendors.find(v => v.id === vendorId);
    setPurchaseRequests(prev =>
      prev.map(pr => {
        if (pr.id !== prId) return pr;
        const updated = { ...pr, status: "PO Released" as PRStatus, poNumber: poNum, poReleasedAt: new Date().toISOString(), vendorId, updatedAt: new Date().toISOString() };
        writeAuditLog(currentUser.id, currentUser.name, currentUser.role, "PO Released",
          `Released PO ${poNum} for ${prId} with vendor ${vendor?.name || vendorId}`
        );
        addNotification(pr.creator.email, "Purchase Order Released",
          `Purchase Order ${poNum} has been released to the vendor for your requisition ${prId}.`
        );
        return updated;
      })
    );
  };

  // ─── Department Management ───────────────────────────────
  const addDepartment = (dept: string) => {
    setDepartments(prev => [...prev, dept]);
    addActivityLog("Add Department", `Added department ${dept}`);
  };

  const removeDepartment = (dept: string) => {
    setDepartments(prev => prev.filter(d => d !== dept));
    addActivityLog("Remove Department", `Removed department ${dept}`);
  };

  // ─── User Management ─────────────────────────────────────
  const addUser = (userData: Omit<User, "id">) => {
    if (!currentUser) return;
    const newUser: User = { ...userData, id: String(users.length + 1) };
    setUsers(prev => [...prev, newUser]);
    writeAuditLog(currentUser.id, currentUser.name, currentUser.role, "User Added", `Created user: ${userData.name} (${userData.email})`);
  };

  const updateUser = (id: string, updated: Partial<User>) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
    const u = users.find(u => u.id === id);
    writeAuditLog(currentUser.id, currentUser.name, currentUser.role, "User Updated", `Updated details for ${u?.name || id}`);
  };

  // ─── Vendor Management ───────────────────────────────────
  const addVendor = (vendorData: Omit<Vendor, "id">) => {
    if (!currentUser) return;
    const newVendor: Vendor = { ...vendorData, id: `v${vendors.length + 1}` };
    setVendors(prev => [...prev, newVendor]);
    writeAuditLog(currentUser.id, currentUser.name, currentUser.role, "Vendor Added", `Added vendor: ${vendorData.name}`);
  };

  const updateVendor = (id: string, updated: Partial<Vendor>) => {
    if (!currentUser) return;
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updated } : v));
    const v = vendors.find(v => v.id === id);
    writeAuditLog(currentUser.id, currentUser.name, currentUser.role, "Vendor Updated", `Updated vendor: ${v?.name || id}`);
  };

  return (
    <ProcurementContext.Provider value={{
      currentUser, users, purchaseRequests, vendors, notifications, activityLogs, departments,
      login, logout, createPR, updatePRStatus, releasePO,
      addNotification, markNotificationAsRead, markAllNotificationsAsRead,
      addUser, updateUser, addVendor, updateVendor, addActivityLog,
      addDepartment, removeDepartment,
    }}>
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = (): ProcurementContextType => {
  const context = useContext(ProcurementContext);
  if (!context) throw new Error("useProcurement must be used within a ProcurementProvider");
  return context;
};
