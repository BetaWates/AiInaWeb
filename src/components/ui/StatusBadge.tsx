// ============================================================
// REUSABLE: StatusBadge
// Renders color-coded PR status pill
// ============================================================

import React from "react";
import type { PRStatus } from "../../types";
import { getStatusColor } from "../../utils";

interface StatusBadgeProps {
  status: PRStatus | string;
  size?: "sm" | "md";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "sm",
  className = "",
}) => {
  const base =
    size === "sm"
      ? "px-2 py-0.5 text-[10px] font-bold"
      : "px-3 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${base} ${getStatusColor(
        status as PRStatus
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      {status}
    </span>
  );
};
