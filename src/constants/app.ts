// ============================================================
// APP CONSTANTS
// Application-wide constant values
// ============================================================

export const APP_NAME = "CorpPurchasing";
export const APP_SUBTITLE_KEY = "portal.subtitle";
export const APP_VERSION = "2.0.0";
export const APP_YEAR = "2026";

// LocalStorage keys (centralized — never scattered strings)
export const STORAGE_KEYS = {
  THEME: "preferred-theme",
  LANGUAGE: "preferred-language",
  CURRENT_USER: "procurement-user",
  DB_USERS: "procurement-db-users",
  DB_PR: "procurement-db-pr",
  DB_VENDORS: "procurement-db-vendors",
  DB_NOTIFICATIONS: "procurement-db-notifications",
  DB_LOGS: "procurement-db-logs",
} as const;

// Supported Languages
export const SUPPORTED_LANGUAGES = ["EN", "ID"] as const;

// Default theme
export const DEFAULT_THEME = "dark" as const;

// PR Priority levels
export const PR_PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;

// Departments
export const DEPARTMENTS = [
  "IT & Systems",
  "Operations",
  "Finance",
  "Human Resources",
  "Marketing",
  "Procurement",
] as const;

// PR Status list
export const PR_STATUSES = [
  "Draft",
  "Waiting Approval",
  "Approved",
  "Rejected",
  "In Review",
  "PO Released",
  "Completed",
] as const;
