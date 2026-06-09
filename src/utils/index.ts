// ============================================================
// UTILITY FUNCTIONS
// Pure helpers — no side effects, no imports from app layer
// ============================================================

import type { PRStatus, PRPriority } from "../types";

// ─── Currency ────────────────────────────────────────────────
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Date ────────────────────────────────────────────────────
export function formatDate(isoString: string, locale = "en-US"): string {
  return new Date(isoString).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(isoString: string, locale = "en-US"): string {
  return new Date(isoString).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function timeAgo(isoString: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60)   return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400)return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ─── PR Helpers ──────────────────────────────────────────────
export function calcPRTotal(items: { quantity: number; price: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

export function getStatusColor(status: PRStatus): string {
  const map: Record<PRStatus, string> = {
    "Draft":           "bg-muted text-muted-foreground border-muted-foreground/30",
    "Waiting Approval":"bg-amber-500/10 text-amber-500 border-amber-500/30",
    "In Review":       "bg-blue-500/10 text-blue-500 border-blue-500/30",
    "Approved":        "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    "Rejected":        "bg-rose-500/10 text-rose-500 border-rose-500/30",
    "PO Released":     "bg-primary/10 text-primary border-primary/30",
    "Completed":       "bg-emerald-700/10 text-emerald-700 border-emerald-700/30",
  };
  return map[status] ?? "bg-muted text-muted-foreground border-muted-foreground/30";
}

export function getPriorityColor(priority: PRPriority): string {
  const map: Record<PRPriority, string> = {
    "Low":    "bg-slate-500/10 text-slate-500 border-slate-500/30",
    "Medium": "bg-amber-500/10 text-amber-500 border-amber-500/30",
    "High":   "bg-orange-500/10 text-orange-500 border-orange-500/30",
    "Urgent": "bg-rose-500/10 text-rose-500 border-rose-500/30",
  };
  return map[priority] ?? "bg-muted text-muted-foreground border-muted-foreground/30";
}

// ─── String ──────────────────────────────────────────────────
export function truncate(str: string, length = 50): string {
  return str.length > length ? `${str.slice(0, length)}…` : str;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── ID Generation ───────────────────────────────────────────
export function generateId(prefix = "ID"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// ─── Class Merging ───────────────────────────────────────────
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
