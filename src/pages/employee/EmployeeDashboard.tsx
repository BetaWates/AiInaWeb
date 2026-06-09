import React from "react";
import { Link } from "react-router-dom";
import { useProcurement } from "../../contexts";
import { useLanguage  } from "../../contexts";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { Button } from "../../components/ui/button";

export function EmployeeDashboard() {
  const { purchaseRequests, currentUser, activityLogs } = useProcurement();
  const { t } = useLanguage();

  // Filter PRs for current employee
  const myPRs = purchaseRequests.filter(pr => pr.creator.email === currentUser?.email);
  
  const waitingApproval = myPRs.filter(pr => pr.status === "Waiting Approval");
  const approved = myPRs.filter(pr => pr.status === "Approved" || pr.status === "PO Released" || pr.status === "Completed");
  const rejected = myPRs.filter(pr => pr.status === "Rejected");

  // Recent activity logs filtered for this employee
  const myLogs = activityLogs
    .filter(log => log.userId === currentUser?.id)
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-muted text-muted-foreground border-muted-foreground/30";
      case "Waiting Approval":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "Approved":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "Rejected":
        return "bg-rose-500/10 text-rose-500 border-rose-500/30";
      case "PO Released":
      case "Completed":
        return "bg-primary/10 text-primary border-primary/30";
      default:
        return "bg-muted text-muted-foreground border-muted-foreground/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {t("employee.dashboard")}
          </h2>
          <p className="text-sm text-muted-foreground">
            Welcome back, {currentUser?.name}. Manage and track your purchase requisitions here.
          </p>
        </div>
        <Link to="/employee/create-pr">
          <Button className="flex items-center gap-2 cursor-pointer shadow-md">
            <Plus className="w-4 h-4" />
            <span>{t("employee.quick_create")}</span>
          </Button>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total PRs */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-primary/45 transition-colors">
          <div className="p-3 bg-muted rounded-xl text-foreground">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("employee.my_pr")}</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{myPRs.length}</h3>
          </div>
        </div>

        {/* Waiting Approval */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-amber-500/45 transition-colors">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("employee.waiting_approval")}</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{waitingApproval.length}</h3>
          </div>
        </div>

        {/* Approved PRs */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-emerald-500/45 transition-colors">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("employee.approved_pr")}</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{approved.length}</h3>
          </div>
        </div>

        {/* Rejected PRs */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-rose-500/45 transition-colors">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("employee.rejected_pr")}</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{rejected.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requisitions (Heavy List/Table - Left 2 Columns) */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center bg-sidebar/20">
            <h3 className="font-bold text-foreground text-sm">Recent Requisitions</h3>
            <Link to="/employee/my-pr" className="text-xs text-primary hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {/* Desktop Table View */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-sidebar/10">
                  <th className="py-3 px-5">{t("common.id")}</th>
                  <th className="py-3 px-5">Requisition Title</th>
                  <th className="py-3 px-5">{t("common.status")}</th>
                  <th className="py-3 px-5">{t("common.total")}</th>
                  <th className="py-3 px-5">{t("common.date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {myPRs.slice(0, 5).map((pr) => {
                  const total = pr.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
                  return (
                    <tr key={pr.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-foreground">{pr.id}</td>
                      <td className="py-3.5 px-5 truncate max-w-[200px] text-foreground">{pr.title}</td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(pr.status)}`}>
                          {pr.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-medium text-foreground">${total.toLocaleString()}</td>
                      <td className="py-3.5 px-5 text-muted-foreground text-xs">
                        {new Date(pr.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
                {myPRs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                      No purchase requisitions found. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile Cards List View */}
            <div className="md:hidden divide-y divide-border">
              {myPRs.slice(0, 5).map((pr) => {
                const total = pr.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
                return (
                  <div key={pr.id} className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">{pr.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(pr.status)}`}>
                        {pr.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-foreground line-clamp-1">{pr.title}</h4>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Total: <strong className="text-foreground">${total.toLocaleString()}</strong></span>
                      <span>{new Date(pr.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
              {myPRs.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No purchase requisitions found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Log & Notification Area (Right 1 Column) */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border bg-sidebar/20">
            <h3 className="font-bold text-foreground text-sm">{t("employee.recent_activity")}</h3>
          </div>
          <div className="flex-1 p-5 space-y-4">
            {myLogs.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No recent activity logged
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-y-1 before:left-3.5 before:w-[1px] before:bg-border">
                {myLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 items-start relative text-xs">
                    <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 z-10 text-foreground">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-bold text-foreground">{log.action}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-normal line-clamp-2">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
