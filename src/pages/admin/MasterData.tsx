import React, { useState } from "react";
import { useProcurement } from "../../contexts";
import { useLanguage  } from "../../contexts";
import { Plus, Trash2, ShieldCheck, CheckCircle2, DollarSign, Settings } from "lucide-react";
import { Button } from "../../components/ui/button";

export function MasterData() {
  const { departments, addDepartment, removeDepartment } = useProcurement();
  const { t } = useLanguage();

  const [newDept, setNewDept] = useState("");
  const [success, setSuccess] = useState(false);

  // System Configurations
  const [currency, setCurrency] = useState("USD ($)");
  const [autoApproveLimit, setAutoApproveLimit] = useState(1000);
  const [allowDraftUpload, setAllowDraftUpload] = useState(true);

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDept.trim() && !departments.includes(newDept.trim())) {
      addDepartment(newDept.trim());
      setNewDept("");
      showSuccessBanner();
    }
  };

  const handleRemoveDept = (dept: string) => {
    if (departments.length > 1) {
      removeDepartment(dept);
      showSuccessBanner();
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccessBanner();
  };

  const showSuccessBanner = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h2 className="text-xl font-bold text-foreground">{t("admin.master_data")}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Configure master organizational divisions and adjust procurement workflows limits.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Master Configurations updated successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department List */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Organizational Departments</span>
          </h3>

          <form onSubmit={handleAddDept} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Sales & Support"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
            <Button type="submit" size="sm" className="cursor-pointer">
              <Plus className="w-4 h-4 mr-1" />
              <span>Add</span>
            </Button>
          </form>

          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden max-h-[250px] overflow-y-auto">
            {departments.map((dept) => (
              <div key={dept} className="flex justify-between items-center p-3 text-xs text-foreground bg-muted/20">
                <span className="font-semibold">{dept}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDept(dept)}
                  disabled={departments.length <= 1}
                  className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* General Configurations */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <span>Procurement Configurations</span>
          </h3>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            {/* Currency */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
              >
                <option value="USD ($)">USD ($) — US Dollars</option>
                <option value="IDR (Rp)">IDR (Rp) — Indonesian Rupiah</option>
                <option value="EUR (€)">EUR (€) — Euro</option>
                <option value="GBP (£)">GBP (£) — British Pound</option>
              </select>
            </div>

            {/* Auto approve limit */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">
                Auto-Approve Threshold Limit
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="number"
                  value={autoApproveLimit}
                  onChange={(e) => setAutoApproveLimit(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Requisitions under this amount bypass secondary director approval rules.
              </p>
            </div>

            {/* Toggle File Upload */}
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border">
              <div>
                <h4 className="text-xs font-semibold text-foreground">Excel Document Parsing</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Allow users to upload excel files for PR generation</p>
              </div>
              <input
                type="checkbox"
                checked={allowDraftUpload}
                onChange={() => setAllowDraftUpload(!allowDraftUpload)}
                className="w-4 h-4 rounded text-primary border-border bg-background focus:ring-1 focus:ring-primary cursor-pointer accent-primary"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full cursor-pointer">
                Save Configurations
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
