import { RouteObject, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../guards/ProtectedRoute";
import { AdminLayout } from "../layouts";
import { ROUTES } from "../../constants";

// Pages
import { AdminDashboard } from "../../pages/admin/AdminDashboard";
import { UserManagement } from "../../pages/admin/UserManagement";
import { RoleManagement } from "../../pages/admin/RoleManagement";
import { MasterData } from "../../pages/admin/MasterData";
import { AuditLog } from "../../pages/admin/AuditLog";
import { Settings } from "../../pages/shared/Settings";

export const adminRoutes: RouteObject[] = [
  {
    path: ROUTES.ADMIN.ROOT,
    element: <ProtectedRoute allowedRoles={["Admin"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace /> },
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "users", element: <UserManagement /> },
          { path: "roles", element: <RoleManagement /> },
          { path: "master-data", element: <MasterData /> },
          { path: "audit-log", element: <AuditLog /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
];
