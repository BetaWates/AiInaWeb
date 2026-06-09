// ============================================================
// usePRStats HOOK
// Derived statistics from purchase requisitions
// ============================================================

import { useMemo } from "react";
import type { PurchaseRequest } from "../types";

export interface PRStats {
  total: number;
  draft: number;
  waitingApproval: number;
  approved: number;
  rejected: number;
  poReleased: number;
  completed: number;
  totalValue: number;
}

export function usePRStats(requests: PurchaseRequest[], userEmail?: string): PRStats {
  return useMemo(() => {
    const filtered = userEmail
      ? requests.filter(pr => pr.creator.email === userEmail)
      : requests;

    const totalValue = filtered.reduce((sum, pr) =>
      sum + pr.items.reduce((s, item) => s + item.quantity * item.price, 0), 0
    );

    return {
      total:          filtered.length,
      draft:          filtered.filter(pr => pr.status === "Draft").length,
      waitingApproval:filtered.filter(pr => pr.status === "Waiting Approval").length,
      approved:       filtered.filter(pr => pr.status === "Approved").length,
      rejected:       filtered.filter(pr => pr.status === "Rejected").length,
      poReleased:     filtered.filter(pr => pr.status === "PO Released").length,
      completed:      filtered.filter(pr => pr.status === "Completed").length,
      totalValue,
    };
  }, [requests, userEmail]);
}
