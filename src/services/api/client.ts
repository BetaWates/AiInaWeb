// ============================================================
// API SERVICE STUB
// Ready for Supabase / REST / GraphQL integration
// ============================================================

export interface ApiRequestConfig {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Base API client — swap this implementation for Supabase / Axios / fetch
 * when the backend is ready. All data access in the app goes through here.
 */
export const apiClient = {
  async request<T>(_config: ApiRequestConfig): Promise<ApiResult<T>> {
    // TODO: Replace with actual HTTP client
    // Example Supabase integration:
    // const { data, error } = await supabase.from(config.endpoint).select()
    console.warn("API client not yet connected. Using local state.");
    return { data: null, error: "Backend not connected", status: 503 };
  },

  async get<T>(endpoint: string): Promise<ApiResult<T>> {
    return this.request<T>({ endpoint, method: "GET" });
  },

  async post<T>(endpoint: string, body: unknown): Promise<ApiResult<T>> {
    return this.request<T>({ endpoint, method: "POST", body });
  },

  async put<T>(endpoint: string, body: unknown): Promise<ApiResult<T>> {
    return this.request<T>({ endpoint, method: "PUT", body });
  },

  async patch<T>(endpoint: string, body: unknown): Promise<ApiResult<T>> {
    return this.request<T>({ endpoint, method: "PATCH", body });
  },

  async delete<T>(endpoint: string): Promise<ApiResult<T>> {
    return this.request<T>({ endpoint, method: "DELETE" });
  },
};
