import React, { useState } from "react";
import { useProcurement } from "../../contexts";
import type { PurchaseRequest } from "../../types";
import { useLanguage  } from "../../contexts";
import { 
  Search, 
  Filter, 
  Eye, 
  X, 
  Paperclip,
  CheckCircle,
  Clock
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function AllPR() {
  const { purchaseRequests, departments } = useProcurement();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);

  // Filter
  const filteredPRs = purchaseRequests.filter(pr => {
    const matchesSearch = pr.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pr.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pr.creator.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || pr.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || pr.priority === priorityFilter;
    const matchesDept = deptFilter === "All" || pr.department === deptFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesDept;
  });



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
      {/* Search & Filter Capsule */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-foreground">{t("purchasing.all_pr")}</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="flex items-center bg-background border border-border rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-150">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input
              type="text"
              placeholder="Search by ID, title, requester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/60 w-full"
            />
          </div>

          {/* Status */}
          <div className="flex items-center bg-background border border-border rounded-lg px-3 py-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-semibold text-foreground w-full cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Waiting Approval">Waiting Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="PO Released">PO Released</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center bg-background border border-border rounded-lg px-3 py-2">
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

          {/* Department */}
          <div className="flex items-center bg-background border border-border rounded-lg px-3 py-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground mr-2" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-semibold text-foreground w-full cursor-pointer"
            >
              <option value="All">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results grid/table */}
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
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">{t("common.status")}</th>
                <th className="py-3 px-6">Budget</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredPRs.map(pr => {
                const total = pr.items.reduce((s, it) => s + it.quantity * it.price, 0);
                return (
                  <tr key={pr.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-foreground">{pr.id}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-foreground">{pr.creator.name}</div>
                      <div className="text-[10px] text-muted-foreground">{pr.creator.email}</div>
                    </td>
                    <td className="py-4 px-6 truncate max-w-[180px] text-foreground font-medium">{pr.title}</td>
                    <td className={`py-4 px-6 text-xs ${getPriorityColor(pr.priority)}`}>{pr.priority}</td>
                    <td className="py-4 px-6 text-muted-foreground text-xs">{pr.department}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={pr.status} />
                    </td>
                    <td className="py-4 px-6 font-bold text-foreground">${total.toLocaleString()}</td>
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
                    No purchase requisitions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-border">
          {filteredPRs.map(pr => {
            const total = pr.items.reduce((s, it) => s + it.quantity * it.price, 0);
            return (
              <div key={pr.id} className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground text-sm">{pr.id}</span>
                  <StatusBadge status={pr.status} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{pr.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">By {pr.creator.name} • {pr.department}</p>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Priority: <strong className={getPriorityColor(pr.priority)}>{pr.priority}</strong></span>
                  <span>Total: <strong className="text-foreground">${total.toLocaleString()}</strong></span>
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
              No matching purchase requisitions.
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPR && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-sidebar/20">
              <div>
                <h3 className="font-bold text-foreground text-lg">{selectedPR.id} Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Submitted by {selectedPR.creator.name} ({selectedPR.creator.email})</p>
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
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Workflow Status</span>
                  <div className="mt-0.5">
                    <StatusBadge status={selectedPR.status} />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Submitted Time</span>
                  <span className="text-sm font-semibold text-foreground">{new Date(selectedPR.createdAt).toLocaleString()}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Justification Purpose</span>
                  <p className="text-xs text-foreground mt-0.5 leading-relaxed">{selectedPR.purpose}</p>
                </div>
                {selectedPR.approverComments && (
                  <div className="md:col-span-2 p-3 bg-card border border-border rounded-lg">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Approver / Manager Comment</span>
                    <p className="text-xs text-foreground italic mt-0.5">&ldquo;{selectedPR.approverComments}&rdquo;</p>
                  </div>
                )}
                {selectedPR.poNumber && (
                  <div className="md:col-span-2 grid grid-cols-2 gap-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <div>
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">Purchase Order Released</span>
                      <span className="text-xs font-bold text-foreground">{selectedPR.poNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">Vendor ID Reference</span>
                      <span className="text-xs font-semibold text-foreground">{selectedPR.vendorId || "Direct Release"}</span>
                    </div>
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
