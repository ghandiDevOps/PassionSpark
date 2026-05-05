import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoWordmark } from "@/components/ui/logo-wordmark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserButton } from "@clerk/nextjs";

export default async function PassionneLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 backdrop-blur-sm border-b" style={{ backgroundColor: "var(--color-bg-nav)", borderColor: "var(--color-border)" }}>
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <LogoWordmark className="h-7 w-auto" style={{ filter: "var(--logo-filter)" }} />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/explore" className="font-display-md text-xs transition-colors hover:text-white hidden sm:block" style={{ color: "var(--color-muted)" }}>
              SESSIONS
            </Link>
            <ThemeToggle />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* ── Contenu ── */}
      <main className="max-w-lg mx-auto px-4 py-8 pb-28">
        {children}
      </main>

      {/* ── Bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-sm border-t z-40" style={{ backgroundColor: "var(--color-bg-nav)", borderColor: "var(--color-border)" }}>
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">

          <NavItem href="/explore" label="Explorer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </NavItem>

          <NavItem href="/my/bookings" label="Mes billets">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/>
              <rect x="3" y="16" width="5" height="5"/><line x1="16" y1="16" x2="21" y2="16"/>
              <line x1="21" y1="16" x2="21" y2="21"/><line x1="16" y1="21" x2="21" y2="21"/>
            </svg>
          </NavItem>

          <NavItem href="/my" label="Mon profil">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </NavItem>

        </div>
      </nav>

    </div>
  );
}

function NavItem({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 px-6 py-1 transition-colors hover:text-[#FF7A00]"
      style={{ color: "var(--color-muted)" }}
    >
      {children}
      <span className="font-display-md text-[9px] tracking-wider">{label}</span>
    </Link>
  );
}
