"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";

export function MarketingFooter() {
  const { locale } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t"
      style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="font-display-md text-xs tracking-[0.2em] mb-1" style={{ color: "var(--color-muted)" }}>
            PASSION SPARK
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            Paris, France · © {year}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <a
            href="mailto:hello@passionspark.fr"
            className="font-display-md tracking-[0.1em] hover:text-[#FF7A00] transition-colors"
            style={{ color: "var(--color-muted)" }}
          >
            hello@passionspark.fr
          </a>
          <Link
            href="/legal/cgu"
            className="font-display-md tracking-[0.1em] hover:text-[#FF7A00] transition-colors"
            style={{ color: "var(--color-muted)" }}
          >
            {locale === "fr" ? "CGU · Mentions légales" : "Terms · Legal"}
          </Link>
          <Link
            href="/legal/privacy"
            className="font-display-md tracking-[0.1em] hover:text-[#FF7A00] transition-colors"
            style={{ color: "var(--color-muted)" }}
          >
            {locale === "fr" ? "Confidentialité" : "Privacy"}
          </Link>
          <Link
            href="/legal/contact"
            className="font-display-md tracking-[0.1em] hover:text-[#FF7A00] transition-colors"
            style={{ color: "var(--color-muted)" }}
          >
            {locale === "fr" ? "Contact" : "Contact"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
