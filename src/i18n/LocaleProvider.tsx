"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { translations, type Locale } from "./translations";

// ─── Context ──────────────────────────────────────────────────────────────────

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "fr",
  setLocale: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("pp-locale") as Locale | null;
    if (saved && saved in translations) {
      setLocaleState(saved);
      return;
    }
    const nav = navigator.language.slice(0, 2) as Locale;
    if (nav in translations) setLocaleState(nav);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("pp-locale", l);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

// ─── Consumer hook ────────────────────────────────────────────────────────────

export function useLocale() {
  return useContext(LocaleContext);
}
