// ============================================================
// TRANSLATIONS INDEX
// Keyed by Language type (EN | ID) for backward compatibility
// ============================================================

import en from "./en";
import id from "./id";
import type { Language } from "../types";

export const translations: Record<Language, Record<string, string>> = { EN: en, ID: id };

export { en, id };
