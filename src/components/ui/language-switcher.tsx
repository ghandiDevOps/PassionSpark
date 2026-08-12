"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import type { Locale } from "@/i18n/translations";

// EN is translated but not yet shipped — hide it until the full EN experience is validated
const LOCALES: { code: Locale; label: string; comingSoon?: boolean }[] = [
  { code: "fr", label: "FR" },
  // { code: "en", label: "EN" },  // re-enable when EN is ready
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  // Only one locale active for now — don't render the switcher at all
  if (LOCALES.length <= 1) return null;

  return (
    <div className="flex border border-[#E5E5E5] dark:border-[#2a2a2a]">
      {LOCALES.map(({ code, label }) => {
        const active = locale === code;
        return (
          <button
            key={code}
            onClick={() => setLocale(code)}
            className="relative h-9 w-10 font-display-md text-[9px] tracking-[0.15em] transition-colors overflow-hidden"
            style={{ color: active ? "#FF7A00" : undefined }}
            aria-label={`Switch to ${label}`}
          >
            {active && (
              <motion.div
                layoutId="lang-active-bg"
                className="absolute inset-0 bg-[#FF7A00]/10"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <motion.span
              key={`${code}-${locale}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="relative z-10"
            >
              {label}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}
