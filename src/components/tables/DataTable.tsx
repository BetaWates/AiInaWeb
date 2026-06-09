// ============================================================
// REUSABLE: DataTable
// Responsive table — desktop shows table, mobile shows cards
// ============================================================

import React from "react";
import { EmptyState } from "../ui/EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  mobileLabel?: string; // optional label for card view
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  isLoading?: boolean;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyTitle = "No records found",
  emptyDescription = "There are no items to display.",
  isLoading = false,
  className = "",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={className}>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-sidebar/10">
              {columns.map(col => (
                <th key={col.key} className="py-3 px-5 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {data.map(row => (
              <tr key={keyExtractor(row)} className="hover:bg-muted/30 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="py-3.5 px-5">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden divide-y divide-border">
        {data.map(row => (
          <div key={keyExtractor(row)} className="p-4 space-y-2">
            {columns
              .filter(col => !col.hideOnMobile)
              .map(col => (
                <div key={col.key} className="flex justify-between items-center gap-2 text-sm">
                  {col.mobileLabel && (
                    <span className="text-xs text-muted-foreground font-semibold shrink-0">
                      {col.mobileLabel}
                    </span>
                  )}
                  <span className="text-right">{col.render(row)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
