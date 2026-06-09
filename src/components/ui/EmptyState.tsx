// ============================================================
// REUSABLE: EmptyState
// Used when lists/tables have no data
// ============================================================

import React from "react";
import { FileX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data found",
  description = "There are no records to display.",
  icon,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
      {icon ?? <FileX className="w-7 h-7" />}
    </div>
    <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);
