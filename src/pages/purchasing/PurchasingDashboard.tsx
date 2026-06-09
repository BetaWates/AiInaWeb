import React from "react";
import { Link } from "react-router-dom";
import { useProcurement } from "../../contexts";
import { useLanguage  } from "../../contexts";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Truck,
  DollarSign
} from "lucide-react";

export function PurchasingDashboard() {
  const { purchaseRequests, vendors } = useProcurement();
  const { t } = useLanguage();

  const totalPRs = purchaseRequests.length;
  
  const pendingReview = purchaseRequests.filter(
    (pr) => pr.status === "Approved" // Approved by manager, pending PO release by purchasing
  );

  const releasedPOs = purchaseRequests.filter(
    (pr) => pr.status === "PO Released" || pr.status === "Completed"
  );

  // Total PR value calculation
  const totalValue = purchaseRequests.reduce((sum, pr) => {
    const prVal = pr.items.reduce((s, it) => s + it.quantity * it.price, 0);
    return sum + prVal;
  }, 0);

  // Chart data: Monthly procurement (mocked based on actual seed data)
  const monthlyData = [
    { month: "Jan", amount: 4500 },
    { month: "Feb", amount: 6200 },
    { month: "Mar", amount: 7800 },
    { month: "Apr", amount: 5100 },
    { month: "May", amount: totalValue > 0 ? totalValue : 9400 }
  ];

  // Chart data: Department distribution
  const deptMap: Record<string, number> = {};
  purchaseRequests.forEach(pr => {
    const total = pr.items.reduce((s, it) => s + it.quantity * it.price, 0);
    deptMap[pr.department] = (deptMap[pr.department] || 0) + total;
  });

  const deptData = Object.keys(deptMap).map(key => ({
    name: key,
    value: deptMap[key]
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h2 className="text-xl font-bold text-foreground">{t("purchasing.dashboard")}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Procurement Operations Analytics. Release purchase orders and evaluate vendor performance parameters.
        </p>
      </div>

      {/* Analytics KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requisition Value */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("purchasing.total_pr")}</p>
            <h3 className="text-xl font-bold mt-1 text-foreground">${totalValue.toLocaleString()}</h3>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("purchasing.pending_review")}</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{pendingReview.length}</h3>
          </div>
        </div>

        {/* Released POs */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("purchasing.released_po")}</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{releasedPOs.length}</h3>
          </div>
        </div>

        {/* Total Vendors */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-muted rounded-xl text-foreground">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Vendors</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">
              {vendors.filter((v) => v.status === "Active").length}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly expenses - 2 Columns */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>{t("purchasing.monthly_stats")}</span>
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution - 1 Column */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider mb-6">
            Department Allocation
          </h3>
          <div className="h-52 w-full text-xs flex justify-center items-center">
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-xs">No allocations recorded yet</p>
            )}
          </div>
          
          {/* Legend */}
          <div className="mt-4 space-y-1.5 overflow-y-auto max-h-24 text-[10px] scrollbar-thin">
            {deptData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-medium truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="font-bold text-muted-foreground">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor Monitoring & Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Release PO queue */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center bg-sidebar/20">
            <h3 className="font-bold text-foreground text-sm">Action Required: Ready for Purchase Order</h3>
            <Link to="/purchasing/release-po" className="text-xs text-primary hover:underline font-semibold">
              Go to Release Queue
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-sidebar/10 text-muted-foreground font-bold">
                  <th className="py-2.5 px-4">{t("common.id")}</th>
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-4">Requisitioner</th>
                  <th className="py-2.5 px-4">Total Amount</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {pendingReview.slice(0, 4).map(pr => {
                  const total = pr.items.reduce((s, it) => s + it.quantity * it.price, 0);
                  return (
                    <tr key={pr.id} className="hover:bg-muted/10">
                      <td className="py-3 px-4 font-semibold">{pr.id}</td>
                      <td className="py-3 px-4 truncate max-w-[150px] font-medium">{pr.title}</td>
                      <td className="py-3 px-4 text-muted-foreground">{pr.creator.name}</td>
                      <td className="py-3 px-4 font-bold">${total.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <Link to="/purchasing/release-po">
                          <button className="px-2 py-1 bg-primary text-primary-foreground font-semibold rounded hover:opacity-90 transition-opacity cursor-pointer">
                            Release PO
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {pendingReview.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      No approved requisitions waiting for PO release.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendor summary rating */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border bg-sidebar/20">
            <h3 className="font-bold text-foreground text-sm">{t("purchasing.vendor_monitoring")}</h3>
          </div>
          <div className="p-5 flex-1 divide-y divide-border overflow-y-auto max-h-[300px]">
            {vendors.slice(0, 4).map((vendor) => (
              <div key={vendor.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{vendor.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{vendor.category} • {vendor.code}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-foreground">★ {vendor.rating.toFixed(1)}</div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    vendor.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  }`}>
                    {vendor.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
