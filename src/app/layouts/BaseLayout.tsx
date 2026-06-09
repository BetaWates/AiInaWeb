// ============================================================
// REUSABLE: BaseLayout
// Composes AppSidebar + AppNavbar + main content area
// Used as the shell for all role-specific layouts
// ============================================================

import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { Role } from "../../types";
import { SIDEBAR_NAV } from "../../constants";
import { useProcurement, useLanguage } from "../../contexts";
import { useDisclosure } from "../../hooks";
import { AppSidebar } from "../../components/layout/AppSidebar";
import { AppNavbar } from "../../components/layout/AppNavbar";

interface BaseLayoutProps {
  role: Role;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ role }) => {
  const sidebar    = useDisclosure();
  const location   = useLocation();
  const navigate   = useNavigate();
  const { t }      = useLanguage();
  const {
    currentUser,
    logout,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useProcurement();

  // ─── User-scoped notifications ───────────────────────────
  const myNotifications = notifications.filter(
    n => n.userId === currentUser?.email || n.userId === "all"
  );

  // ─── Dynamic page title from nav items ───────────────────
  const navItems = SIDEBAR_NAV[role];
  const getPageTitle = (): string => {
    const matched = navItems.find(item => item.path === location.pathname);
    if (matched) return t(matched.nameKey);
    if (location.pathname.endsWith("/settings"))   return t("common.settings");
    if (location.pathname.includes("/create-pr"))  return t("employee.create_pr");
    if (location.pathname.includes("/upload-pr"))  return t("employee.upload_pr");
    return t("common.dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-screen w-full flex bg-background text-foreground transition-colors duration-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <AppSidebar
        role={role}
        isOpen={sidebar.isOpen}
        onClose={sidebar.close}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Navbar */}
        <AppNavbar
          pageTitle={getPageTitle()}
          currentUserInitial={currentUser?.name.charAt(0) ?? "U"}
          notifications={myNotifications}
          onOpenSidebar={sidebar.open}
          onMarkNotifRead={markNotificationAsRead}
          onMarkAllNotifsRead={markAllNotificationsAsRead}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
