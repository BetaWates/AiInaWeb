// ============================================================
// APP PROVIDERS
// Single composition root — add/remove providers here only
// ============================================================

import React from "react";
import { ThemeProvider, LanguageProvider, ProcurementProvider } from "../../contexts";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders wraps the entire application with all global providers.
 * Order matters: ThemeProvider → LanguageProvider → ProcurementProvider.
 *
 * Future providers to add here:
 *   - QueryClientProvider (React Query)
 *   - SupabaseProvider
 *   - ToastProvider (already using Sonner via AppNavbar if needed)
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <ThemeProvider>
    <LanguageProvider>
      <ProcurementProvider>
        {children}
      </ProcurementProvider>
    </LanguageProvider>
  </ThemeProvider>
);
