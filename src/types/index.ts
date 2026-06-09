// ============================================================
// CORE DOMAIN TYPES
// Enterprise Procurement System - Shared Types
// ============================================================

// ─── Auth & User ────────────────────────────────────────────
export type Role = "Employee" | "Approver" | "Purchasing" | "Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  status: "Active" | "Inactive";
}

// ─── Purchase Requisition ────────────────────────────────────
export interface PRItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export type PRStatus =
  | "Draft"
  | "Waiting Approval"
  | "Approved"
  | "Rejected"
  | "In Review"
  | "PO Released"
  | "Completed";

export type PRPriority = "Low" | "Medium" | "High" | "Urgent";

export interface PurchaseRequest {
  id: string;
  title: string;
  department: string;
  priority: PRPriority;
  purpose: string;
  status: PRStatus;
  creator: {
    name: string;
    email: string;
  };
  items: PRItem[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  approverComments?: string;
  poNumber?: string;
  poReleasedAt?: string;
  vendorId?: string;
}

// ─── Vendor ──────────────────────────────────────────────────
export interface Vendor {
  id: string;
  name: string;
  code: string;
  category: string;
  rating: number;
  contact: string;
  status: "Active" | "Inactive";
}

// ─── Notification ────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string; // Target email or "all"
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ─── Activity Log ────────────────────────────────────────────
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  ip: string;
  createdAt: string;
}

// ─── Navigation ──────────────────────────────────────────────
export interface NavItem {
  nameKey: string;
  path: string;
  icon: React.ComponentType<any>;
}

// ─── Language ────────────────────────────────────────────────
export type Language = "EN" | "ID";

// ─── Theme ───────────────────────────────────────────────────
export type Theme = "light" | "dark";

// ─── API Future-Proofing ─────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

export interface FilterParams {
  status?: string;
  department?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
