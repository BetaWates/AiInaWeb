import React from "react";
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { TrendingUp, DollarSign, Download, BarChart2, PieChart as PieIcon } from "lucide-react";
import { Button } from "../../components/ui/button";

export function Reports() {
  const { purchaseRequests } = useProcurement();
  const { t } = useLanguage();

  // Metrics
  const totalValue = purchaseRequests.reduce((sum, pr) => {
    return sum + pr.items.reduce((s, it) => s + it.quantity * it.price, 0);
  }, 0);

  const approvedPRs = purchaseRequests.filter(pr => ["Approved", "PO Released", "Completed"].includes(pr.status));
  const approvedValue = approvedPRs.reduce((sum, pr) => {
    return sum + pr.items.reduce((s, it) => s + it.quantity * it.price, 0);
  }, 0);

  // Chart 1: Priority Breakdown
  const priorities = ["Low", "Medium", "High", "Urgent"];
  const priorityData = priorities.map(pri => ({
    name: pri,
    value: purchaseRequests.filter(pr => pr.priority === pri).length
  }));

  // Chart 2: Department spending
  const deptMap: Record<string, number> = {};
  purchaseRequests.forEach(pr => {
    const total = pr.items.reduce((s, it) => s + it.quantity * it.price, 0);
    deptMap[pr.department] = (deptMap[pr.department] || 0) + total;
  });
  const deptSpendingData = Object.keys(deptMap).map(key => ({
    department: key,
    amount: deptMap[key]
  }));

  // Chart 3: Monthly trend (mocked with reference to total value)
  const trendData = [
    { name: "Jan", Requisitions: 3200, POs: 2400 },
    { name: "Feb", Requisitions: 4500, POs: 3800 },
    { name: "Mar", Requisitions: 6800, POs: 5900 },
    { name: "Apr", Requisitions: 5100, POs: 4200 },
    { name: "May", Requisitions: totalValue, POs: approvedValue }
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  const handleExport = () => {
    alert("Exporting analytics report as CSV...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t("purchasing.reports")}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Analyze departmental expenditures, priority indicators, and fulfillment trends.
          </p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2 cursor-pointer shadow-md">
          <Download className="w-4 h-4" />
          <span>{t("common.export")}</span>
        </Button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Total Procurement Exposure</span>
          <h3 className="text-2xl font-bold text-foreground mt-1">${totalValue.toLocaleString()}</h3>
          <p className="text-xs text-muted-foreground mt-1">Value of all submitted requisitions</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Released Purchase Orders</span>
          <h3 className="text-2xl font-bold text-foreground mt-1">${approvedValue.toLocaleString()}</h3>
          <p className="text-xs text-emerald-500 font-semibold mt-1">
            {((approvedValue / (totalValue || 1)) * 100).toFixed(0)}% Approval release rate
          </p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Total Submitted Requests</span>
          <h3 className="text-2xl font-bold text-foreground mt-1">{purchaseRequests.length} PRs</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {purchaseRequests.filter(p => p.status === "Completed").length} completed cycles
          </p>
        </div>
      </div>

      {/* Recharts Displays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend chart */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <h3 className="font-bold text-xs text-foreground uppercase tracking-wide mb-6 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span>Procurement Requisition vs PO Trends</span>
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
                <Legend />
                <Line type="monotone" dataKey="Requisitions" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="POs" stroke="#10b981" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Spending chart */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <h3 className="font-bold text-xs text-foreground uppercase tracking-wide mb-6 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span>Departmental Budget Allocations</span>
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptSpendingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="department" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority breakdown chart */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col lg:col-span-2">
          <h3 className="font-bold text-xs text-foreground uppercase tracking-wide mb-6 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-primary" />
            <span>Requisitions Priority Breakdown</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
            <div className="h-56 w-full flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Color key */}
            <div className="space-y-4">
              {priorityData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="font-semibold text-foreground">{item.name} Priority</span>
                  </div>
                  <span className="font-bold text-muted-foreground">{item.value} requests</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
