"use client";

import * as React from "react";

import type { Language } from "@/lib/api";

/**
 * The farmer's chosen language, shared across the app.
 *
 * Previously each screen kept its own local state, so switching to Hindi on the
 * advisory left the assistant and the scheme directory in English. It is stored
 * per device rather than per account because PRD §9 puts authentication out of
 * scope.
 */
const KEY = "agrimitra.language";

export const LANGUAGES: { value: Language; label: string; short: string }[] = [
  { value: "en", label: "English", short: "EN" },
  { value: "hi", label: "हिन्दी", short: "हि" },
  { value: "gu", label: "ગુજરાતી", short: "ગુ" },
  { value: "te", label: "తెలుగు", short: "తె" },
];

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = React.createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>("en");

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY);
      if (stored && LANGUAGES.some((item) => item.value === stored)) {
        setLanguageState(stored as Language);
      }
    } catch {
      /* private mode, or site data blocked — English is a fine default */
    }
  }, []);

  const setLanguage = React.useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* non-fatal: the choice simply will not persist */
    }
    document.documentElement.lang = next;
  }, []);

  const value = React.useMemo(() => ({ language, setLanguage }), [language, setLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return React.useContext(LanguageContext);
}
