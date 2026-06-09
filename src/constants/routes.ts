// ============================================================
// ROUTE CONSTANTS
// Centralized path definitions — no hardcoded strings in components
// ============================================================

export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",

  // Employee
  EMPLOYEE: {
    ROOT: "/employee",
    DASHBOARD: "/employee/dashboard",
    CREATE_PR: "/employee/create-pr",
    MY_PR: "/employee/my-pr",
    PR_TRACKING: "/employee/pr-tracking",
    UPLOAD_PR: "/employee/upload-pr",
    SETTINGS: "/employee/settings",
  },

  // Approver
  APPROVER: {
    ROOT: "/approver",
    DASHBOARD: "/approver/dashboard",
    PENDING_APPROVAL: "/approver/pending-approval",
    HISTORY: "/approver/history",
    SETTINGS: "/approver/settings",
  },

  // Purchasing
  PURCHASING: {
    ROOT: "/purchasing",
    DASHBOARD: "/purchasing/dashboard",
    ALL_PR: "/purchasing/all-pr",
    RELEASE_PO: "/purchasing/release-po",
    VENDORS: "/purchasing/vendors",
    REPORTS: "/purchasing/reports",
    SETTINGS: "/purchasing/settings",
  },

  // Admin
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    ROLES: "/admin/roles",
    MASTER_DATA: "/admin/master-data",
    AUDIT_LOG: "/admin/audit-log",
    SETTINGS: "/admin/settings",
  },
} as const;

// Role-based default redirect map
export const ROLE_DEFAULT_ROUTES: Record<string, string> = {
  Employee: ROUTES.EMPLOYEE.DASHBOARD,
  Approver: ROUTES.APPROVER.DASHBOARD,
  Purchasing: ROUTES.PURCHASING.DASHBOARD,
  Admin: ROUTES.ADMIN.DASHBOARD,
};
