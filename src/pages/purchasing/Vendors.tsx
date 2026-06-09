import React, { useState } from "react";
import { useProcurement } from "../../contexts";
import type { Vendor } from "../../types";
import { useLanguage  } from "../../contexts";
import { 
  Users, 
  Search, 
  Plus, 
  X, 
  Star, 
  Mail, 
  Tag, 
  Edit3, 
  Check, 
  Ban,
  AlertCircle
} from "lucide-react";
import { Button } from "../../components/ui/button";

export function Vendors() {
  const { vendors, addVendor, updateVendor } = useProcurement();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");
  const [contact, setContact] = useState("");
  const [rating, setRating] = useState(4.0);
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [errorMsg, setErrorMsg] = useState("");

  const filteredVendors = vendors.filter(v => {
    return v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
           v.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleToggleStatus = (id: string, currentStatus: "Active" | "Inactive") => {
    updateVendor(id, { status: currentStatus === "Active" ? "Inactive" : "Active" });
  };

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setName("");
    setCode(`VND-${Math.floor(1000 + Math.random() * 9000)}`);
    setCategory("Hardware & IT");
    setContact("");
    setRating(4.5);
    setStatus("Active");
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleOpenEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setName(vendor.name);
    setCode(vendor.code);
    setCategory(vendor.category);
    setContact(vendor.contact);
    setRating(vendor.rating);
    setStatus(vendor.status);
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Vendor name is required.");
      return;
    }
    if (!contact.trim()) {
      setErrorMsg("Contact email is required.");
      return;
    }

    if (editingVendor) {
      updateVendor(editingVendor.id, {
        name,
        code,
        category,
        contact,
        rating,
        status
      });
    } else {
      addVendor({
        name,
        code,
        category,
        contact,
        rating,
        status
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t("purchasing.vendors")}</h2>
          <p className="text-xs text-muted-foreground mt-1">Directory of pre-qualified suppliers and organizational service providers.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2 cursor-pointer shadow-md">
          <Plus className="w-4 h-4" />
          <span>Onboard Vendor</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center bg-background/50">
        <div className="flex-1 flex items-center bg-background border border-border rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-150">
          <Search className="w-4 h-4 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search by vendor name, code, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/60 w-full"
          />
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-sidebar/30">
                <th className="py-3 px-6">Vendor Code</th>
                <th className="py-3 px-6">Supplier Name</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Contact Email</th>
                <th className="py-3 px-6">Quality Rating</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-muted/10 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs font-semibold">{vendor.code}</td>
                  <td className="py-4 px-6 font-medium">{vendor.name}</td>
                  <td className="py-4 px-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-muted-foreground/75" />
                      <span>{vendor.category}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-muted-foreground/75" />
                      <span>{vendor.contact}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold">
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{vendor.rating.toFixed(1)}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      vendor.status === "Active" 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" 
                        : "bg-rose-500/10 text-rose-500 border-rose-500/30"
                    }`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(vendor.id, vendor.status)}
                        className={`p-2 rounded-lg hover:bg-muted transition-colors ${
                          vendor.status === "Active" ? "text-rose-500" : "text-emerald-500"
                        }`}
                        title={vendor.status === "Active" ? "Deactivate Vendor" : "Activate Vendor"}
                      >
                        {vendor.status === "Active" ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(vendor)}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                        title="Edit Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No vendors match the search queries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-border">
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-semibold text-foreground">{vendor.code}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  vendor.status === "Active" 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" 
                    : "bg-rose-500/10 text-rose-500 border-rose-500/30"
                }`}>
                  {vendor.status}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{vendor.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{vendor.category} • {vendor.contact}</p>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{vendor.rating.toFixed(1)} Rating</span>
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(vendor.id, vendor.status)}
                    className={`text-xs h-8 cursor-pointer ${
                      vendor.status === "Active" ? "text-rose-500 hover:text-rose-600" : "text-emerald-500 hover:text-emerald-600"
                    }`}
                  >
                    {vendor.status === "Active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(vendor)}
                    className="text-xs h-8 cursor-pointer"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filteredVendors.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No matching vendors found.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-sidebar/20">
              <h3 className="font-bold text-foreground text-base">
                {editingVendor ? "Edit Vendor Details" : "Onboard New Vendor"}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                
                {errorMsg && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Vendor Code (Auto-generated)</label>
                  <input
                    type="text"
                    disabled
                    value={code}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Vendor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp Supplies"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Vendor Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                  >
                    <option value="Hardware & IT">Hardware & IT</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Professional Services">Professional Services</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Contact Email</label>
                  <input
                    type="email"
                    placeholder="e.g. contact@acme.com"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Quality Rating (1.0 - 5.0)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Active Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                  >
                    <option value="Active">Active / Qualified</option>
                    <option value="Inactive">Inactive / Suspended</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border flex justify-end gap-2 bg-sidebar/20">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setModalOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer">
                  {editingVendor ? t("common.save") : t("common.add")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
