// ============================================================
// PROTECTED ROUTE
// Guards routes by auth state and role
// ============================================================

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useProcurement } from "../../contexts";
import type { Role } from "../../types";
import { ROLE_DEFAULT_ROUTES } from "../../constants";

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser } = useProcurement();

  // Not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role — redirect to their own dashboard
  if (!allowedRoles.includes(currentUser.role)) {
    const redirect = ROLE_DEFAULT_ROUTES[currentUser.role] ?? "/login";
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
};
