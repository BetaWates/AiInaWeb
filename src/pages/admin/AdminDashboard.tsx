import React from "react";
import { Link } from "react-router-dom";
import { useProcurement } from "../../contexts";
import { useLanguage  } from "../../contexts";
import { 
  Users, 
  ShieldAlert, 
  Database, 
  Activity, 
  ArrowRight,
  UserCheck,
  Globe,
  Settings
} from "lucide-react";

export function AdminDashboard() {
  const { users, activityLogs, vendors, departments } = useProcurement();
  const { t } = useLanguage();

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "Active").length;
  const totalLogs = activityLogs.length;

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h2 className="text-xl font-bold text-foreground">{t("admin.dashboard")}</h2>
        <p className="text-xs text-muted-foreground mt-1">Manage system configurations, roles, users, and audit logs.</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-primary/40 transition-colors">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{totalUsers}</h3>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-emerald-500/40 transition-colors">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Users</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{activeUsers}</h3>
          </div>
        </div>

        {/* Departments Count */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-blue-500/40 transition-colors">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Departments</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{departments.length}</h3>
          </div>
        </div>

        {/* Audit items */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-amber-500/40 transition-colors">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Audit Items</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{totalLogs}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick link actions */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Admin Actions Quicklinks</h3>
          
          <div className="space-y-2">
            <Link to="/admin/users" className="flex items-center justify-between p-3 bg-muted/40 hover:bg-muted/70 rounded-xl border border-border transition-colors">
              <span className="text-xs font-semibold text-foreground">User Management</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/admin/roles" className="flex items-center justify-between p-3 bg-muted/40 hover:bg-muted/70 rounded-xl border border-border transition-colors">
              <span className="text-xs font-semibold text-foreground">Role Permissions</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/admin/master-data" className="flex items-center justify-between p-3 bg-muted/40 hover:bg-muted/70 rounded-xl border border-border transition-colors">
              <span className="text-xs font-semibold text-foreground">Master Data</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/admin/audit-log" className="flex items-center justify-between p-3 bg-muted/40 hover:bg-muted/70 rounded-xl border border-border transition-colors">
              <span className="text-xs font-semibold text-foreground">System Audit Logs</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Audit overview log */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center bg-sidebar/20">
            <h3 className="font-bold text-foreground text-sm">Recent Audit Log Activities</h3>
            <Link to="/admin/audit-log" className="text-xs text-primary hover:underline flex items-center gap-1">
              <span>View Full Log</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="overflow-y-auto max-h-[300px] divide-y divide-border">
            {activityLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="p-4 hover:bg-muted/20 transition-colors flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{log.action}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.25 bg-muted text-muted-foreground border border-border/80 rounded-full">
                      {log.userRole}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{log.details}</p>
                  <p className="text-[10px] text-muted-foreground/60">By {log.userName} • IP: {log.ip}</p>
                </div>
                
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(log.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {activityLogs.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No activity logs recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
