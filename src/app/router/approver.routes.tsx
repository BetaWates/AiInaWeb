import { RouteObject, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../guards/ProtectedRoute";
import { ApproverLayout } from "../layouts";
import { ROUTES } from "../../constants";

// Pages
import { ApproverDashboard } from "../../pages/approver/ApproverDashboard";
import { PendingApproval } from "../../pages/approver/PendingApproval";
import { ApprovalHistory } from "../../pages/approver/ApprovalHistory";
import { Settings } from "../../pages/shared/Settings";

export const approverRoutes: RouteObject[] = [
  {
    path: ROUTES.APPROVER.ROOT,
    element: <ProtectedRoute allowedRoles={["Approver"]} />,
    children: [
      {
        element: <ApproverLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.APPROVER.DASHBOARD} replace /> },
          { path: "dashboard", element: <ApproverDashboard /> },
          { path: "pending-approval", element: <PendingApproval /> },
          { path: "history", element: <ApprovalHistory /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
];
