// ============================================================
// REUSABLE: NotificationPanel
// Dropdown notification list used in the top Navbar
// ============================================================

import React from "react";
import type { Notification } from "../../types";
import { formatTime } from "../../utils";
import { useLanguage } from "../../contexts";

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  unreadCount,
  onMarkAllRead,
  onMarkRead,
  onClose,
}) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 max-h-[30rem] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-sidebar/30 shrink-0">
          <h3 className="font-semibold text-sm text-foreground">
            {t("common.notifications")}
            {unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-destructive text-destructive-foreground rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-primary hover:underline font-medium"
            >
              {t("common.mark_all_read")}
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {t("common.no_notifications")}
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => onMarkRead(notif.id)}
                className={`p-4 hover:bg-muted/30 cursor-pointer transition-colors ${
                  !notif.read ? "bg-primary/5 border-l-2 border-primary" : ""
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-xs font-semibold text-foreground leading-snug">{notif.title}</h4>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatTime(notif.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
