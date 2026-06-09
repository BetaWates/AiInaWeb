import React, { useState } from "react";
import { useLanguage  } from "../../contexts";
import { Shield, ShieldAlert, CheckCircle2, AlertCircle, Save } from "lucide-react";
import { Button } from "../../components/ui/button";

interface PermissionConfig {
  id: string;
  label: string;
  description: string;
  roles: {
    Employee: boolean;
    Approver: boolean;
    Purchasing: boolean;
    Admin: boolean;
  };
}

export function RoleManagement() {
  const { t } = useLanguage();
  const [success, setSuccess] = useState(false);

  // Seed permissions
  const [permissions, setPermissions] = useState<PermissionConfig[]>([
    {
      id: "create_pr",
      label: "Create Purchase Requisition",
      description: "Allows initiating, drafting, and submitting PR items.",
      roles: { Employee: true, Approver: true, Purchasing: true, Admin: true }
    },
    {
      id: "approve_pr",
      label: "Approve Purchase Requisition",
      description: "Allows managers to approve or reject requisitions.",
      roles: { Employee: false, Approver: true, Purchasing: false, Admin: true }
    },
    {
      id: "release_po",
      label: "Release Purchase Order (PO)",
      description: "Allows matching vendor and releasing PO code numbers.",
      roles: { Employee: false, Approver: false, Purchasing: true, Admin: true }
    },
    {
      id: "manage_users",
      label: "User and Staff Directory",
      description: "Allows onboarding users, editing roles, and toggling active status.",
      roles: { Employee: false, Approver: false, Purchasing: false, Admin: true }
    },
    {
      id: "manage_master",
      label: "System Master Data Configurations",
      description: "Allows editing departments list and general configurations.",
      roles: { Employee: false, Approver: false, Purchasing: false, Admin: true }
    },
    {
      id: "read_audit",
      label: "System Trace & Audit Logs",
      description: "Provides view permissions over all database transactions and history.",
      roles: { Employee: false, Approver: false, Purchasing: true, Admin: true }
    }
  ]);

  const handleToggle = (permId: string, role: "Employee" | "Approver" | "Purchasing" | "Admin") => {
    setPermissions(prev => prev.map(p => {
      if (p.id === permId) {
        return {
          ...p,
          roles: {
            ...p.roles,
            [role]: !p.roles[role]
          }
        };
      }
      return p;
    }));
    setSuccess(false);
  };

  const handleSave = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t("admin.roles")}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Configure access control list (ACL) rules and granular security permissions for user roles.
          </p>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2 cursor-pointer shadow-md">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </Button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Security permission matrix updated successfully.</span>
        </div>
      )}

      {/* Permissions Matrix */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-sidebar/30">
                <th className="py-3 px-6">System Module / Permission</th>
                <th className="py-3 px-6 text-center">Employee</th>
                <th className="py-3 px-6 text-center">Approver</th>
                <th className="py-3 px-6 text-center">Purchasing</th>
                <th className="py-3 px-6 text-center">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {permissions.map((p) => (
                <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                  <td className="py-4 px-6 max-w-sm">
                    <h4 className="font-bold text-foreground text-sm">{p.label}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.description}</p>
                  </td>
                  
                  {/* Employee */}
                  <td className="py-4 px-6 text-center">
                    <input
                      type="checkbox"
                      checked={p.roles.Employee}
                      onChange={() => handleToggle(p.id, "Employee")}
                      className="w-4 h-4 rounded text-primary border-border bg-background focus:ring-1 focus:ring-primary cursor-pointer accent-primary"
                    />
                  </td>

                  {/* Approver */}
                  <td className="py-4 px-6 text-center">
                    <input
                      type="checkbox"
                      checked={p.roles.Approver}
                      onChange={() => handleToggle(p.id, "Approver")}
                      className="w-4 h-4 rounded text-primary border-border bg-background focus:ring-1 focus:ring-primary cursor-pointer accent-primary"
                    />
                  </td>

                  {/* Purchasing */}
                  <td className="py-4 px-6 text-center">
                    <input
                      type="checkbox"
                      checked={p.roles.Purchasing}
                      onChange={() => handleToggle(p.id, "Purchasing")}
                      className="w-4 h-4 rounded text-primary border-border bg-background focus:ring-1 focus:ring-primary cursor-pointer accent-primary"
                    />
                  </td>

                  {/* Admin */}
                  <td className="py-4 px-6 text-center">
                    <input
                      type="checkbox"
                      checked={p.roles.Admin}
                      onChange={() => handleToggle(p.id, "Admin")}
                      className="w-4 h-4 rounded text-primary border-border bg-background focus:ring-1 focus:ring-primary cursor-pointer accent-primary"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
