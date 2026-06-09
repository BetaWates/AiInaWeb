import { RouteObject, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../guards/ProtectedRoute";
import { PurchasingLayout } from "../layouts";
import { ROUTES } from "../../constants";

// Pages
import { PurchasingDashboard } from "../../pages/purchasing/PurchasingDashboard";
import { AllPR } from "../../pages/purchasing/AllPR";
import { ReleasePO } from "../../pages/purchasing/ReleasePO";
import { Vendors } from "../../pages/purchasing/Vendors";
import { Reports } from "../../pages/purchasing/Reports";
import { Settings } from "../../pages/shared/Settings";

export const purchasingRoutes: RouteObject[] = [
  {
    path: ROUTES.PURCHASING.ROOT,
    element: <ProtectedRoute allowedRoles={["Purchasing"]} />,
    children: [
      {
        element: <PurchasingLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.PURCHASING.DASHBOARD} replace /> },
          { path: "dashboard", element: <PurchasingDashboard /> },
          { path: "all-pr", element: <AllPR /> },
          { path: "release-po", element: <ReleasePO /> },
          { path: "vendors", element: <Vendors /> },
          { path: "reports", element: <Reports /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
];
