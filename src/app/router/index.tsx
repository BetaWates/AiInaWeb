// ============================================================
// APPLICATION ROUTER (COMPOSED)
// Central composed route tree — modular role-based routing slices
// ============================================================

import { createBrowserRouter, Navigate } from "react-router-dom";
import { authRoutes } from "./auth.routes";
import { employeeRoutes } from "./employee.routes";
import { approverRoutes } from "./approver.routes";
import { purchasingRoutes } from "./purchasing.routes";
import { adminRoutes } from "./admin.routes";
import { NotFound } from "../../pages/shared/NotFound";
import { ROUTES } from "../../constants";

export const router = createBrowserRouter([
  // Root redirect
  { path: ROUTES.ROOT, element: <Navigate to={ROUTES.LOGIN} replace /> },

  // Isolated Routing Slices
  ...authRoutes,
  ...employeeRoutes,
  ...approverRoutes,
  ...purchasingRoutes,
  ...adminRoutes,

  // Fallback Route
  { path: "*", element: <NotFound /> },
]);
