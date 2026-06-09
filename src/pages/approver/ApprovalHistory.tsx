import React, { useState } from "react";
import { useProcurement } from "../../contexts";
import type { PurchaseRequest } from "../../types";
import { useLanguage  } from "../../contexts";
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  X,
  Clock,
  Paperclip
} from "lucide-react";
import { Button } from "../../components/ui/button";

export function ApprovalHistory() {
  const { purchaseRequests } = useProcurement();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);

  // Filter history (everything that is not Waiting Approval or Draft)
  const historyPRs = purchaseRequests.filter(pr => pr.status !== "Waiting Approval" && pr.status !== "Draft");

  const filteredPRs = historyPRs.filter(pr => {
    const matchesSearch = pr.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pr.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pr.creator.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter map
    const matchesStatus = statusFilter === "All" || 
      (statusFilter === "Approved" && ["Approved", "PO Released", "Completed"].includes(pr.status)) ||
      (statusFilter === "Rejected" && pr.status === "Rejected");

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
      case "PO Released":
      case "Completed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "Rejected":
        return "bg-rose-500/10 text-rose-500 border-rose-500/30";
      default:
        return "bg-muted text-muted-foreground border-muted-foreground/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-foreground">{t("approver.history")}</h2>
        
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-semibold text-foreground w-full cursor-pointer"
            >
              <option value="All">All Actions</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-sidebar/30">
                <th className="py-3 px-6">{t("common.id")}</th>
                <th className="py-3 px-6">Requisitioner</th>
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Action Decision</th>
                <th className="py-3 px-6">Total Value</th>
                <th className="py-3 px-6">Action Comments</th>
                <th className="py-3 px-6">Updated Date</th>
                <th className="py-3 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredPRs.map(pr => {
                const total = pr.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
                const isApproved = ["Approved", "PO Released", "Completed"].includes(pr.status);
                return (
                  <tr key={pr.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-foreground">{pr.id}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-foreground">{pr.creator.name}</div>
                      <div className="text-[10px] text-muted-foreground">{pr.department}</div>
                    </td>
                    <td className="py-4 px-6 truncate max-w-[150px] text-foreground font-medium">{pr.title}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(pr.status)}`}>
                        {isApproved ? "Approved" : "Rejected"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-foreground">${total.toLocaleString()}</td>
                    <td className="py-4 px-6 text-muted-foreground text-xs truncate max-w-[200px]" title={pr.approverComments}>
                      {pr.approverComments || "—"}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground text-xs">{new Date(pr.updatedAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedPR(pr)}
                        className="p-2 h-8 cursor-pointer hover:bg-muted ml-auto"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filteredPRs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No approval history logs match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards List */}
        <div className="md:hidden divide-y divide-border">
          {filteredPRs.map(pr => {
            const total = pr.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
            const isApproved = ["Approved", "PO Released", "Completed"].includes(pr.status);
            return (
              <div key={pr.id} className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground text-sm">{pr.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(pr.status)}`}>
                    {isApproved ? "Approved" : "Rejected"}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{pr.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">By {pr.creator.name} • {pr.department}</p>
                </div>
                <div className="text-xs text-muted-foreground italic">
                  Remarks: {pr.approverComments || "None"}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>Total: <strong className="text-foreground">${total.toLocaleString()}</strong></span>
                  <span>{new Date(pr.updatedAt).toLocaleDateString()}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedPR(pr)}
                  className="w-full text-xs h-8 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Details</span>
                </Button>
              </div>
            );
          })}
          {filteredPRs.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No approval history records.
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedPR && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-sidebar/20">
              <div>
                <h3 className="font-bold text-foreground text-lg">{selectedPR.id} Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Requisitioned by {selectedPR.creator.name}</p>
              </div>
              <button 
                onClick={() => setSelectedPR(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
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
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Decision Status</span>
                  <span className={`text-sm font-bold block ${["Approved", "PO Released", "Completed"].includes(selectedPR.status) ? "text-emerald-500" : "text-rose-500"}`}>
                    {["Approved", "PO Released", "Completed"].includes(selectedPR.status) ? "Approved & Verified" : "Rejected / Returned"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Action Date</span>
                  <span className="text-sm font-semibold text-foreground">{new Date(selectedPR.updatedAt).toLocaleString()}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Justification Purpose</span>
                  <p className="text-xs text-foreground mt-0.5 leading-relaxed">{selectedPR.purpose}</p>
                </div>
                {selectedPR.approverComments && (
                  <div className="md:col-span-2 p-3 bg-card border border-border rounded-lg">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Approver Review Comments</span>
                    <p className="text-xs text-foreground italic mt-0.5">&ldquo;{selectedPR.approverComments}&rdquo;</p>
                  </div>
                )}
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
                        <td colSpan={4} className="py-3 px-4 text-right">Grand Total:</td>
                        <td className="py-3 px-4 text-right text-primary">${selectedPR.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attachments Section */}
              {selectedPR.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-foreground">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPR.attachments.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted border border-border rounded-lg text-xs text-foreground">
                        <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex justify-end bg-sidebar/10">
              <Button 
                variant="outline" 
                onClick={() => setSelectedPR(null)} 
                className="cursor-pointer"
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
