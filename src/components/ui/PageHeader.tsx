// ============================================================
// REUSABLE: PageHeader
// Consistent page header with title, subtitle, and actions slot
// ============================================================

import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  className = "",
}) => (
  <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-5 rounded-2xl border border-border shadow-sm ${className}`}>
    <div>
      <h2 className="text-lg font-bold text-foreground tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);
