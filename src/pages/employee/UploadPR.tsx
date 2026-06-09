import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProcurement } from "../../contexts";
import { useLanguage  } from "../../contexts";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  ArrowRight,
  Database,
  ArrowDownToLine,
  RefreshCw
} from "lucide-react";
import { Button } from "../../components/ui/button";

export function UploadPR() {
  const navigate = useNavigate();
  const { createPR, departments } = useProcurement();
  const { t } = useLanguage();

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<{
    title: string;
    department: string;
    priority: "Low" | "Medium" | "High" | "Urgent";
    purpose: string;
    items: { name: string; quantity: number; unit: string; price: number }[];
  } | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFile(file);
    setLoading(true);
    setParsedData(null);

    // Simulate OCR and spreadsheet parsing
    setTimeout(() => {
      setLoading(false);
      setParsedData({
        title: "Bulk IT accessories order from excel upload",
        department: "IT & Systems",
        priority: "High",
        purpose: "Fulfilling developer desk peripheral requisitions.",
        items: [
          { name: "Logitech MX Master 3S Mouse", quantity: 6, unit: "Units", price: 99 },
          { name: "Keychron K2 Mechanical Keyboard", quantity: 6, unit: "Units", price: 89 },
          { name: "Dell 27\" 4K USB-C Monitor (U2723QE)", quantity: 3, unit: "Units", price: 450 }
        ]
      });
    }, 2000);
  };

  const handleClear = () => {
    setFile(null);
    setParsedData(null);
  };

  const handleSaveParsed = (isSubmit: boolean) => {
    if (!parsedData) return;

    // Add generated IDs
    const itemsWithIds = parsedData.items.map((it, idx) => ({
      ...it,
      id: `ITEM-UPLOAD-${Date.now()}-${idx}`
    }));

    createPR({
      title: parsedData.title,
      department: parsedData.department,
      priority: parsedData.priority,
      purpose: parsedData.purpose,
      items: itemsWithIds,
      attachments: [file?.name || "UploadedExcel.xlsx"]
    }, isSubmit);

    navigate("/employee/my-pr");
  };

  const grandTotal = parsedData?.items.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h2 className="text-xl font-bold text-foreground">{t("employee.upload_pr")}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Upload bulk requisitions using our Excel template. The system will scan and populate items automatically.
        </p>
      </div>

      {/* Upload Box */}
      {!file && (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all ${
            dragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
          }`}
        >
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-base font-bold text-foreground">{t("employee.upload.title")}</h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
            {t("employee.upload.desc")}
          </p>
          
          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex items-center gap-1.5 text-xs cursor-pointer">
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Download Excel Template</span>
            </Button>
          </div>
        </div>
      )}

      {/* Loading animation */}
      {loading && (
        <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mb-4" />
          <h3 className="text-sm font-bold text-foreground">{t("employee.upload.processing")}</h3>
          <p className="text-xs text-muted-foreground mt-1">Reading spreadsheet structure, validating data format...</p>
        </div>
      )}

      {/* Parsed Preview Area */}
      {parsedData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            {/* File header row */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-md">{file?.name}</span>
              </div>
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs text-rose-500 font-bold hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t("upload.reupload")}
              </button>
            </div>

            {/* Success banner */}
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center gap-2.5 text-xs">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{t("employee.upload.success")}</span>
            </div>

            {/* Preview title */}
            <h3 className="text-sm font-bold text-foreground">{t("upload.preview_title")}</h3>

            {/* Extracted Details Form (ReadOnly / Preview) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Extracted Request Title</span>
                <p className="text-sm font-semibold text-foreground">{parsedData.title}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Department</span>
                <p className="text-sm font-semibold text-foreground">{parsedData.department}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Extracted Priority</span>
                <p className="text-xs font-bold text-amber-500">{parsedData.priority}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Purpose Justification</span>
                <p className="text-xs text-foreground">{parsedData.purpose}</p>
              </div>
            </div>

            {/* Extracted Items */}
            <div className="space-y-3 pt-4">
              <h4 className="font-bold text-sm text-foreground">Extracted Line Items</h4>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-sidebar/20 text-muted-foreground font-bold">
                      <th className="py-2.5 px-4">Item Name</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4">Unit</th>
                      <th className="py-2.5 px-4 text-right">Unit Price</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground">
                    {parsedData.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-4 font-medium">{item.name}</td>
                        <td className="py-2.5 px-4 text-center">{item.quantity}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">{item.unit}</td>
                        <td className="py-2.5 px-4 text-right">${item.price}</td>
                        <td className="py-2.5 px-4 text-right font-semibold">${(item.quantity * item.price).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-sidebar/10 font-bold border-t border-border">
                      <td colSpan={4} className="py-3 px-4 text-right">Extracted Total Value:</td>
                      <td className="py-3 px-4 text-right text-primary">${grandTotal.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => handleSaveParsed(false)}
                className="cursor-pointer"
              >
                {t("pr.save.draft")}
              </Button>
              <Button
                onClick={() => handleSaveParsed(true)}
                className="flex items-center gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:opacity-90"
              >
                <Database className="w-4 h-4" />
                <span>{t("upload.confirm_create")}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
