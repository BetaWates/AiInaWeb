import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProcurement } from "../../contexts";
import type { PRItem } from "../../types";
import { useLanguage  } from "../../contexts";
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Check, 
  UploadCloud, 
  AlertCircle,
  Paperclip,
  CheckCircle2,
  Send,
  ChevronDown
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { ShieldCheck } from "lucide-react";

// Extended form-only item type (frontend-only, now includes all detail modal fields)
interface FormItem {
  type: string;
  expenseNo: string;
  rfiNo: string;
  faCode: string;
  rfiNoNonEfam: string;
  faCodeNonEfam: string;
  itemCode: string;
  name: string;
  supplierCode: string;
  supplierName: string;
  dueDate: string;
  unit: string;
  price: number;
  quantity: number;
  remark: string;
  repeatOrder: string;
  repeatOrderRemark: string;
}

export function CreatePR() {
  const navigate = useNavigate();
  const { createPR, departments } = useProcurement();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);

  // ── Section A: PR Information ──────────────────────────────
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState(departments[0] || "IT & Systems");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [approverLevel, setApproverLevel] = useState<"Direktur" | "Presiden Direktur">("Direktur");

  // Four separate approver state objects (initialized with placeholder names)
  const [approver1, setApprover1] = useState({ name: "Budi Santoso", remark: "", bypass: false });
  const [approver2, setApprover2] = useState({ name: "Sarah Approver", remark: "", bypass: false });
  const [approver3, setApprover3] = useState({ name: "Rian Hidayat", remark: "", bypass: false });
  const [approver4, setApprover4] = useState({ name: "Hendra Wijaya", remark: "", bypass: false });

  const getDestinationMessage = () => {
    if (approver1.bypass && approver2.bypass && approver3.bypass && approver4.bypass) {
      return (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4">
          <span>⚠️ All approvers bypassed — PR will go directly to Purchasing.</span>
        </div>
      );
    }
    let targetName = "";
    if (!approver1.bypass) targetName = approver1.name;
    else if (!approver2.bypass) targetName = approver2.name;
    else if (!approver3.bypass) targetName = approver3.name;
    else if (!approver4.bypass) targetName = approver4.name;

    return (
      <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4">
        <span>📨 This PR will be sent to: {targetName || "(Pending Name)"}</span>
      </div>
    );
  };

  // ── Section B: PR Request Information ─────────────────────
  const [purpose, setPurpose] = useState("");
  const [prType, setPrType] = useState<"New" | "Repeat Order" | "Repeat Order Remake">("New");
  const [prCharge, setPrCharge] = useState("");

  // ── Section C: Items ───────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<FormItem>({
    type: "CAPEX",
    expenseNo: "",
    rfiNo: "None",
    faCode: "None",
    rfiNoNonEfam: "",
    faCodeNonEfam: "",
    itemCode: "",
    name: "",
    supplierCode: "",
    supplierName: "",
    dueDate: "",
    unit: "Units",
    price: 0,
    quantity: 1,
    remark: "",
    repeatOrder: "NEW",
    repeatOrderRemark: ""
  });
  const [items, setItems] = useState<FormItem[]>([]);

  // ── Section D: Attachments ─────────────────────────────────
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // ── Error ──────────────────────────────────────────────────
  const [errorMsg, setErrorMsg] = useState("");

  // 2-step stepper definition
  const steps = [
    { num: 1, label: t("pr.form.fill") },
    { num: 2, label: t("pr.form.review") },
  ];

  // ── Item management ────────────────────────────────────────
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveItem = () => {
    if (!newItem.name.trim()) {
      setErrorMsg("Item Name is required in the PR Detail.");
      return;
    }
    if (newItem.price <= 0) {
      setErrorMsg("Price must be greater than 0.");
      return;
    }
    if (newItem.quantity <= 0) {
      setErrorMsg("Quantity must be greater than 0.");
      return;
    }

    const nextIndex = items.length + 1;
    const finalItem: FormItem = {
      ...newItem,
      supplierCode: newItem.supplierCode.trim() || `AUTO-${nextIndex}`
    };

    setItems([...items, finalItem]);
    setIsModalOpen(false);
    setErrorMsg("");
  };

  // ── Attachment upload simulation ───────────────────────────
  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      setErrorMsg("");
      const fileNames = Array.from(e.target.files).map(f => f.name);
      setTimeout(() => {
        setAttachments(prev => [...prev, ...fileNames]);
        setUploading(false);
      }, 1000);
    }
  };

  const removeAttachment = (name: string) => {
    setAttachments(prev => prev.filter(f => f !== name));
  };

  const grandTotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  // ── Validation (Step 1 only) ───────────────────────────────
  const validateStep1 = () => {
    setErrorMsg("");
    if (!title.trim()) {
      setErrorMsg(t("pr.title") + " is required.");
      return false;
    }
    if (!purpose.trim()) {
      setErrorMsg(t("pr.purpose") + " is required.");
      return false;
    }
    const hasItemName = items.some(item => item.name.trim() !== "");
    if (!hasItemName) {
      setErrorMsg("At least one item must have an item name.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setErrorMsg("");
    setStep(1);
  };

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmitForm = (isSubmit: boolean) => {
    // Map form items back to PRItem shape for context
    const finalizedItems: PRItem[] = items.map((item, index) => ({
      id: `ITEM-${Date.now()}-${index}`,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      type: item.type,
      expenseNo: item.expenseNo,
      rfiNo: item.rfiNo,
      faCode: item.faCode,
      rfiNoNonEfam: item.rfiNoNonEfam,
      faCodeNonEfam: item.faCodeNonEfam,
      itemCode: item.itemCode,
      supplierCode: item.supplierCode,
      supplierName: item.supplierName,
      dueDate: item.dueDate,
      remark: item.remark,
      repeatOrder: item.repeatOrder,
      repeatOrderRemark: item.repeatOrderRemark,
    }));

    createPR(
      {
        title,
        department,
        priority,
        purpose,
        items: finalizedItems,
        attachments,
        approvalFlow: [
          { level: 1, role: "Ass. Manager", ...approver1 },
          { level: 2, role: "Manager", ...approver2 },
          { level: 3, role: "General Manager", ...approver3 },
          { level: 4, role: "President Director", ...approver4 },
        ],
      },
      isSubmit
    );

    navigate("/employee/my-pr");
  };

  // ── Priority badge colour helper ───────────────────────────
  const priorityColor: Record<string, string> = {
    Low: "text-emerald-600 bg-emerald-500/10",
    Medium: "text-amber-500 bg-amber-500/10",
    High: "text-orange-500 bg-orange-500/10",
    Urgent: "text-destructive bg-destructive/10",
  };

  // ── Resolved supplier code display (AUTO-{n} if empty) ────
  const resolvedSupplierCode = (item: FormItem, index: number) =>
    item.supplierCode.trim() || `AUTO-${index + 1}`;

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Page Title ───────────────────────────────────── */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h2 className="text-xl font-bold text-foreground">{t("employee.create_pr")}</h2>
        <p className="text-xs text-muted-foreground mt-1">{t("pr.form.subtitle")}</p>
      </div>

      {/* ── 2-Step Stepper ───────────────────────────────── */}
      <div className="bg-card p-5 rounded-2xl border border-border shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[280px] px-4">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-md"
                    : step > s.num
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground border border-border"
                }`}>
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap ${
                  step === s.num ? "text-foreground font-bold" : "text-muted-foreground"
                }`}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-[2px] mx-4 transition-all ${
                  step > s.num ? "bg-emerald-500" : "bg-border"
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Error Banner ─────────────────────────────────── */}
      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          STEP 1 — FULL FORM
      ════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div className="space-y-5">

          {/* Section A: PR Information */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                {t("pr.form.pr_information")}
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Requisition Title */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wide">
                  {t("pr.title")}
                </label>
                <input
                  type="text"
                  placeholder={t("pr.title.placeholder")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wide">
                  {t("pr.department")}
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wide">
                  {t("pr.priority")}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="Low">{t("pr.priority.low")}</option>
                  <option value="Medium">{t("pr.priority.medium")}</option>
                  <option value="High">{t("pr.priority.high")}</option>
                  <option value="Urgent">{t("pr.priority.urgent")}</option>
                </select>
              </div>

              {/* Approver Level */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wide">
                  {t("pr.field.approver_level")}
                </label>
                <div className="flex gap-4">
                  {(["Direktur", "Presiden Direktur"] as const).map((level) => (
                    <label
                      key={level}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                        approverLevel === level
                          ? "border-primary bg-primary/5 text-foreground font-semibold ring-1 ring-primary"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <input
                        type="radio"
                        name="approverLevel"
                        value={level}
                        checked={approverLevel === level}
                        onChange={() => setApproverLevel(level)}
                        className="accent-primary"
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PR Approval Flow Section */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                PR Approval Flow
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {getDestinationMessage()}
              
              <div className="space-y-4">
                {[
                  { id: 1, role: "Ass. Manager", state: approver1, setState: setApprover1 },
                  { id: 2, role: "Manager", state: approver2, setState: setApprover2 },
                  { id: 3, role: "General Manager", state: approver3, setState: setApprover3 },
                  { id: 4, role: "President Director", state: approver4, setState: setApprover4 },
                ].map((level) => (
                  <div 
                    key={level.id} 
                    className={`p-4 rounded-xl border transition-all grid grid-cols-1 sm:grid-cols-12 gap-4 items-center ${
                      level.state.bypass 
                        ? "border-muted bg-muted/20 opacity-50" 
                        : "border-border bg-card"
                    }`}
                  >
                    {/* Label */}
                    <div className="sm:col-span-3">
                      <span className="text-xs font-bold text-foreground block">
                        Approver {level.id} — {level.role}
                      </span>
                    </div>

                    {/* Name Input */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Name
                      </label>
                      <input
                        type="text"
                        placeholder="Name..."
                        value={level.state.name}
                        disabled={level.state.bypass}
                        onChange={(e) => level.setState(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-muted/50 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Remark Input */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Remark
                      </label>
                      <input
                        type="text"
                        placeholder="Optional remark..."
                        value={level.state.remark}
                        disabled={level.state.bypass}
                        onChange={(e) => level.setState(prev => ({ ...prev, remark: e.target.value }))}
                        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-muted/50 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Bypass Checkbox */}
                    <div className="sm:col-span-2 flex items-center gap-2 pt-4 sm:pt-0">
                      <input
                        type="checkbox"
                        id={`bypass-${level.id}`}
                        checked={level.state.bypass}
                        onChange={(e) => level.setState(prev => ({ ...prev, bypass: e.target.checked }))}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                      <label 
                        htmlFor={`bypass-${level.id}`}
                        className="text-xs font-semibold text-foreground cursor-pointer select-none"
                      >
                        By Pass (skip this level)
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section B: PR Request Information */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                {t("pr.form.request_info")}
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Purpose / Justification */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wide">
                  {t("pr.purpose")}
                </label>
                <textarea
                  rows={4}
                  placeholder={t("pr.purpose.placeholder")}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                />
              </div>

              {/* PR Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wide">
                  {t("pr.field.pr_type")}
                </label>
                <select
                  value={prType}
                  onChange={(e) => setPrType(e.target.value as any)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Repeat Order">Repeat Order</option>
                  <option value="Repeat Order Remake">Repeat Order Remake</option>
                </select>
              </div>

              {/* PR Charge */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wide">
                  {t("pr.field.pr_charge")}
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cost Center 1001"
                  value={prCharge}
                  onChange={(e) => setPrCharge(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section C: PR Detail — Item Table */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                {t("pr.form.detail")}
              </h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNewItem({
                    type: "CAPEX",
                    expenseNo: "",
                    rfiNo: "None",
                    faCode: "None",
                    rfiNoNonEfam: "",
                    faCodeNonEfam: "",
                    itemCode: "",
                    name: "",
                    supplierCode: "",
                    supplierName: "",
                    dueDate: "",
                    unit: "Units",
                    price: 0,
                    quantity: 1,
                    remark: "",
                    repeatOrder: "NEW",
                    repeatOrderRemark: "",
                  });
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("pr.item.add")}</span>
              </Button>
            </div>
            
            <div className="p-6">
              {items.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                  {t("pr.item.no_items")}
                </div>
              ) : (
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-sidebar/20 text-muted-foreground font-bold">
                        <th className="py-2.5 px-4 whitespace-nowrap">#</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">{t("pr.field.item_code")}</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">Type</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">{t("pr.item.name")}</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">{t("pr.field.supplier_code")}</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">{t("pr.field.supplier_name")}</th>
                        <th className="py-2.5 px-4 whitespace-nowrap text-center">U M</th>
                        <th className="py-2.5 px-4 whitespace-nowrap text-right">{t("pr.item.price")}</th>
                        <th className="py-2.5 px-4 whitespace-nowrap text-center">{t("pr.item.qty")}</th>
                        <th className="py-2.5 px-4 whitespace-nowrap text-right">{t("pr.field.amount")}</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">Remark</th>
                        <th className="py-2.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-foreground">
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/10">
                          <td className="py-2.5 px-4 text-muted-foreground">{idx + 1}</td>
                          <td className="py-2.5 px-4 font-mono">{item.itemCode || "—"}</td>
                          <td className="py-2.5 px-4 font-mono text-muted-foreground">{item.type}</td>
                          <td className="py-2.5 px-4 font-medium max-w-[160px] truncate">{item.name}</td>
                          <td className="py-2.5 px-4 font-mono text-muted-foreground">{resolvedSupplierCode(item, idx)}</td>
                          <td className="py-2.5 px-4">{item.supplierName || "—"}</td>
                          <td className="py-2.5 px-4 text-center text-muted-foreground">{item.unit}</td>
                          <td className="py-2.5 px-4 text-right">${item.price.toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-center">{item.quantity}</td>
                          <td className="py-2.5 px-4 text-right font-semibold">${(item.price * item.quantity).toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-muted-foreground max-w-[100px] truncate">{item.remark || "—"}</td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-sidebar/10 font-bold border-t-2 border-border">
                        <td colSpan={9} className="py-3 px-4 text-right text-muted-foreground">
                          {t("pr.grand.total")}:
                        </td>
                        <td className="py-3 px-4 text-right text-primary text-sm">${grandTotal.toLocaleString()}</td>
                        <td colSpan={2} />
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Dialog for Add PR Detail */}
            <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setErrorMsg(""); }}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl">
                <DialogHeader className="border-b border-border pb-4 mb-4">
                  <DialogTitle className="text-lg font-bold text-foreground">Add PR Detail</DialogTitle>
                </DialogHeader>

                {errorMsg && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2 text-xs mb-4">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Row 1: TYPE (dropdown, left) | EXPENSE NO (input with dropdown arrow, right) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Type
                      </label>
                      <select
                        value={newItem.type}
                        onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                        className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                      >
                        <option value="CAPEX">CAPEX</option>
                        <option value="OPEX">OPEX</option>
                        <option value="INVENTORY">INVENTORY</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Expense No
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          list="expense-numbers"
                          placeholder="Select or enter Expense No..."
                          value={newItem.expenseNo}
                          onChange={(e) => setNewItem({ ...newItem, expenseNo: e.target.value })}
                          className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg pl-3 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        />
                        <datalist id="expense-numbers">
                          <option value="EXP-2026-001" />
                          <option value="EXP-2026-002" />
                          <option value="EXP-2026-003" />
                          <option value="EXP-2026-004" />
                        </datalist>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: RFI NO (dropdown, left) | FA CODE (dropdown, middle) | RFI NO - NON EFAM (input, right) | FA CODE - NON EFAM (input, far right) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        RFI No
                      </label>
                      <select
                        value={newItem.rfiNo}
                        onChange={(e) => setNewItem({ ...newItem, rfiNo: e.target.value })}
                        className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                      >
                        <option value="None">None</option>
                        <option value="RFI-2026-001">RFI-2026-001</option>
                        <option value="RFI-2026-002">RFI-2026-002</option>
                        <option value="RFI-2026-003">RFI-2026-003</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        FA Code
                      </label>
                      <select
                        value={newItem.faCode}
                        onChange={(e) => setNewItem({ ...newItem, faCode: e.target.value })}
                        className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                      >
                        <option value="None">None</option>
                        <option value="FA-IT-001">FA-IT-001</option>
                        <option value="FA-IT-002">FA-IT-002</option>
                        <option value="FA-OFC-101">FA-OFC-101</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        RFI No - Non EFAM
                      </label>
                      <input
                        type="text"
                        placeholder="RFI No..."
                        value={newItem.rfiNoNonEfam}
                        onChange={(e) => setNewItem({ ...newItem, rfiNoNonEfam: e.target.value })}
                        className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        FA Code - Non EFAM
                      </label>
                      <input
                        type="text"
                        placeholder="FA Code..."
                        value={newItem.faCodeNonEfam}
                        onChange={(e) => setNewItem({ ...newItem, faCodeNonEfam: e.target.value })}
                        className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 3: ITEM CODE (input, left) | ITEM NAME (input, right) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 md:col-span-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Item Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., ITM-001"
                        value={newItem.itemCode}
                        onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })}
                        className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Item Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter item name / specs..."
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 4: SUPPLIER CODE (input, left, grayed/read-only) | SUPPLIER NAME (input, right) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 md:col-span-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Supplier Code
                      </label>
                      <input
                        type="text"
                        value={`AUTO-${items.length + 1}`}
                        readOnly
                        disabled
                        className="w-full bg-muted/60 dark:bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed outline-none"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Supplier Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., PT Maju Sejahtera"
                        value={newItem.supplierName}
                        onChange={(e) => setNewItem({ ...newItem, supplierName: e.target.value })}
                        className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 5: DUE DATE (date input, left) | U M (dropdown, middle) | PRICE (number input) | QTY (number input, auto-calc) | AMOUNT (number input, auto-calc read-only) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={newItem.dueDate}
                        onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                        className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        U M
                      </label>
                      <select
                        value={newItem.unit}
                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                        className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                      >
                        <option value="Units">Units</option>
                        <option value="Pcs">Pcs</option>
                        <option value="Box">Box</option>
                        <option value="Set">Set</option>
                        <option value="Kg">Kg</option>
                        <option value="Ltr">Ltr</option>
                        <option value="Mtr">Mtr</option>
                        <option value="Pack">Pack</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={newItem.price || ""}
                        onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={newItem.quantity || ""}
                        onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                        className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Amount
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`$${(newItem.price * newItem.quantity).toLocaleString()}`}
                        className="w-full bg-muted/60 dark:bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground font-semibold cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 6: REMARK (full-width textarea) */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      Remark
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Optional remark..."
                      value={newItem.remark}
                      onChange={(e) => setNewItem({ ...newItem, remark: e.target.value })}
                      className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                    />
                  </div>

                  {/* Row 7: REPEAT ORDER (dropdown: NEW/REPEAT, left) | REPEAT ORDER REMARK (input, right) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 md:col-span-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Repeat Order
                      </label>
                      <select
                        value={newItem.repeatOrder}
                        onChange={(e) => setNewItem({ ...newItem, repeatOrder: e.target.value })}
                        className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                      >
                        <option value="NEW">NEW</option>
                        <option value="REPEAT">REPEAT</option>
                      </select>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Repeat Order Remark
                      </label>
                      <input
                        type="text"
                        placeholder="Repeat order details..."
                        value={newItem.repeatOrderRemark}
                        onChange={(e) => setNewItem({ ...newItem, repeatOrderRemark: e.target.value })}
                        className="w-full bg-input-background dark:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6 flex flex-row justify-end gap-3 border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false);
                      setErrorMsg("");
                    }}
                    className="bg-muted hover:bg-muted/80 text-foreground border-border cursor-pointer text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveItem}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-none cursor-pointer text-xs font-semibold px-4 py-2 rounded-lg"
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Section D: Upload Attachment */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                {t("pr.form.attachments")}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-all cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleFileDrop}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-9 h-9 text-muted-foreground mb-3" />
                <p className="text-sm font-semibold text-foreground">{t("pr.attachment.label")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("pr.attachment.desc")}</p>
                {uploading && (
                  <p className="text-xs text-primary font-medium mt-3 animate-pulse">
                    {t("pr.attachment.uploading")}
                  </p>
                )}
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                    {t("pr.attachment.files")}
                  </h4>
                  <div className="space-y-1.5">
                    {attachments.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/40 border border-border rounded-lg text-xs">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{file}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(file)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section E: PR Approval Collapsible Threshold Section */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className="px-6 py-4 bg-muted/30 hover:no-underline flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span className="font-bold text-sm text-foreground uppercase tracking-wider font-semibold">
                      {t("pr.form.approval")} Thresholds
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6">
                  <div className="space-y-4">
                    {/* Information alert banner showing current PR total in USD and IDR */}
                    <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <span className="text-muted-foreground">Current Estimated Total: </span>
                        <strong className="text-foreground">${grandTotal.toLocaleString()} USD</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">IDR Equivalent (1 USD = 15,000 IDR): </span>
                        <strong className="text-primary font-bold">Rp {(grandTotal * 15000).toLocaleString()} IDR</strong>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-border rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-border bg-sidebar/20 text-muted-foreground font-bold">
                            <th className="py-2.5 px-4 text-center">Level</th>
                            <th className="py-2.5 px-4">Approver Role</th>
                            <th className="py-2.5 px-4 text-right">Min Amount (IDR)</th>
                            <th className="py-2.5 px-4 text-right">Max Amount (IDR)</th>
                            <th className="py-2.5 px-4">Approver Name</th>
                            <th className="py-2.5 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-foreground">
                          {[
                            { level: 1, role: "Supervisor", min: 0, max: 5000000, maxText: "5,000,000", state: approver1, setState: setApprover1 },
                            { level: 2, role: "Manager", min: 5000001, max: 25000000, maxText: "25,000,000", state: approver2, setState: setApprover2 },
                            { level: 3, role: "Director", min: 25000001, max: 100000000, maxText: "100,000,000", state: approver3, setState: setApprover3 },
                            { level: 4, role: "President Director", min: 100000001, max: Infinity, maxText: "unlimited", state: approver4, setState: setApprover4 },
                          ].map((levelObj) => {
                            const totalIDR = grandTotal * 15000;
                            const isActive = totalIDR >= levelObj.min && totalIDR <= levelObj.max;

                            return (
                              <tr
                                key={levelObj.level}
                                className={`transition-colors duration-150 ${
                                  isActive
                                    ? "bg-blue-500/10 dark:bg-blue-500/5 font-semibold border-l-4 border-l-blue-500"
                                    : "hover:bg-muted/10"
                                }`}
                              >
                                <td className="py-3 px-4 text-center">{levelObj.level}</td>
                                <td className="py-3 px-4">{levelObj.role}</td>
                                <td className="py-3 px-4 text-right">Rp {levelObj.min.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right">
                                  {levelObj.max === Infinity ? "unlimited" : `Rp ${levelObj.maxText}`}
                                </td>
                                <td className="py-2 px-4 min-w-[200px]">
                                  <input
                                    type="text"
                                    value={levelObj.state.name}
                                    onChange={(e) => levelObj.setState({ ...levelObj.state, name: e.target.value })}
                                    className="bg-input-background dark:bg-muted/30 border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors w-full"
                                  />
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {isActive ? (
                                    <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                                      Active Level
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground/40 text-[10px]">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Step 1 Navigation */}
          <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <div />
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/employee/dashboard")}
                className="w-full sm:w-auto cursor-pointer"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t("pr.form.review")}</span>
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          STEP 2 — REVIEW & SUBMIT
      ════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div className="space-y-5">

          {/* Review: PR Information */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                {t("pr.form.pr_information")}
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">{t("pr.title")}</span>
                <span className="text-sm font-semibold text-foreground">{title}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">{t("pr.department")}</span>
                <span className="text-sm font-semibold text-foreground">{department}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">{t("pr.priority")}</span>
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full inline-block ${priorityColor[priority]}`}>
                  {priority}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">{t("pr.field.approver_level")}</span>
                <span className="text-sm font-semibold text-foreground">{approverLevel}</span>
              </div>
            </div>
          </div>

          {/* Review: PR Approval Flow */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                PR Approval Flow Summary
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {[
                { level: 1, role: "Ass. Manager", ...approver1 },
                { level: 2, role: "Manager", ...approver2 },
                { level: 3, role: "General Manager", ...approver3 },
                { level: 4, role: "President Director", ...approver4 },
              ].map((app) => (
                <div key={app.level} className="flex justify-between items-center text-xs border-b border-border/40 pb-2 last:border-b-0 last:pb-0">
                  <div>
                    <span className="font-bold text-foreground">Level {app.level} ({app.role}): </span>
                    <span className={app.bypass ? "text-muted-foreground italic" : "font-medium text-foreground"}>
                      {app.bypass ? "Bypassed" : app.name || "(No Name Entered)"}
                    </span>
                    {app.remark && !app.bypass && (
                      <span className="text-[10px] text-muted-foreground ml-2">({app.remark})</span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    app.bypass 
                      ? "bg-muted text-muted-foreground border-muted-foreground/30" 
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  }`}>
                    {app.bypass ? "Bypassed" : "Active"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review: PR Request Information */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                {t("pr.form.request_info")}
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">{t("pr.purpose")}</span>
                <p className="text-xs text-foreground leading-relaxed">{purpose}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">{t("pr.field.pr_type")}</span>
                <span className="text-sm font-semibold text-foreground">{prType}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">{t("pr.field.pr_charge")}</span>
                <span className="text-sm font-semibold text-foreground">{prCharge || "—"}</span>
              </div>
            </div>
          </div>

          {/* Review: PR Detail items table */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                {t("pr.form.detail")}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-sidebar/20 text-muted-foreground font-bold">
                    <th className="py-2.5 px-4 whitespace-nowrap">#</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">{t("pr.field.item_code")}</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">Type</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">{t("pr.item.name")}</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">{t("pr.field.supplier_code")}</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">{t("pr.field.supplier_name")}</th>
                    <th className="py-2.5 px-4 whitespace-nowrap text-center">{t("pr.item.unit")}</th>
                    <th className="py-2.5 px-4 whitespace-nowrap text-right">{t("pr.item.price")}</th>
                    <th className="py-2.5 px-4 whitespace-nowrap text-center">{t("pr.item.qty")}</th>
                    <th className="py-2.5 px-4 whitespace-nowrap text-right">{t("pr.field.amount")}</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">{t("pr.field.remark")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/10">
                      <td className="py-2.5 px-4 text-muted-foreground">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-mono">{item.itemCode || "—"}</td>
                      <td className="py-2.5 px-4 font-mono text-muted-foreground">{item.type || "—"}</td>
                      <td className="py-2.5 px-4 font-medium max-w-[160px] truncate">{item.name}</td>
                      <td className="py-2.5 px-4 font-mono text-muted-foreground">{resolvedSupplierCode(item, idx)}</td>
                      <td className="py-2.5 px-4">{item.supplierName || "—"}</td>
                      <td className="py-2.5 px-4 text-center text-muted-foreground">{item.unit}</td>
                      <td className="py-2.5 px-4 text-right">${item.price.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-center">{item.quantity}</td>
                      <td className="py-2.5 px-4 text-right font-semibold">${(item.price * item.quantity).toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-muted-foreground max-w-[100px] truncate">{item.remark || "—"}</td>
                    </tr>
                  ))}
                  <tr className="bg-sidebar/10 font-bold border-t-2 border-border">
                    <td colSpan={9} className="py-3 px-4 text-right text-muted-foreground">
                      {t("pr.grand.total")}:
                    </td>
                    <td className="py-3 px-4 text-right text-primary text-sm">${grandTotal.toLocaleString()}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Review: Attachments */}
          {attachments.length > 0 && (
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                  {t("pr.attachment.docs")}
                </h3>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-muted border border-border rounded-lg text-xs">
                      <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-foreground">{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Review: Approval */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <Accordion type="single" collapsible defaultValue="item-2">
              <AccordionItem value="item-2" className="border-none">
                <AccordionTrigger className="px-6 py-4 bg-muted/30 hover:no-underline flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span className="font-bold text-sm text-foreground uppercase tracking-wider font-semibold">
                      PR Approval Routing
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <span className="text-muted-foreground">Estimated Requisition Value: </span>
                        <strong className="text-foreground">${grandTotal.toLocaleString()} USD</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">IDR Threshold Amount: </span>
                        <strong className="text-primary font-bold">Rp {(grandTotal * 15000).toLocaleString()} IDR</strong>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-border rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-border bg-sidebar/20 text-muted-foreground font-bold">
                            <th className="py-2.5 px-4 text-center">Level</th>
                            <th className="py-2.5 px-4">Approver Role</th>
                            <th className="py-2.5 px-4 text-right">Min Amount (IDR)</th>
                            <th className="py-2.5 px-4 text-right">Max Amount (IDR)</th>
                            <th className="py-2.5 px-4">Approver Name</th>
                            <th className="py-2.5 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-foreground">
                          {[
                            { level: 1, role: "Supervisor", min: 0, max: 5000000, maxText: "5,000,000", state: approver1 },
                            { level: 2, role: "Manager", min: 5000001, max: 25000000, maxText: "25,000,000", state: approver2 },
                            { level: 3, role: "Director", min: 25000001, max: 100000000, maxText: "100,000,000", state: approver3 },
                            { level: 4, role: "President Director", min: 100000001, max: Infinity, maxText: "unlimited", state: approver4 },
                          ].map((levelObj) => {
                            const totalIDR = grandTotal * 15000;
                            const isActive = totalIDR >= levelObj.min && totalIDR <= levelObj.max;

                            return (
                              <tr
                                key={levelObj.level}
                                className={`transition-colors duration-150 ${
                                  isActive
                                    ? "bg-blue-500/10 dark:bg-blue-500/5 font-semibold border-l-4 border-l-blue-500"
                                    : "hover:bg-muted/10 text-muted-foreground/80"
                                }`}
                              >
                                <td className="py-3 px-4 text-center">{levelObj.level}</td>
                                <td className="py-3 px-4">{levelObj.role}</td>
                                <td className="py-3 px-4 text-right">Rp {levelObj.min.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right">
                                  {levelObj.max === Infinity ? "unlimited" : `Rp ${levelObj.maxText}`}
                                </td>
                                <td className="py-3 px-4 font-medium">{levelObj.state.name || "(Empty)"}</td>
                                <td className="py-3 px-4 text-center">
                                  {isActive ? (
                                    <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                                      Active Level
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground/40 text-[10px]">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Step 2 Navigation */}
          <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="w-full sm:w-auto flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("common.back")}</span>
            </Button>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmitForm(false)}
                className="w-full sm:w-auto cursor-pointer"
              >
                {t("pr.save.draft")}
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmitForm(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:opacity-90"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t("pr.submit.button")}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
