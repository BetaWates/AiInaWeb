import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useProcurement } from "../../contexts";
import type { PurchaseRequest } from "../../types";
import { useLanguage  } from "../../contexts";
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Check,
  X,
  FileText
} from "lucide-react";
import { Button } from "../../components/ui/button";

export function ApproverDashboard() {
  const { purchaseRequests, updatePRStatus } = useProcurement();
  const { t } = useLanguage();

  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);
  const [comment, setComment] = useState("");
  const [modalType, setModalType] = useState<"approve" | "reject" | null>(null);

  const pendingPRs = purchaseRequests.filter(pr => pr.status === "Waiting Approval");
  const approvedPRs = purchaseRequests.filter(pr => ["Approved", "PO Released", "Completed"].includes(pr.status));
  const rejectedPRs = purchaseRequests.filter(pr => pr.status === "Rejected");

  const handleAction = () => {
    if (!selectedPR || !modalType) return;
    
    const nextStatus = modalType === "approve" ? "Approved" : "Rejected";
    updatePRStatus(selectedPR.id, nextStatus, comment);

    // Reset state
    setSelectedPR(null);
    setModalType(null);
    setComment("");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low": return "text-muted-foreground";
      case "Medium": return "text-blue-500";
      case "High": return "text-amber-500 font-semibold";
      case "Urgent": return "text-rose-500 font-bold animate-pulse";
      default: return "text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Waiting Approval": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "Approved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "Rejected": return "bg-rose-500/10 text-rose-500 border-rose-500/30";
      default: return "bg-muted text-muted-foreground border-muted-foreground/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Stats */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h2 className="text-xl font-bold text-foreground">{t("approver.dashboard")}</h2>
        <p className="text-xs text-muted-foreground mt-1">Review pending purchase requisitions. Maintain procurement governance.</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending approvals */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-amber-500/40 transition-colors">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("approver.pending")}</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{pendingPRs.length}</h3>
          </div>
        </div>

        {/* Approved PRs */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-emerald-500/40 transition-colors">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approved Requisitions</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{approvedPRs.length}</h3>
          </div>
        </div>

        {/* Rejected PRs */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-rose-500/40 transition-colors">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rejected Requisitions</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{rejectedPRs.length}</h3>
          </div>
        </div>
      </div>

      {/* Quick Approval Queue */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center bg-sidebar/20">
          <h3 className="font-bold text-foreground text-sm">Outstanding Approvals Queue</h3>
          <Link to="/approver/pending-approval" className="text-xs text-primary hover:underline font-semibold">
            View All Pending Requisitions
          </Link>
        </div>

        {/* Pending approvals table */}
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="w-full text-left border-collapse hidden md:table">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-sidebar/10">
                <th className="py-3 px-6">{t("common.id")}</th>
                <th className="py-3 px-6">Requisitioner</th>
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Priority</th>
                <th className="py-3 px-6">{t("common.total")}</th>
                <th className="py-3 px-6">{t("common.date")}</th>
                <th className="py-3 px-6 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {pendingPRs.slice(0, 5).map(pr => {
                const total = pr.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
                return (
                  <tr key={pr.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-foreground">{pr.id}</td>
                    <td className="py-4 px-6 text-foreground">
                      <div className="font-medium">{pr.creator.name}</div>
                      <div className="text-[10px] text-muted-foreground">{pr.department}</div>
                    </td>
                    <td className="py-4 px-6 truncate max-w-[180px] text-foreground font-medium">{pr.title}</td>
                    <td className={`py-4 px-6 text-xs ${getPriorityColor(pr.priority)}`}>{pr.priority}</td>
                    <td className="py-4 px-6 font-bold text-foreground">${total.toLocaleString()}</td>
                    <td className="py-4 px-6 text-muted-foreground text-xs">{new Date(pr.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPR(pr)}
                        className="text-xs h-8 cursor-pointer flex items-center gap-1.5 ml-auto hover:bg-muted"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {pendingPRs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    All requisitions reviewed! Outstanding queue is empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Cards List */}
          <div className="md:hidden divide-y divide-border">
            {pendingPRs.slice(0, 5).map(pr => {
              const total = pr.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
              return (
                <div key={pr.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground text-sm">{pr.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(pr.status)}`}>
                      {pr.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{pr.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">By {pr.creator.name} • {pr.department}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Priority: <strong className={getPriorityColor(pr.priority)}>{pr.priority}</strong></span>
                    <span className="text-muted-foreground">Total: <strong className="text-foreground">${total.toLocaleString()}</strong></span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setSelectedPR(pr)}
                    className="w-full text-xs h-8 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Requisition</span>
                  </Button>
                </div>
              );
            })}
            {pendingPRs.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Outstanding queue is empty.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedPR && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-sidebar/20">
              <div>
                <h3 className="font-bold text-foreground text-lg">Review Requisition {selectedPR.id}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Request originated from {selectedPR.creator.name} ({selectedPR.creator.email})</p>
              </div>
              <button 
                onClick={() => setSelectedPR(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Info panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border border-border">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Title</span>
                  <span className="text-sm font-semibold text-foreground">{selectedPR.title}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Department</span>
                  <span className="text-sm font-semibold text-foreground">{selectedPR.department}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Priority</span>
                  <span className={`text-sm font-bold block ${getPriorityColor(selectedPR.priority)}`}>{selectedPR.priority}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Request Date</span>
                  <span className="text-sm font-semibold text-foreground">{new Date(selectedPR.createdAt).toLocaleString()}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Justification Purpose</span>
                  <p className="text-xs text-foreground/95 leading-relaxed mt-0.5">{selectedPR.purpose || "No comments."}</p>
                </div>
              </div>

              {/* Items List Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground">Items Requested</h4>
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-sidebar/20 text-muted-foreground font-bold">
                        <th className="py-2.5 px-4">Description</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4">Unit</th>
                        <th className="py-2.5 px-4 text-right">Price</th>
                        <th className="py-2.5 px-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-foreground">
                      {selectedPR.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-4 font-medium">{item.name}</td>
                          <td className="py-2.5 px-4 text-center">{item.quantity}</td>
                          <td className="py-2.5 px-4 text-muted-foreground">{item.unit}</td>
                          <td className="py-2.5 px-4 text-right">${item.price.toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-right font-semibold">${(item.quantity * item.price).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-sidebar/10 font-bold border-t border-border">
                        <td colSpan={4} className="py-3 px-4 text-right">Grand Total Value:</td>
                        <td className="py-3 px-4 text-right text-primary">${selectedPR.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Review inputs */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wide">
                  {t("approver.comments")}
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide comments or rejection reason here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-border flex flex-col sm:flex-row sm:justify-between gap-3 bg-sidebar/10">
              <Button 
                variant="outline" 
                onClick={() => setSelectedPR(null)} 
                className="cursor-pointer"
              >
                Close Review
              </Button>
              
              <div className="flex gap-2 w-full sm:w-auto">
                {/* Reject Button */}
                <button
                  type="button"
                  onClick={() => {
                    setModalType("reject");
                    setTimeout(handleAction, 0); // Trigger handle action immediately
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-500 text-white font-semibold text-xs rounded-lg hover:bg-rose-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Reject Requisition</span>
                </button>
                {/* Approve Button */}
                <button
                  type="button"
                  onClick={() => {
                    setModalType("approve");
                    setTimeout(handleAction, 0); // Trigger handle action immediately
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 text-white font-semibold text-xs rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Requisition</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
