import React, { useState } from "react";
import { useProcurement } from "../../contexts";
import type { PurchaseRequest, PRStatus } from "../../types";
import { useLanguage  } from "../../contexts";
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Paperclip,
  Calendar,
  X,
  FileSpreadsheet,
  SlidersHorizontal,
  FileText,
  Printer
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "../../components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { StatusBadge } from "../../components/ui/StatusBadge";
import logo from "../../logo.png";

// Advanced filter state shape
interface AdvancedFilters {
  prNumber: string;
  dateFrom: string;
  dateTo: string;
  requester: string;
  charge: string;
  approval: string;
  status: string;
  supplier: string;
  prType: string;
  expendNo: string;
  rfeNo: string;
  inventoryNo: string;
  itemName: string;
  purchaseOrder: string;
  receiveStatus: string;
  comment: string;
}

const emptyAdvancedFilters: AdvancedFilters = {
  prNumber: "",
  dateFrom: "",
  dateTo: "",
  requester: "",
  charge: "",
  approval: "",
  status: "",
  supplier: "",
  prType: "",
  expendNo: "",
  rfeNo: "",
  inventoryNo: "",
  itemName: "",
  purchaseOrder: "",
  receiveStatus: "",
  comment: "",
};

export function MyPR() {
  const { purchaseRequests, currentUser, updatePRStatus } = useProcurement();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);
  const [pdfPR, setPdfPR] = useState<PurchaseRequest | null>(null);

  // Advanced Search drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [draftAdvancedFilters, setDraftAdvancedFilters] = useState<AdvancedFilters>(emptyAdvancedFilters);
  const [appliedAdvancedFilters, setAppliedAdvancedFilters] = useState<AdvancedFilters>(emptyAdvancedFilters);

  const myPRs = purchaseRequests.filter(pr => pr.creator.email === currentUser?.email);

  // Basic filter logic
  const baseFilteredPRs = myPRs.filter(pr => {
    const matchesSearch = pr.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pr.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || pr.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || pr.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Apply advanced filters on top of base filters (AND logic)
  const filteredPRs = baseFilteredPRs.filter(pr => {
    const af = appliedAdvancedFilters;

    if (af.prNumber && !pr.id.toLowerCase().includes(af.prNumber.toLowerCase())) return false;

    if (af.dateFrom) {
      const from = new Date(af.dateFrom);
      if (new Date(pr.createdAt) < from) return false;
    }
    if (af.dateTo) {
      const to = new Date(af.dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(pr.createdAt) > to) return false;
    }

    if (af.requester && !pr.creator.name.toLowerCase().includes(af.requester.toLowerCase())) return false;

    // Fields not on PurchaseRequest type — fallback to title/id match
    const fallbackText = `${pr.title} ${pr.id}`.toLowerCase();

    if (af.charge && !fallbackText.includes(af.charge.toLowerCase())) return false;
    if (af.approval && !fallbackText.includes(af.approval.toLowerCase())) return false;

    if (af.status && af.status !== "All" && pr.status !== af.status) return false;

    if (af.supplier && !fallbackText.includes(af.supplier.toLowerCase())) return false;
    if (af.prType && af.prType !== "All" && !fallbackText.includes(af.prType.toLowerCase())) return false;
    if (af.expendNo && !fallbackText.includes(af.expendNo.toLowerCase())) return false;
    if (af.rfeNo && !fallbackText.includes(af.rfeNo.toLowerCase())) return false;
    if (af.inventoryNo && !fallbackText.includes(af.inventoryNo.toLowerCase())) return false;

    if (af.itemName) {
      const matchesItem = pr.items.some(item =>
        item.name.toLowerCase().includes(af.itemName.toLowerCase())
      );
      if (!matchesItem) return false;
    }

    if (af.purchaseOrder && !fallbackText.includes(af.purchaseOrder.toLowerCase())) return false;
    if (af.receiveStatus && af.receiveStatus !== "All" && !fallbackText.includes(af.receiveStatus.toLowerCase())) return false;
    if (af.comment && !fallbackText.includes(af.comment.toLowerCase())) return false;

    return true;
  });

  const handleExportPDF = (pr: PurchaseRequest) => {
    const total = pr.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>PR ${pr.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            .meta { color: #666; font-size: 12px; margin-bottom: 24px; }
            .section-title { font-size: 13px; font-weight: bold; margin: 20px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
            .field label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; display: block; }
            .field span { font-size: 13px; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #f5f5f5; text-align: left; padding: 8px 12px; font-size: 11px; color: #555; }
            td { padding: 8px 12px; border-bottom: 1px solid #eee; }
            .total-row td { font-weight: bold; background: #f9f9f9; }
            .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>Purchase Requisition — ${pr.id}</h1>
          <div class="meta">Generated on ${new Date().toLocaleString()} • Status: <span class="badge">${pr.status}</span></div>
          
          <div class="section-title">General Information</div>
          <div class="grid">
            <div class="field"><label>Title</label><span>${pr.title}</span></div>
            <div class="field"><label>Department</label><span>${pr.department}</span></div>
            <div class="field"><label>Priority</label><span>${pr.priority}</span></div>
            <div class="field"><label>Created</label><span>${new Date(pr.createdAt).toLocaleString()}</span></div>
            <div class="field" style="grid-column: span 2"><label>Purpose</label><span>${pr.purpose || "-"}</span></div>
          </div>

          <div class="section-title">Items Requested</div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th style="text-align:right">Est. Price</th>
                <th style="text-align:right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${pr.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit}</td>
                  <td style="text-align:right">$${item.price.toLocaleString()}</td>
                  <td style="text-align:right">$${(item.quantity * item.price).toLocaleString()}</td>
                </tr>
              `).join("")}
              <tr class="total-row">
                <td colspan="4" style="text-align:right">Grand Total:</td>
                <td style="text-align:right">$${total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          ${pr.approverComments ? `
            <div class="section-title">Approver Comment</div>
            <p style="font-style:italic;color:#444">"${pr.approverComments}"</p>
          ` : ""}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "text-muted-foreground";
      case "Medium":
        return "text-blue-500";
      case "High":
        return "text-amber-500 font-semibold";
      case "Urgent":
        return "text-rose-500 font-bold animate-pulse";
      default:
        return "text-muted-foreground";
    }
  };

  const handleSubmitDraft = (id: string) => {
    updatePRStatus(id, "Waiting Approval");
    if (selectedPR && selectedPR.id === id) {
      setSelectedPR(prev => prev ? { ...prev, status: "Waiting Approval" } : null);
    }
  };

  const handleAdvancedSearch = () => {
    setAppliedAdvancedFilters({ ...draftAdvancedFilters });
    setIsDrawerOpen(false);
  };

  const handleAdvancedReset = () => {
    setDraftAdvancedFilters({ ...emptyAdvancedFilters });
  };

  const updateDraft = (key: keyof AdvancedFilters, value: string) => {
    setDraftAdvancedFilters(prev => ({ ...prev, [key]: value }));
  };

  // Count active advanced filters for badge display
  const activeAdvancedCount = Object.values(appliedAdvancedFilters).filter(v => v && v !== "All").length;

  const inputClass =
    "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150";
  const selectClass =
    "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150 cursor-pointer";
  const labelClass = "block text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-1";

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-foreground">{t("employee.my_pr")}</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="flex-1 flex items-center bg-background border border-border rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-150">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input
              type="text"
              placeholder={t("mypr.search.placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/60 w-full"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center bg-background border border-border rounded-lg px-3 py-2 min-w-[150px]">
            <Filter className="w-3.5 h-3.5 text-muted-foreground mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-semibold text-foreground w-full cursor-pointer"
            >
              <option value="All">{t("mypr.filter.all_statuses")}</option>
              <option value="Draft">Draft</option>
              <option value="Waiting Approval">Waiting Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="PO Released">PO Released</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="flex items-center bg-background border border-border rounded-lg px-3 py-2 min-w-[150px]">
            <Filter className="w-3.5 h-3.5 text-muted-foreground mr-2" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-semibold text-foreground w-full cursor-pointer"
            >
              <option value="All">{t("mypr.filter.all_priorities")}</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Advanced Search Button */}
          <Button
            variant="outline"
            onClick={() => {
              setDraftAdvancedFilters({ ...appliedAdvancedFilters });
              setIsDrawerOpen(true);
            }}
            className="flex items-center gap-2 cursor-pointer shrink-0 relative"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-semibold">{t("mypr.advanced_search")}</span>
            {activeAdvancedCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {activeAdvancedCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Requisitions List */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-sidebar/30">
                <th className="py-3 px-6">{t("common.id")}</th>
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Priority</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">{t("common.status")}</th>
                <th className="py-3 px-6">{t("common.total")}</th>
                <th className="py-3 px-6">{t("common.date")}</th>
                <th className="py-3 px-6 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredPRs.map(pr => {
                const total = pr.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
                return (
                  <tr key={pr.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-foreground">{pr.id}</td>
                    <td className="py-4 px-6 truncate max-w-[220px] text-foreground font-medium">{pr.title}</td>
                    <td className={`py-4 px-6 text-xs ${getPriorityColor(pr.priority)}`}>
                      {pr.priority}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground text-xs">{pr.department}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={pr.status} />
                    </td>
                    <td className="py-4 px-6 font-bold text-foreground">${total.toLocaleString()}</td>
                    <td className="py-4 px-6 text-muted-foreground text-xs">
                      {new Date(pr.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        {pr.status === "Draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSubmitDraft(pr.id)}
                            className="text-xs h-8 cursor-pointer"
                          >
                            {t("mypr.submit_approval")}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedPR(pr)}
                          className="p-2 h-8 cursor-pointer hover:bg-muted"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPdfPR(pr)}
                          className="p-2 h-8 cursor-pointer hover:bg-muted"
                          title="View PDF"
                        >
                          <FileText className="w-4 h-4 text-rose-500 hover:text-rose-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPRs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    {t("mypr.empty")}
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
                  <StatusBadge status={pr.status} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">{pr.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{pr.department} • <span className={getPriorityColor(pr.priority)}>{pr.priority} Priority</span></p>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Total: <strong className="text-foreground">${total.toLocaleString()}</strong></span>
                  <span>{new Date(pr.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  {pr.status === "Draft" && (
                    <Button
                      size="sm"
                      onClick={() => handleSubmitDraft(pr.id)}
                      className="text-xs h-8 cursor-pointer w-full"
                    >
                      {t("mypr.submit_approval")}
                    </Button>
                  )}
                   <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPR(pr)}
                    className="text-xs h-8 cursor-pointer w-full flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t("common.view")}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPdfPR(pr)}
                    className="text-xs h-8 cursor-pointer w-full flex items-center justify-center gap-1.5 border-rose-200 text-rose-500 hover:bg-rose-500/5 hover:text-rose-600"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </Button>
                </div>
              </div>
            );
          })}
          {filteredPRs.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              {t("mypr.empty")}
            </div>
          )}
        </div>
      </div>

      {/* Advanced Search Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2 text-foreground">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              {t("mypr.advanced_search")}
            </SheetTitle>
          </SheetHeader>

          {/* Filter fields grid */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              {/* Row 1 */}
              <div>
                <label className={labelClass}>{t("mypr.filter.pr_number")}</label>
                <input
                  type="text"
                  value={draftAdvancedFilters.prNumber}
                  onChange={e => updateDraft("prNumber", e.target.value)}
                  placeholder="PR-001"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("mypr.filter.date_from")}</label>
                <input
                  type="date"
                  value={draftAdvancedFilters.dateFrom}
                  onChange={e => updateDraft("dateFrom", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Row 2 */}
              <div>
                <label className={labelClass}>{t("mypr.filter.date_to")}</label>
                <input
                  type="date"
                  value={draftAdvancedFilters.dateTo}
                  onChange={e => updateDraft("dateTo", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("mypr.filter.requester")}</label>
                <input
                  type="text"
                  value={draftAdvancedFilters.requester}
                  onChange={e => updateDraft("requester", e.target.value)}
                  placeholder="Name..."
                  className={inputClass}
                />
              </div>

              {/* Row 3 */}
              <div>
                <label className={labelClass}>{t("mypr.filter.charge")}</label>
                <input
                  type="text"
                  value={draftAdvancedFilters.charge}
                  onChange={e => updateDraft("charge", e.target.value)}
                  placeholder="Charge code..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("mypr.filter.approval")}</label>
                <input
                  type="text"
                  value={draftAdvancedFilters.approval}
                  onChange={e => updateDraft("approval", e.target.value)}
                  placeholder="Approver name..."
                  className={inputClass}
                />
              </div>

              {/* Row 4 */}
              <div>
                <label className={labelClass}>{t("mypr.filter.all_statuses")}</label>
                <select
                  value={draftAdvancedFilters.status}
                  onChange={e => updateDraft("status", e.target.value)}
                  className={selectClass}
                >
                  <option value="">All</option>
                  <option value="Draft">Draft</option>
                  <option value="Waiting Approval">Waiting Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="PO Released">PO Released</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("mypr.filter.supplier")}</label>
                <input
                  type="text"
                  value={draftAdvancedFilters.supplier}
                  onChange={e => updateDraft("supplier", e.target.value)}
                  placeholder="Supplier name..."
                  className={inputClass}
                />
              </div>

              {/* Row 5 */}
              <div>
                <label className={labelClass}>{t("mypr.filter.pr_type")}</label>
                <select
                  value={draftAdvancedFilters.prType}
                  onChange={e => updateDraft("prType", e.target.value)}
                  className={selectClass}
                >
                  <option value="">All</option>
                  <option value="New">New</option>
                  <option value="Repeat Order">Repeat Order</option>
                  <option value="Repeat Order Remake">Repeat Order Remake</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("mypr.filter.expend_no")}</label>
                <input
                  type="text"
                  value={draftAdvancedFilters.expendNo}
                  onChange={e => updateDraft("expendNo", e.target.value)}
                  placeholder="Expend number..."
                  className={inputClass}
                />
              </div>

              {/* Row 6 */}
              <div>
                <label className={labelClass}>{t("mypr.filter.rfe_no")}</label>
                <input
                  type="text"
                  value={draftAdvancedFilters.rfeNo}
                  onChange={e => updateDraft("rfeNo", e.target.value)}
                  placeholder="RFE number..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("mypr.filter.inventory_no")}</label>
                <input
                  type="text"
                  value={draftAdvancedFilters.inventoryNo}
                  onChange={e => updateDraft("inventoryNo", e.target.value)}
                  placeholder="Inventory number..."
                  className={inputClass}
                />
              </div>

              {/* Row 7 */}
              <div>
                <label className={labelClass}>{t("mypr.filter.item_name")}</label>
                <input
                  type="text"
                  value={draftAdvancedFilters.itemName}
                  onChange={e => updateDraft("itemName", e.target.value)}
                  placeholder="Item name..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("mypr.filter.po")}</label>
                <input
                  type="text"
                  value={draftAdvancedFilters.purchaseOrder}
                  onChange={e => updateDraft("purchaseOrder", e.target.value)}
                  placeholder="PO number..."
                  className={inputClass}
                />
              </div>

              {/* Row 8 */}
              <div>
                <label className={labelClass}>{t("mypr.filter.receive_status")}</label>
                <select
                  value={draftAdvancedFilters.receiveStatus}
                  onChange={e => updateDraft("receiveStatus", e.target.value)}
                  className={selectClass}
                >
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("mypr.filter.comment")}</label>
                <input
                  type="text"
                  value={draftAdvancedFilters.comment}
                  onChange={e => updateDraft("comment", e.target.value)}
                  placeholder="Comment keyword..."
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <SheetFooter className="px-6 py-4 border-t border-border flex flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleAdvancedReset}
              className="cursor-pointer"
            >
              {t("mypr.filter.reset")}
            </Button>
            <Button
              onClick={handleAdvancedSearch}
              className="cursor-pointer"
            >
              {t("mypr.filter.search")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Details Modal */}
      {selectedPR && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-sidebar/20">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-foreground text-lg">{selectedPR.id}</h3>
                  <StatusBadge status={selectedPR.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Submitted by {selectedPR.creator.name} ({selectedPR.creator.email})</p>
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
              {/* General details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border border-border/60">
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
                  <span className={`text-sm font-semibold block ${getPriorityColor(selectedPR.priority)}`}>{selectedPR.priority}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Created Date</span>
                  <span className="text-sm font-semibold text-foreground">{new Date(selectedPR.createdAt).toLocaleString()}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Purpose & Justification</span>
                  <p className="text-xs text-foreground/95 leading-relaxed mt-0.5">{selectedPR.purpose || "No justification provided."}</p>
                </div>
              </div>

              {/* Items List Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground">Requested Items</h4>
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-sidebar/20 text-muted-foreground font-bold">
                        <th className="py-2.5 px-4">Item Description</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4">Unit</th>
                        <th className="py-2.5 px-4 text-right">Est. Price</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-foreground">
                      {selectedPR.items.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-muted/10">
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

              {/* Workflow timeline & Comments */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground">Approval Workflow status</h4>
                
                {/* Timeline display */}
                <div className="relative pl-6 space-y-4 before:absolute before:inset-y-1 before:left-2 before:w-[2px] before:bg-border">
                  {/* Step 1: Created */}
                  <div className="flex gap-4 items-start relative text-xs">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 border-4 border-card flex items-center justify-center shrink-0 z-10 absolute left-[-22px]" />
                    <div>
                      <span className="font-bold text-foreground">Employee Created PR</span>
                      <p className="text-[10px] text-muted-foreground">Initiated by {selectedPR.creator.name} on {new Date(selectedPR.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Step 2: Approver Review */}
                  <div className="flex gap-4 items-start relative text-xs">
                    <div className={`w-4 h-4 rounded-full border-4 border-card flex items-center justify-center shrink-0 z-10 absolute left-[-22px] ${
                      selectedPR.status === "Draft"
                        ? "bg-muted"
                        : selectedPR.status === "Rejected"
                        ? "bg-rose-500"
                        : selectedPR.status === "Waiting Approval"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-emerald-500"
                    }`} />
                    <div>
                      <span className="font-bold text-foreground">Approver Review</span>
                      <p className="text-[10px] text-muted-foreground">
                        {selectedPR.status === "Draft" && "Awaiting PR submission"}
                        {selectedPR.status === "Waiting Approval" && "Pending manager/finance review"}
                        {selectedPR.status === "Rejected" && "Requisition Rejected"}
                        {["Approved", "PO Released", "Completed"].includes(selectedPR.status) && "Approved"}
                      </p>
                      {selectedPR.approverComments && (
                        <div className="mt-1.5 p-2.5 bg-sidebar/40 border border-border rounded-lg italic text-[11px] text-foreground">
                          &ldquo;{selectedPR.approverComments}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Purchasing PO Release */}
                  <div className="flex gap-4 items-start relative text-xs">
                    <div className={`w-4 h-4 rounded-full border-4 border-card flex items-center justify-center shrink-0 z-10 absolute left-[-22px] ${
                      ["Draft", "Waiting Approval", "Rejected"].includes(selectedPR.status)
                        ? "bg-muted"
                        : selectedPR.status === "Approved"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-emerald-500"
                    }`} />
                    <div>
                      <span className="font-bold text-foreground">PO Release & Vendor Assignment</span>
                      <p className="text-[10px] text-muted-foreground">
                        {["Draft", "Waiting Approval", "Rejected"].includes(selectedPR.status) && "Pending approval step"}
                        {selectedPR.status === "Approved" && "Ready for Purchasing release"}
                        {["PO Released", "Completed"].includes(selectedPR.status) && `PO released: ${selectedPR.poNumber}`}
                      </p>
                    </div>
                  </div>
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

            {/* Modal Footer */}
            <div className="p-4 border-t border-border flex justify-end gap-2 bg-sidebar/10">
              <Button
                variant="outline"
                onClick={() => handleExportPDF(selectedPR)}
                className="cursor-pointer flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={() => setSelectedPR(null)} className="cursor-pointer">Close</Button>
              {selectedPR.status === "Draft" && (
                <Button onClick={() => handleSubmitDraft(selectedPR.id)} className="cursor-pointer">{t("mypr.submit_approval")}</Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Dialog */}
      <Dialog open={!!pdfPR} onOpenChange={(open) => { if (!open) setPdfPR(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 p-6 shadow-2xl rounded-2xl">
          <DialogHeader className="border-b border-slate-800 pb-4 mb-4 flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-bold text-white">Purchase Requisition PDF Preview</DialogTitle>
          </DialogHeader>

          {pdfPR && (
            <div className="space-y-6">
              {/* Printable Area Sheet */}
              <div 
                id="pr-pdf-preview" 
                className="bg-white text-slate-950 p-8 rounded-xl border border-slate-200 shadow-md font-sans text-xs max-w-3xl mx-auto space-y-6 leading-relaxed"
              >
                {/* PDF Header: Logo on left, title & details on right */}
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-1/2 align-middle">
                        <img src={logo} alt="AIINA Logo" className="h-10 w-auto" />
                        <div className="mt-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                          PT Alpha Innovatech Indonesia
                        </div>
                      </td>
                      <td className="w-1/2 text-right align-top">
                        <h1 className="text-base font-black text-slate-900 uppercase tracking-widest">
                          Purchase Request
                        </h1>
                        <div className="mt-1 space-y-0.5 text-[10px] text-slate-600">
                          <div><span className="font-bold">PR NO:</span> <span className="font-mono text-slate-900 font-bold">{pdfPR.id}</span></div>
                          <div><span className="font-bold">Date Initiated:</span> {new Date(pdfPR.createdAt).toLocaleDateString()}</div>
                          <div>
                            <span className="font-bold">Status:</span> 
                            <span className="font-bold uppercase ml-1 text-slate-900">{pdfPR.status}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Requester Information block */}
                <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                  <h3 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-2.5">
                    Requester Information
                  </h3>
                  <table className="w-full text-left text-[11px] border-collapse">
                    <tbody>
                      <tr>
                        <td className="py-1 pr-4 w-1/4"><span className="text-slate-500 font-bold uppercase text-[9px] block">Name</span><strong>{pdfPR.creator.name}</strong></td>
                        <td className="py-1 pr-4 w-1/4"><span className="text-slate-500 font-bold uppercase text-[9px] block">Email</span><span className="font-medium text-slate-700">{pdfPR.creator.email}</span></td>
                        <td className="py-1 pr-4 w-1/4"><span className="text-slate-500 font-bold uppercase text-[9px] block">BU Issuer</span><strong>{pdfPR.department}</strong></td>
                        <td className="py-1 w-1/4">
                          <span className="text-slate-500 font-bold uppercase text-[9px] block">BU Charged</span>
                          <strong>{pdfPR.items[0]?.expenseNo || "Cost Center (Default)"}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Purpose Justification */}
                <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                  <h3 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-2">
                    Purpose & Justification
                  </h3>
                  <p className="text-[11px] text-slate-800 leading-relaxed font-medium italic">
                    &ldquo;{pdfPR.purpose || "No justification provided."}&rdquo;
                  </p>
                </div>

                {/* PR Detail table */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                    Requested Items
                  </h3>
                  <table className="w-full border border-slate-300 border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-700 uppercase text-[9px] border-b border-slate-300">
                        <th className="py-2 px-3 border border-slate-300 w-8 text-center">No</th>
                        <th className="py-2 px-3 border border-slate-300">Item Code</th>
                        <th className="py-2 px-3 border border-slate-300">Item Name</th>
                        <th className="py-2 px-3 border border-slate-300">Supplier</th>
                        <th className="py-2 px-3 border border-slate-300 text-center">UoM</th>
                        <th className="py-2 px-3 border border-slate-300 text-center">Qty</th>
                        <th className="py-2 px-3 border border-slate-300 text-right">Unit Price</th>
                        <th className="py-2 px-3 border border-slate-300 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pdfPR.items.map((item, idx) => (
                        <tr key={item.id || idx} className="border-b border-slate-200">
                          <td className="py-2 px-3 border border-slate-300 text-center">{idx + 1}</td>
                          <td className="py-2 px-3 border border-slate-300 font-mono text-slate-700">{item.itemCode || "—"}</td>
                          <td className="py-2 px-3 border border-slate-300 font-medium">{item.name}</td>
                          <td className="py-2 px-3 border border-slate-300">{item.supplierName || "—"}</td>
                          <td className="py-2 px-3 border border-slate-300 text-center text-slate-600">{item.unit}</td>
                          <td className="py-2 px-3 border border-slate-300 text-center font-bold text-slate-900">{item.quantity}</td>
                          <td className="py-2 px-3 border border-slate-300 text-right">${item.price.toLocaleString()}</td>
                          <td className="py-2 px-3 border border-slate-300 text-right font-bold text-slate-900">${(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold border-t border-slate-300">
                        <td colSpan={7} className="py-2.5 px-3 border border-slate-300 text-right text-slate-600">
                          Grand Total (USD):
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 text-right text-slate-900 font-extrabold text-xs">
                          ${pdfPR.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* PR Attachment section */}
                <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                  <h3 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-2">
                    Supporting Attachments
                  </h3>
                  {pdfPR.attachments.length === 0 ? (
                    <span className="text-[10px] text-slate-400 italic">No attachments uploaded.</span>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {pdfPR.attachments.map((file, i) => (
                        <span key={i} className="bg-white border border-slate-200 px-2 py-1 rounded text-[10px] font-medium text-slate-700">
                          {file}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* PR Approval section */}
                <div className="space-y-2">
                  <h3 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                    PR Approval Signatures
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { level: 1, role: "Supervisor", name: pdfPR.approvalFlow?.[0]?.name || "Budi Santoso", bypass: pdfPR.approvalFlow?.[0]?.bypass },
                      { level: 2, role: "Manager", name: pdfPR.approvalFlow?.[1]?.name || "Sarah Approver", bypass: pdfPR.approvalFlow?.[1]?.bypass },
                      { level: 3, role: "Director", name: pdfPR.approvalFlow?.[2]?.name || "Rian Hidayat", bypass: pdfPR.approvalFlow?.[2]?.bypass },
                      { level: 4, role: "President Director", name: pdfPR.approvalFlow?.[3]?.name || "Hendra Wijaya", bypass: pdfPR.approvalFlow?.[3]?.bypass },
                    ].map((app) => {
                      const isApproved = ["Approved", "PO Released", "Completed"].includes(pdfPR.status);
                      const totalIDR = pdfPR.items.reduce((s, it) => s + it.quantity * it.price, 0) * 15000;
                      
                      const requiredLevel = 
                        totalIDR <= 5000000 ? 1 :
                        totalIDR <= 25000000 ? 2 :
                        totalIDR <= 100000000 ? 3 : 4;
                      
                      const isBypassed = app.bypass || app.level > requiredLevel;

                      return (
                        <div key={app.level} className="border border-slate-300 rounded-lg p-2.5 text-center flex flex-col justify-between bg-white min-h-[110px]">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">
                            {app.role}
                          </span>
                          <div className="my-2 h-10 flex items-center justify-center border-y border-dashed border-slate-100">
                            {isBypassed ? (
                              <span className="text-[9px] text-slate-400 italic uppercase">Bypassed</span>
                            ) : isApproved ? (
                              <span className="text-emerald-600 font-extrabold text-[10px] rotate-[-5deg] border border-emerald-600 px-1 py-0.5 rounded uppercase select-none">
                                Approved
                              </span>
                            ) : pdfPR.status === "Draft" ? (
                              <span className="text-slate-300 italic text-[9px] lowercase">draft</span>
                            ) : app.level === requiredLevel ? (
                              <span className="text-amber-500 font-extrabold text-[10px] rotate-[-5deg] border border-amber-500 px-1 py-0.5 rounded uppercase select-none">
                                Pending
                              </span>
                            ) : (
                              <span className="text-slate-300 italic text-[9px]">—</span>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-slate-700 block truncate leading-none">
                            {app.name || "N/A"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PDF Footer */}
                <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[9px] text-slate-400 uppercase tracking-wider">
                  <div>PT Alpha Innovatech Indonesia • Corporate e-Purchasing</div>
                  <div>Generated: {new Date().toLocaleString()}</div>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <DialogFooter className="mt-6 gap-2 border-t border-slate-800 pt-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setPdfPR(null)}
                  className="bg-transparent hover:bg-white/10 text-white border-slate-700 cursor-pointer text-xs"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const printContent = document.getElementById("pr-pdf-preview");
                    if (!printContent) return;
                    const printWindow = window.open("", "_blank");
                    if (!printWindow) return;
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>PR-${pdfPR.id}</title>
                          <script src="https://cdn.tailwindcss.com"></script>
                          <style>
                            body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 24px; color: #0f172a; background: #fff; }
                            @media print {
                              body { padding: 0; }
                            }
                          </style>
                        </head>
                        <body>
                          <div class="max-w-3xl mx-auto">
                            ${printContent.innerHTML}
                          </div>
                          <script>
                            window.onload = function() {
                              window.print();
                              window.onafterprint = function() { window.close(); };
                            }
                          </script>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white border-none cursor-pointer text-xs font-semibold flex items-center gap-1.5 px-4 py-2 rounded-lg"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Download PDF</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
