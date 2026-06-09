import { RouteObject, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../guards/ProtectedRoute";
import { EmployeeLayout } from "../layouts";
import { ROUTES } from "../../constants";

// Pages
import { EmployeeDashboard } from "../../pages/employee/EmployeeDashboard";
import { CreatePR } from "../../pages/employee/CreatePR";
import { MyPR } from "../../pages/employee/MyPR";
import { PRTracking } from "../../pages/employee/PRTracking";
import { UploadPR } from "../../pages/employee/UploadPR";
import { Settings } from "../../pages/shared/Settings";

export const employeeRoutes: RouteObject[] = [
  {
    path: ROUTES.EMPLOYEE.ROOT,
    element: <ProtectedRoute allowedRoles={["Employee"]} />,
    children: [
      {
        element: <EmployeeLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.EMPLOYEE.DASHBOARD} replace /> },
          { path: "dashboard", element: <EmployeeDashboard /> },
          { path: "create-pr", element: <CreatePR /> },
          { path: "my-pr", element: <MyPR /> },
          { path: "pr-tracking", element: <PRTracking /> },
          { path: "upload-pr", element: <UploadPR /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
];
