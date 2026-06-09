// ============================================================
// LANGUAGE CONTEXT
// Multilanguage support — EN / ID
// Translations loaded from dedicated translation files
// ============================================================

import React, { createContext, useContext, useState } from "react";
import type { Language } from "../../types";
import { STORAGE_KEYS } from "../../constants";
import { translations } from "../../translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return (saved === "EN" || saved === "ID" ? saved : "EN") as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "ID" : "EN");
  };

  const t = (key: string): string => {
    return translations[language]?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
