import React, { useState } from "react";
import { useProcurement } from "../../contexts";
import { useLanguage  } from "../../contexts";
import { Search, Filter, Calendar, Activity, Download } from "lucide-react";
import { Button } from "../../components/ui/button";

export function AuditLog() {
  const { activityLogs } = useProcurement();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  // Get unique actions
  const uniqueActions = Array.from(new Set(activityLogs.map((l) => l.action)));

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.ip.includes(searchTerm);
    const matchesAction = actionFilter === "All" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExport = () => {
    alert("Exporting audit log database trace as CSV...");
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t("admin.audit_log")}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            System-wide transaction and operational trace logs. Immutable historical records.
          </p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2 cursor-pointer shadow-md">
          <Download className="w-4 h-4" />
          <span>Export Trace Log</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row gap-4 bg-background/50">
        {/* Search */}
        <div className="flex-1 flex items-center bg-background border border-border rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-150">
          <Search className="w-4 h-4 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search by actor name, details description, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/60 w-full"
          />
        </div>

        {/* Action Type */}
        <div className="flex items-center bg-background border border-border rounded-lg px-3 py-2 min-w-[180px]">
          <Filter className="w-3.5 h-3.5 text-muted-foreground mr-2" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-semibold text-foreground w-full cursor-pointer"
          >
            <option value="All">All Event Types</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Log list */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-sidebar/30">
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Event Action</th>
                <th className="py-3 px-6">Details / Description</th>
                <th className="py-3 px-6">Actor Name</th>
                <th className="py-3 px-6">User Role</th>
                <th className="py-3 px-6">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                  <td className="py-4 px-6 text-muted-foreground whitespace-nowrap font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/75" />
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <Activity className="w-3.5 h-3.5 text-primary/75" />
                      <span>{log.action}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-muted-foreground leading-relaxed">{log.details}</td>
                  <td className="py-4 px-6 font-semibold">{log.userName}</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded-full bg-muted border border-border text-[10px] font-bold">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-muted-foreground">{log.ip}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No matching transaction logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
