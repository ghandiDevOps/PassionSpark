"use client";

import { useCallback } from "react";
import { translations, type Locale, type TranslationKeys } from "./translations";
import { useLocale } from "./LocaleProvider";

// ─── Path-typed accessor ──────────────────────────────────────────────────────

type Leaves<T, P extends string = ""> = T extends string
  ? P
  : T extends readonly unknown[]
    ? never
    : T extends object
      ? { [K in keyof T & string]: Leaves<T[K], P extends "" ? K : `${P}.${K}`> }[keyof T & string]
      : never;

type StringKeys = Leaves<TranslationKeys>;

function getPath(obj: unknown, path: string): string {
  const result = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as object)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof result === "string" ? result : path;
}

// ─── Hook — uses shared Context (no independent state) ────────────────────────

export function useTranslation() {
  const { locale, setLocale } = useLocale();

  const t = useCallback(
    (key: StringKeys): string => getPath(translations[locale], key),
    [locale]
  );

  return {
    t,
    locale,
    setLocale,
    tr: translations[locale],
  };
}

export type { Locale };
