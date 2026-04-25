import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/i18n/LocaleProvider";

export default function V2Layout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="v2-theme"
    >
      <LocaleProvider>
        {children}
      </LocaleProvider>
    </ThemeProvider>
  );
}
