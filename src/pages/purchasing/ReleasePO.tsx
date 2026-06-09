import React, { useState } from "react";
import { useProcurement } from "../../contexts";
import type { PurchaseRequest } from "../../types";
import { useLanguage  } from "../../contexts";
import { 
  Truck, 
  Search, 
  ArrowRight, 
  X, 
  Paperclip,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "../../components/ui/button";

export function ReleasePO() {
  const { purchaseRequests, vendors, releasePO } = useProcurement();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [error, setError] = useState("");

  const approvedPRs = purchaseRequests.filter(pr => pr.status === "Approved");
  const activeVendors = vendors.filter(v => v.status === "Active");

  const filteredPRs = approvedPRs.filter(pr => {
    return pr.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           pr.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
           pr.creator.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleRelease = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedPR) return;
    if (!selectedVendorId) {
      setError("Please select a vendor before releasing the Purchase Order.");
      return;
    }

    // Release PO via context
    releasePO(selectedPR.id, selectedVendorId);

    // Reset state
    setSelectedPR(null);
    setSelectedVendorId("");
  };

  return (
    <div className="space-y-6">
      {/* Search Bar Header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-foreground">{t("purchasing.release_po")}</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center bg-background border border-border rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-150">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input
              type="text"
              placeholder="Search approved requisitions by ID, title, requisitioner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/60 w-full"
            />
          </div>
        </div>
      </div>

      {/* Main Grid List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-sidebar/30">
                <th className="py-3 px-6">{t("common.id")}</th>
                <th className="py-3 px-6">Requisitioner</th>
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">Value Amount</th>
                <th className="py-3 px-6">Approved Date</th>
                <th className="py-3 px-6 text-right">PO Action</th>
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
                      <div className="text-[10px] text-muted-foreground">{pr.department}</div>
                    </td>
                    <td className="py-4 px-6 truncate max-w-[200px] text-foreground font-medium">{pr.title}</td>
                    <td className="py-4 px-6 text-muted-foreground text-xs">{pr.department}</td>
                    <td className="py-4 px-6 font-bold text-foreground">${total.toLocaleString()}</td>
                    <td className="py-4 px-6 text-muted-foreground text-xs">{new Date(pr.updatedAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPR(pr);
                          setSelectedVendorId(activeVendors[0]?.id || "");
                          setError("");
                        }}
                        className="text-xs h-8 cursor-pointer flex items-center gap-1.5 ml-auto bg-primary text-primary-foreground hover:opacity-95"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Release PO</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filteredPRs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No approved purchase requests are waiting for vendor assignment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards List */}
        <div className="md:hidden divide-y divide-border">
          {filteredPRs.map(pr => {
            const total = pr.items.reduce((s, it) => s + it.quantity * it.price, 0);
            return (
              <div key={pr.id} className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground text-sm">{pr.id}</span>
                  <span className="flex items-center gap-1 text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    <span>Approved</span>
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{pr.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">By {pr.creator.name} • {pr.department}</p>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Budget: <strong className="text-foreground">${total.toLocaleString()}</strong></span>
                  <span className="text-muted-foreground">{new Date(pr.updatedAt).toLocaleDateString()}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedPR(pr);
                    setSelectedVendorId(activeVendors[0]?.id || "");
                    setError("");
                  }}
                  className="w-full text-xs h-8 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Release Purchase Order</span>
                </Button>
              </div>
            );
          })}
          {filteredPRs.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              All purchase orders have been processed and released.
            </div>
          )}
        </div>
      </div>

      {/* PO Release Dialog Modal */}
      {selectedPR && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-sidebar/20">
              <div>
                <h3 className="font-bold text-foreground text-lg">PO Release Form</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Generate and release Purchase Order for Requisition {selectedPR.id}</p>
              </div>
              <button 
                onClick={() => setSelectedPR(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRelease} className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-2.5 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Details Recap */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border border-border">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Request Title</span>
                    <span className="text-sm font-semibold text-foreground">{selectedPR.title}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Department</span>
                    <span className="text-sm font-semibold text-foreground">{selectedPR.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Approver Remarks</span>
                    <p className="text-xs text-foreground italic mt-0.5">&ldquo;{selectedPR.approverComments || "None"}&rdquo;</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Requisition Budget</span>
                    <span className="text-sm font-bold text-foreground block">
                      ${selectedPR.items.reduce((s, it) => s + it.quantity * it.price, 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Requested Items */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-wide">Line Items</h4>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border bg-sidebar/20 text-muted-foreground font-bold">
                          <th className="py-2.5 px-4">Item description</th>
                          <th className="py-2.5 px-4 text-center">Qty</th>
                          <th className="py-2.5 px-4">Unit</th>
                          <th className="py-2.5 px-4 text-right">Est. Price</th>
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
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Vendor Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wide">
                    Select Fulfilment Vendor
                  </label>
                  <select
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                  >
                    <option value="">-- Choose qualified vendor --</option>
                    {activeVendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name} ({vendor.category}) — Rating: ★{vendor.rating.toFixed(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-border flex justify-between bg-sidebar/10 shrink-0">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setSelectedPR(null)} 
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex items-center gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:opacity-90"
                >
                  <Truck className="w-4 h-4" />
                  <span>Release Purchase Order</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
