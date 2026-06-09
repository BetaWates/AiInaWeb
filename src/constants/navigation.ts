// ============================================================
// NAVIGATION CONSTANTS
// Role-based sidebar nav items (icon imports happen in layout)
// ============================================================

import type { Role } from "../types";
import { ROUTES } from "./routes";

// Navigation item structure (icon is string key, resolved in layout)
export interface NavItemDef {
  nameKey: string;
  path: string;
  iconName: string;
}

export const SIDEBAR_NAV: Record<Role, NavItemDef[]> = {
  Employee: [
    { nameKey: "common.dashboard",      path: ROUTES.EMPLOYEE.DASHBOARD,   iconName: "LayoutDashboard" },
    { nameKey: "employee.create_pr",    path: ROUTES.EMPLOYEE.CREATE_PR,   iconName: "PlusCircle" },
    { nameKey: "employee.my_pr",        path: ROUTES.EMPLOYEE.MY_PR,       iconName: "FileText" },
    { nameKey: "employee.pr_tracking",  path: ROUTES.EMPLOYEE.PR_TRACKING, iconName: "TrendingUp" },
    { nameKey: "employee.upload_pr",    path: ROUTES.EMPLOYEE.UPLOAD_PR,   iconName: "FileDown" },
    { nameKey: "common.settings",       path: ROUTES.EMPLOYEE.SETTINGS,    iconName: "Settings" },
  ],
  Purchasing: [
    { nameKey: "common.dashboard",        path: ROUTES.PURCHASING.DASHBOARD, iconName: "LayoutDashboard" },
    { nameKey: "purchasing.all_pr",       path: ROUTES.PURCHASING.ALL_PR,    iconName: "FileText" },
    { nameKey: "purchasing.release_po",   path: ROUTES.PURCHASING.RELEASE_PO, iconName: "Truck" },
    { nameKey: "purchasing.vendors",      path: ROUTES.PURCHASING.VENDORS,   iconName: "Users" },
    { nameKey: "purchasing.reports",      path: ROUTES.PURCHASING.REPORTS,   iconName: "TrendingUp" },
    { nameKey: "common.settings",         path: ROUTES.PURCHASING.SETTINGS,  iconName: "Settings" },
  ],
  Approver: [
    { nameKey: "common.dashboard",   path: ROUTES.APPROVER.DASHBOARD,       iconName: "LayoutDashboard" },
    { nameKey: "approver.pending",   path: ROUTES.APPROVER.PENDING_APPROVAL, iconName: "CheckCircle" },
    { nameKey: "approver.history",   path: ROUTES.APPROVER.HISTORY,          iconName: "History" },
    { nameKey: "common.settings",    path: ROUTES.APPROVER.SETTINGS,         iconName: "Settings" },
  ],
  Admin: [
    { nameKey: "common.dashboard",    path: ROUTES.ADMIN.DASHBOARD,    iconName: "LayoutDashboard" },
    { nameKey: "admin.users",         path: ROUTES.ADMIN.USERS,        iconName: "Users" },
    { nameKey: "admin.roles",         path: ROUTES.ADMIN.ROLES,        iconName: "ShieldAlert" },
    { nameKey: "admin.master_data",   path: ROUTES.ADMIN.MASTER_DATA,  iconName: "Database" },
    { nameKey: "admin.audit_log",     path: ROUTES.ADMIN.AUDIT_LOG,    iconName: "FileText" },
    { nameKey: "common.settings",     path: ROUTES.ADMIN.SETTINGS,     iconName: "Settings" },
  ],
};
