// ============================================================
// REUSABLE: PriorityBadge
// Renders color-coded PR priority pill
// ============================================================

import React from "react";
import type { PRPriority } from "../../types";
import { getPriorityColor } from "../../utils";

interface PriorityBadgeProps {
  priority: PRPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = "" }) => (
  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${getPriorityColor(priority)} ${className}`}>
    {priority}
  </span>
);
