import React, { useState } from "react";
import { useProcurement } from "../../contexts";
import type { User } from "../../types";
import { useLanguage  } from "../../contexts";
import { 
  Users, 
  Search, 
  Plus, 
  X, 
  Mail, 
  Building2, 
  ShieldCheck, 
  UserPlus, 
  Ban, 
  Check, 
  Edit3,
  AlertCircle
} from "lucide-react";
import { Button } from "../../components/ui/button";

export function UserManagement() {
  const { users, addUser, updateUser, departments } = useProcurement();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Employee" | "Approver" | "Purchasing" | "Admin">("Employee");
  const [department, setDepartment] = useState("IT & Systems");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [errorMsg, setErrorMsg] = useState("");

  const filteredUsers = users.filter(u => {
    return u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           u.department.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleToggleStatus = (id: string, currentStatus: "Active" | "Inactive") => {
    updateUser(id, { status: currentStatus === "Active" ? "Inactive" : "Active" });
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setRole("Employee");
    setDepartment(departments[0] || "IT & Systems");
    setStatus("Active");
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setDepartment(user.department);
    setStatus(user.status);
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Enter a valid email address.");
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        name,
        email,
        role,
        department,
        status
      });
    } else {
      addUser({
        name,
        email,
        role,
        department,
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
          <h2 className="text-xl font-bold text-foreground">{t("admin.users")}</h2>
          <p className="text-xs text-muted-foreground mt-1">Configure staff directory, assign operational roles and departments.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2 cursor-pointer shadow-md">
          <UserPlus className="w-4 h-4" />
          <span>Add User Account</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center bg-background/50">
        <div className="flex-1 flex items-center bg-background border border-border rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-150">
          <Search className="w-4 h-4 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search users by name, email, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/60 w-full"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-sidebar/30">
                <th className="py-3 px-6">Staff Name</th>
                <th className="py-3 px-6">Email Address</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">Operational Role</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                  <td className="py-4 px-6 font-medium">{user.name}</td>
                  <td className="py-4 px-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground/75" />
                      <span>{user.email}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground/75" />
                      <span>{user.department}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-primary">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary/75" />
                      <span>{user.role}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      user.status === "Active" 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" 
                        : "bg-rose-500/10 text-rose-500 border-rose-500/30"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={`p-2 rounded-lg hover:bg-muted transition-colors ${
                          user.status === "Active" ? "text-rose-500" : "text-emerald-500"
                        }`}
                        title={user.status === "Active" ? "Deactivate Account" : "Activate Account"}
                      >
                        {user.status === "Active" ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                        title="Edit Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No staff records match the search parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-border">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground text-sm">{user.name}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  user.status === "Active" 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" 
                    : "bg-rose-500/10 text-rose-500 border-rose-500/30"
                }`}>
                  {user.status}
                </span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Email: {user.email}</p>
                <p>Department: {user.department}</p>
                <p className="text-primary font-semibold">Role: {user.role}</p>
              </div>
              <div className="flex justify-end gap-2 text-xs pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStatus(user.id, user.status)}
                  className={`h-8 cursor-pointer ${
                    user.status === "Active" ? "text-rose-500 hover:text-rose-600" : "text-emerald-500 hover:text-emerald-600"
                  }`}
                >
                  {user.status === "Active" ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(user)}
                  className="h-8 cursor-pointer"
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No matching user records.
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
                {editingUser ? "Edit User Settings" : "Create Staff Account"}
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
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. john@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Assigned Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Operational Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                  >
                    <option value="Employee">Employee / Requisitioner</option>
                    <option value="Approver">Approver / Manager</option>
                    <option value="Purchasing">Purchasing Officer</option>
                    <option value="Admin">System Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
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
                  {editingUser ? t("common.save") : t("common.add")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
