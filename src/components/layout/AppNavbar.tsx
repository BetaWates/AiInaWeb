// ============================================================
// REUSABLE: AppNavbar
// Top navigation bar with search, theme toggle, lang, notifs
// ============================================================

import React from "react";
import { Menu, Search, Globe, Sun, Moon, Bell } from "lucide-react";
import type { Notification } from "../../types";
import { useTheme } from "../../contexts";
import { useLanguage } from "../../contexts";
import { NotificationPanel } from "../notifications/NotificationPanel";
import { useDisclosure } from "../../hooks";
import logo from "../../logo.png";

interface AppNavbarProps {
  pageTitle: string;
  currentUserInitial: string;
  notifications: Notification[];
  onOpenSidebar: () => void;
  onMarkNotifRead: (id: string) => void;
  onMarkAllNotifsRead: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  pageTitle,
  currentUserInitial,
  notifications,
  onOpenSidebar,
  onMarkNotifRead,
  onMarkAllNotifsRead,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const notifPanel = useDisclosure();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm z-30">
      {/* Left: hamburger + logo + page title */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center">
          <img
            src={logo}
            alt="AIINA Logo"
            className="h-9 w-auto object-contain select-none"
          />
        </div>
        <div className="h-5 w-[1px] bg-border hidden sm:block mx-1" />
        <h1 className="text-base font-bold text-foreground tracking-tight hidden sm:block">
          {pageTitle}
        </h1>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1 lg:gap-3">
        {/* Search — desktop only */}
        <div className="hidden md:flex items-center bg-background border border-border rounded-lg px-3 py-1.5 gap-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-150">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder={t("common.search")}
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/60 w-40 lg:w-52"
          />
        </div>

        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === "EN" ? "ID" : "EN")}
          className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
          title="Change Language"
        >
          <Globe className="w-4 h-4" />
          <span>{language.toUpperCase()}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          title="Toggle Theme"
        >
          {theme === "dark"
            ? <Sun className="w-4 h-4 text-amber-400" />
            : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={notifPanel.toggle}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive text-[10px] font-bold text-destructive-foreground rounded-full flex items-center justify-center ring-2 ring-card">
                {unreadCount}
              </span>
            )}
          </button>

          {notifPanel.isOpen && (
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={onMarkAllNotifsRead}
              onMarkRead={onMarkNotifRead}
              onClose={notifPanel.close}
            />
          )}
        </div>

        {/* Mobile avatar */}
        <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-foreground select-none md:hidden">
          {currentUserInitial}
        </div>
      </div>
    </header>
  );
};
