"use client";

import Link from "next/link";
import { LogoWordmark } from "@/components/ui/logo-wordmark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  isSignedIn: boolean;
  isCoach: boolean;
  isParticipant: boolean;
}

export function MarketingNav({ isSignedIn, isCoach, isParticipant }: Props) {
  const { t } = useTranslation();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b"
      style={{ backgroundColor: "var(--color-bg-nav)", borderColor: "var(--color-border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          <LogoWordmark className="h-8 w-auto" style={{ filter: "var(--logo-filter)" }} />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/explore"
            className="font-display-md text-sm transition-colors hover:text-[#FF7A00]"
            style={{ color: "var(--color-muted)" }}
          >
            {t("nav.sessions_short")}
          </Link>

          {!isSignedIn && (
            <>
              <Link
                href="/sign-in"
                className="font-display-md text-sm transition-colors hover:text-[#FF7A00]"
                style={{ color: "var(--color-muted)" }}
              >
                {t("nav.sign_in")}
              </Link>
              <Link href="/sign-up" className="btn-passion text-sm px-5 py-2.5 min-h-0">
                {t("nav.become_coach")}
              </Link>
            </>
          )}

          {isCoach && (
            <Link href="/dashboard" className="btn-passion text-sm px-5 py-2.5 min-h-0">
              {t("nav.my_space_coach")}
            </Link>
          )}

          {isParticipant && (
            <>
              <Link
                href="/my/bookings"
                className="font-display-md text-sm transition-colors hover:text-[#FF7A00]"
                style={{ color: "var(--color-muted)" }}
              >
                {t("nav.my_bookings")}
              </Link>
              <Link href="/my" className="btn-passion text-sm px-5 py-2.5 min-h-0">
                {t("nav.my_profile")}
              </Link>
            </>
          )}

          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          {!isSignedIn && (
            <>
              <Link
                href="/sign-in"
                className="font-display-md text-xs"
                style={{ color: "var(--color-muted)" }}
              >
                {t("nav.sign_in")}
              </Link>
              <Link href="/sign-up" className="btn-passion text-xs px-3 py-2 min-h-0">
                {t("nav.coach")}
              </Link>
            </>
          )}
          {isCoach && (
            <Link href="/dashboard" className="btn-passion text-xs px-3 py-2 min-h-0">
              {t("nav.my_space_short")}
            </Link>
          )}
          {isParticipant && (
            <Link href="/my/bookings" className="btn-passion text-xs px-3 py-2 min-h-0">
              {t("nav.my_bookings_emoji")}
            </Link>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
