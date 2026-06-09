// ============================================================
// AUTH SERVICE STUB
// Future: replace with Supabase Auth / JWT / OAuth
// ============================================================

import type { User, Role } from "../../types";

export interface LoginCredentials {
  email: string;
  password: string;
  role: Role;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthSession {
  user: User;
  token: AuthToken;
}

/**
 * Auth service — currently delegates to ProcurementContext (localStorage).
 * Future: swap for Supabase auth.signInWithPassword(), JWT validation, etc.
 */
export const authService = {
  /**
   * Future: POST /auth/login
   * Currently: handled by ProcurementContext.login()
   */
  async login(_credentials: LoginCredentials): Promise<AuthSession | null> {
    // TODO: supabase.auth.signInWithPassword({ email, password })
    console.warn("authService.login: not yet connected to backend.");
    return null;
  },

  /**
   * Future: POST /auth/logout
   */
  async logout(): Promise<void> {
    // TODO: supabase.auth.signOut()
    console.warn("authService.logout: not yet connected to backend.");
  },

  /**
   * Future: GET /auth/session
   */
  async getSession(): Promise<AuthSession | null> {
    // TODO: supabase.auth.getSession()
    console.warn("authService.getSession: not yet connected to backend.");
    return null;
  },

  /**
   * Future: POST /auth/refresh
   */
  async refreshToken(_token: string): Promise<AuthToken | null> {
    // TODO: supabase.auth.refreshSession()
    console.warn("authService.refreshToken: not yet connected to backend.");
    return null;
  },
};
