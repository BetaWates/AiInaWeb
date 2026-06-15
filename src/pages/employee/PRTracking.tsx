import React, { useState } from "react";
import { useProcurement } from "../../contexts";
import type { PurchaseRequest } from "../../types";
import { useLanguage  } from "../../contexts";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  ShieldCheck,
  Truck, 
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function PRTracking() {
  const { purchaseRequests, currentUser } = useProcurement();
  const { t } = useLanguage();

  const myPRs = purchaseRequests.filter(pr => pr.creator.email === currentUser?.email);
  const [selectedPRId, setSelectedPRId] = useState<string>(myPRs[0]?.id || "");

  const activePR = myPRs.find(pr => pr.id === selectedPRId);



  const getTimelineSteps = (pr: PurchaseRequest) => {
    const totalAmount = pr.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const steps = [
      {
        id: "step1",
        title: "PR Created & Saved",
        desc: `Initiated by ${pr.creator.name} (${pr.department})`,
        date: new Date(pr.createdAt).toLocaleString(),
        status: "completed",
        icon: FileText
      },
      {
        id: "step2",
        title: pr.status === "Draft" ? t("tracking.awaiting_submission") : "Requisition Submitted",
        desc: pr.status === "Draft"
          ? t("tracking.draft_mode")
          : `${t("tracking.submitted_review")} $${totalAmount.toLocaleString()}`,
        date: pr.status === "Draft" ? "Draft" : new Date(pr.createdAt).toLocaleString(),
        status: pr.status === "Draft" ? "pending" : "completed",
        icon: FileText
      },
      {
        id: "step3",
        title: t("tracking.approver_review"),
        desc: pr.status === "Rejected"
          ? `${t("tracking.rejected_by")} ${pr.approverComments || "None"}`
          : ["Approved", "PO Released", "Completed"].includes(pr.status)
          ? `${t("tracking.approved_remarks")} ${pr.approverComments || "None"}`
          : pr.status === "Waiting Approval"
          ? t("tracking.awaiting_approver")
          : t("tracking.pending_step"),
        date: ["Approved", "PO Released", "Completed", "Rejected"].includes(pr.status)
          ? new Date(pr.updatedAt).toLocaleString()
          : pr.status === "Waiting Approval" ? t("tracking.current_step") : "Pending",
        status: ["Approved", "PO Released", "Completed"].includes(pr.status)
          ? "completed"
          : pr.status === "Rejected"
          ? "failed"
          : pr.status === "Waiting Approval"
          ? "current"
          : "pending",
        icon: ShieldCheck
      },
      {
        id: "step4",
        title: t("tracking.po_released"),
        desc: ["PO Released", "Completed"].includes(pr.status)
          ? `PO ${pr.poNumber} has been generated and released to vendor.`
          : pr.status === "Approved"
          ? "Waiting for Purchasing Officer to select vendor and release PO."
          : t("tracking.pending_step"),
        date: ["PO Released", "Completed"].includes(pr.status)
          ? new Date(pr.poReleasedAt || pr.updatedAt).toLocaleString()
          : pr.status === "Approved" ? t("tracking.current_step") : "Pending",
        status: ["PO Released", "Completed"].includes(pr.status)
          ? "completed"
          : pr.status === "Approved"
          ? "current"
          : "pending",
        icon: Truck
      },
      {
        id: "step5",
        title: t("tracking.completed"),
        desc: pr.status === "Completed"
          ? "Goods received and matching invoice approved. PR workflow finished."
          : pr.status === "PO Released"
          ? "Waiting for delivery confirmation and vendor billing."
          : t("tracking.pending_step"),
        date: pr.status === "Completed" ? new Date(pr.updatedAt).toLocaleString() : pr.status === "PO Released" ? "In Progress" : "Pending",
        status: pr.status === "Completed"
          ? "completed"
          : pr.status === "PO Released"
          ? "current"
          : "pending",
        icon: CheckCircle2
      }
    ];

    return steps;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* PR Selection Bar */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-foreground">{t("employee.pr_tracking")}</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide shrink-0">
            Select Requisition:
          </label>
          <select
            value={selectedPRId}
            onChange={(e) => setSelectedPRId(e.target.value)}
            className="flex-1 w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            {myPRs.map((pr) => (
              <option key={pr.id} value={pr.id}>
                {pr.id} - {pr.title} (${pr.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toLocaleString()})
              </option>
            ))}
            {myPRs.length === 0 && (
              <option value="">No requisitions available</option>
            )}
          </select>
        </div>
      </div>

      {activePR ? (
        <>
          {/* PR Details Summary Box */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-foreground">{activePR.id}</h3>
                <StatusBadge status={activePR.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{activePR.title} • {activePR.department}</p>
            </div>
            
            <div className="flex flex-col text-left md:text-right text-xs">
              <span className="text-muted-foreground">Total Budget</span>
              <span className="text-lg font-extrabold text-foreground mt-0.5">
                ${activePR.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Timeline Visualizer */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-6">Status Pipeline Tracking</h3>

            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border"></div>

              <div className="space-y-8 relative z-10">
                {getTimelineSteps(activePR).map((step, idx, arr) => {
                  const Icon = step.icon;
                  const isLast = idx === arr.length - 1;
                  
                  let iconStyle = "bg-muted text-muted-foreground border-border";
                  let titleStyle = "text-muted-foreground/60";
                  let descStyle = "text-muted-foreground/50";
                  let dateStyle = "text-muted-foreground/40";

                  if (step.status === "completed") {
                    iconStyle = "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
                    titleStyle = "text-foreground font-semibold";
                    descStyle = "text-muted-foreground";
                    dateStyle = "text-muted-foreground text-xs";
                  } else if (step.status === "current") {
                    iconStyle = "bg-primary text-primary-foreground border-primary ring-4 ring-primary/10";
                    titleStyle = "text-foreground font-bold";
                    descStyle = "text-muted-foreground font-medium";
                    dateStyle = "text-primary text-xs font-semibold";
                  } else if (step.status === "failed") {
                    iconStyle = "bg-rose-500/10 text-rose-500 border-rose-500/30";
                    titleStyle = "text-rose-500 font-bold";
                    descStyle = "text-muted-foreground";
                    dateStyle = "text-rose-500 text-xs";
                  }

                  return (
                    <div key={step.id} className="flex gap-4 md:gap-6 items-start">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${iconStyle}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1">
                          <div>
                            <h4 className={`text-sm ${titleStyle}`}>{step.title}</h4>
                            <p className={`text-xs mt-1 leading-relaxed ${descStyle}`}>{step.desc}</p>
                          </div>
                          <span className={`text-[10px] md:text-xs shrink-0 ${dateStyle}`}>
                            {step.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground shadow-sm">
          <Info className="w-8 h-8 mx-auto mb-3 text-muted-foreground/60" />
          <p className="text-sm font-semibold">No Purchase Requisitions Available</p>
          <p className="text-xs mt-1">Please create a Requisition in the &ldquo;Create PR&rdquo; tab first.</p>
        </div>
      )}
    </div>
  );
}
