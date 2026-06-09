// ============================================================
// STORAGE SERVICE
// Centralized localStorage access with type safety
// ============================================================

export const storageService = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`storageService.set: Failed to persist key "${key}"`, err);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  },

  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  },
};
