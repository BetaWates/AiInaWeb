import { RouteObject, Navigate } from "react-router-dom";
import { Login } from "../../pages/auth/Login";
import { ROUTES } from "../../constants";

export const authRoutes: RouteObject[] = [
  {
    path: ROUTES.LOGIN,
    element: <Login />,
  },
];
