// ============================================================
// REUSABLE: AppSidebar
// Role-aware sidebar — collapses on mobile, static on desktop
// ============================================================

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { X, LogOut } from "lucide-react";
import {
  LayoutDashboard, FileText, PlusCircle, TrendingUp, FileDown,
  Settings, Truck, Users, History, CheckCircle, ShieldAlert,
  Database,
} from "lucide-react";

import type { Role } from "../../types";
import { SIDEBAR_NAV } from "../../constants";
import { useProcurement } from "../../contexts";
import { useLanguage } from "../../contexts";
import { APP_NAME } from "../../constants";
import logo from "../../logo.png";

// Icon resolver — keeps nav config serializable (no JSX in constants)
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, FileText, PlusCircle, TrendingUp, FileDown,
  Settings, Truck, Users, History, CheckCircle, ShieldAlert, Database,
};

interface AppSidebarProps {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ role, isOpen, onClose, onLogout }) => {
  const location = useLocation();
  const { currentUser } = useProcurement();
  const { t } = useLanguage();

  const navItems = SIDEBAR_NAV[role];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-border flex flex-col
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:w-64 lg:shrink-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border shrink-0">
          <Link
            to={`/${role.toLowerCase()}/dashboard`}
            className="flex items-center gap-2.5 text-foreground"
            onClick={onClose}
          >
            <img
              src={logo}
              alt="AIINA Logo"
              className="h-8 w-auto object-contain select-none"
            />
            <span className="font-bold text-base tracking-tight">{APP_NAME}</span>
          </Link>
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground p-1 rounded"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User capsule */}
        <div className="px-5 py-4 border-b border-border bg-sidebar/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-md shrink-0">
              {currentUser?.name.charAt(0) ?? "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate text-foreground">
                {currentUser?.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {t(`role.${role.toLowerCase()}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = ICON_MAP[item.iconName] ?? LayoutDashboard;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span>{t(item.nameKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border shrink-0">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>{t("common.logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
