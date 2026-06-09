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
  Send
} from "lucide-react";
import { Button } from "../../components/ui/button";

// Extended form-only item type (frontend-only, not persisted to PRItem type)
interface FormItem {
  itemCode: string;
  name: string;
  supplierCode: string;
  supplierName: string;
  unit: string;
  price: number;
  quantity: number;
  remark: string;
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

  // ── Section B: PR Request Information ─────────────────────
  const [purpose, setPurpose] = useState("");
  const [prType, setPrType] = useState<"New" | "Repeat Order" | "Repeat Order Remake">("New");
  const [prCharge, setPrCharge] = useState("");

  // ── Section C: Items ───────────────────────────────────────
  const [items, setItems] = useState<FormItem[]>([
    { itemCode: "", name: "", supplierCode: "", supplierName: "", unit: "Units", price: 0, quantity: 1, remark: "" }
  ]);

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
  const handleAddItem = () => {
    setItems([
      ...items,
      { itemCode: "", name: "", supplierCode: "", supplierName: "", unit: "Units", price: 0, quantity: 1, remark: "" }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof FormItem, value: string | number) => {
    const updated = [...items];
    if (field === "quantity" || field === "price") {
      (updated[index] as any)[field] = Number(value);
    } else {
      (updated[index] as any)[field] = value;
    }
    // Auto-fill supplierCode if empty on blur — handled via default value logic
    setItems(updated);
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
    }));

    createPR(
      {
        title,
        department,
        priority,
        purpose,
        items: finalizedItems,
        attachments,
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
                onClick={handleAddItem}
                className="flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("pr.item.add")}</span>
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
                  {/* Row header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      Item #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length === 1}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Row 1: Item Code, Item Name, Supplier Code, Supplier Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        {t("pr.field.item_code")}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., ITM-001"
                        value={item.itemCode}
                        onChange={(e) => handleItemChange(index, "itemCode", e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        {t("pr.item.name")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("pr.item.placeholder")}
                        value={item.name}
                        onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        {t("pr.field.supplier_code")}
                      </label>
                      <input
                        type="text"
                        placeholder={`AUTO-${index + 1}`}
                        value={item.supplierCode}
                        onChange={(e) => handleItemChange(index, "supplierCode", e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        {t("pr.field.supplier_name")}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., PT Maju Sejahtera"
                        value={item.supplierName}
                        onChange={(e) => handleItemChange(index, "supplierName", e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 2: Unit, Price, Quantity, Amount (read-only), Remark */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        {t("pr.item.unit")}
                      </label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        {t("pr.item.price")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={item.price || ""}
                        onChange={(e) => handleItemChange(index, "price", e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        {t("pr.item.qty")}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        {t("pr.field.amount")}
                      </label>
                      <div className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground font-semibold">
                        {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        {t("pr.field.remark")}
                      </label>
                      <input
                        type="text"
                        placeholder="Optional note..."
                        value={item.remark}
                        onChange={(e) => handleItemChange(index, "remark", e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Grand total panel */}
              <div className="p-4 bg-muted/40 border border-border rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  {t("pr.total.estimated")}
                </span>
                <span className="text-lg font-extrabold text-foreground">
                  ${grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
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

          {/* Section E: PR Approval */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                {t("pr.form.approval")}
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <Send className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="text-muted-foreground">{t("pr.approver.label")}</span>{" "}
                  <span className="font-bold text-primary">{approverLevel}</span>
                </p>
              </div>
            </div>
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
                    <td colSpan={8} className="py-3 px-4 text-right text-muted-foreground">
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
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                {t("pr.form.approval")}
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <Send className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="text-muted-foreground">{t("pr.approver.label")}</span>{" "}
                  <span className="font-bold text-primary">{approverLevel}</span>
                </p>
              </div>
            </div>
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
