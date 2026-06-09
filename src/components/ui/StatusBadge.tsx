// ============================================================
// REUSABLE: StatusBadge
// Renders color-coded PR status pill
// ============================================================

import React from "react";
import type { PRStatus } from "../../types";
import { getStatusColor } from "../../utils";

interface StatusBadgeProps {
  status: PRStatus;
  size?: "sm" | "md";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "sm", className = "" }) => {
  const base = size === "sm"
    ? "px-2 py-0.5 text-[10px] font-bold"
    : "px-3 py-1 text-xs font-semibold";

  return (
    <span className={`inline-flex items-center rounded-full border ${base} ${getStatusColor(status)} ${className}`}>
      {status}
    </span>
  );
};
