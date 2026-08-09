"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/i18n/LocaleProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="pp-theme"
      disableTransitionOnChange
    >
      <LocaleProvider>{children}</LocaleProvider>
    </ThemeProvider>
  );
}
