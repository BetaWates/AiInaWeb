// ============================================================
// REUSABLE: StatCard
// KPI metric card used across all dashboards
// ============================================================

import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  hoverBorder?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconBg = "bg-muted text-foreground",
  hoverBorder = "hover:border-primary/40",
  className = "",
}) => (
  <div className={`bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-colors ${hoverBorder} ${className}`}>
    <div className={`p-3 rounded-xl shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
        {label}
      </p>
      <h3 className="text-2xl font-bold mt-0.5 text-foreground">{value}</h3>
    </div>
  </div>
);
