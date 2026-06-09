import React, { useState } from "react";
import { useProcurement } from "../../contexts";
import type { PurchaseRequest } from "../../types";
import { useLanguage  } from "../../contexts";
import { 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  X, 
  Check, 
  AlertTriangle 
} from "lucide-react";
import { Button } from "../../components/ui/button";

export function PendingApproval() {
  const { purchaseRequests, updatePRStatus } = useProcurement();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);
  const [comment, setComment] = useState("");

  const pendingPRs = purchaseRequests.filter(pr => pr.status === "Waiting Approval");

  const filteredPRs = pendingPRs.filter(pr => {
    const matchesSearch = pr.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pr.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pr.creator.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "All" || pr.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleAction = (status: "Approved" | "Rejected") => {
    if (!selectedPR) return;
    updatePRStatus(selectedPR.id, status, comment);
    setSelectedPR(null);
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

  return (
    <div className="space-y-6">
      {/* Search & Filter bar */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-foreground">{t("approver.pending")}</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center bg-background border border-border rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-150">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input
              type="text"
              placeholder="Search by ID, requisitioner or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/60 w-full"
            />
          </div>

          <div className="flex items-center bg-background border border-border rounded-lg px-3 py-2 min-w-[150px]">
            <Filter className="w-3.5 h-3.5 text-muted-foreground mr-2" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-semibold text-foreground w-full cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table / Grid */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-sidebar/30">
                <th className="py-3 px-6">{t("common.id")}</th>
                <th className="py-3 px-6">Requisitioner</th>
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Priority</th>
                <th className="py-3 px-6">Total Value</th>
                <th className="py-3 px-6">Submitted Date</th>
                <th className="py-3 px-6 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredPRs.map(pr => {
                const total = pr.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
                return (
                  <tr key={pr.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-foreground">{pr.id}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-foreground">{pr.creator.name}</div>
                      <div className="text-[10px] text-muted-foreground">{pr.department}</div>
                    </td>
                    <td className="py-4 px-6 truncate max-w-[200px] text-foreground font-medium">{pr.title}</td>
                    <td className={`py-4 px-6 text-xs ${getPriorityColor(pr.priority)}`}>{pr.priority}</td>
                    <td className="py-4 px-6 font-bold text-foreground">${total.toLocaleString()}</td>
                    <td className="py-4 px-6 text-muted-foreground text-xs">{new Date(pr.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        onClick={() => setSelectedPR(pr)}
                        className="text-xs h-8 cursor-pointer flex items-center gap-1.5 ml-auto hover:opacity-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filteredPRs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No requisitions currently pending your approval.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-border">
          {filteredPRs.map(pr => {
            const total = pr.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
            return (
              <div key={pr.id} className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground text-sm">{pr.id}</span>
                  <span className="flex items-center gap-1 text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span>Pending</span>
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{pr.title}</h4>
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
                  <span>Review & Approve</span>
                </Button>
              </div>
            );
          })}
          {filteredPRs.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No requisitions pending approval.
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedPR && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-sidebar/20">
              <div>
                <h3 className="font-bold text-foreground text-lg">Review Requisition {selectedPR.id}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Submitted by {selectedPR.creator.name} ({selectedPR.creator.email})</p>
              </div>
              <button 
                onClick={() => setSelectedPR(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Date</span>
                  <span className="text-sm font-semibold text-foreground">{new Date(selectedPR.createdAt).toLocaleString()}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Purpose & Justification</span>
                  <p className="text-xs text-foreground mt-0.5 leading-relaxed">{selectedPR.purpose}</p>
                </div>
              </div>

              {/* Items List Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground">Requested Items</h4>
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
                        <td colSpan={4} className="py-3 px-4 text-right">Grand Total:</td>
                        <td className="py-3 px-4 text-right text-primary">${selectedPR.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Approver Comments */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wide">
                  {t("approver.comments")}
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide comments or feedback..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-border flex justify-between bg-sidebar/10">
              <Button 
                variant="outline" 
                onClick={() => setSelectedPR(null)} 
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction("Rejected")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white font-semibold text-xs rounded-lg hover:bg-rose-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleAction("Approved")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white font-semibold text-xs rounded-lg hover:bg-emerald-600 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
