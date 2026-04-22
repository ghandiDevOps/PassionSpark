"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Utilisateurs",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: "/admin/sessions",
    label: "Sessions",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    href: "/admin/bookings",
    label: "Réservations",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
        <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
      </svg>
    ),
  },
];

export function AdminSidebar({ adminName, adminEmail }: { adminName: string; adminEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden sm:flex flex-col w-56 shrink-0 bg-[#0a0a0a] border-r border-[#1a1a1a] min-h-screen sticky top-0 h-screen">

      {/* Logo + badge */}
      <div className="p-5 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-display text-lg text-white leading-none">PASSION SPARK</span>
        </div>
        <span className="font-display-md text-[9px] text-red-400 border border-red-500/30 px-1.5 py-0.5 tracking-wider">
          ADMIN PANEL
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map((item) => {
          const active = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-150 cursor-pointer ${
                active
                  ? "bg-[#FF7A00]/10 text-[#FF7A00] border-l-2 border-[#FF7A00]"
                  : "text-[#666] hover:text-white hover:bg-[#1a1a1a] border-l-2 border-transparent"
              }`}
            >
              {item.icon}
              <span className="font-display-md text-[11px] tracking-wider">{item.label.toUpperCase()}</span>
            </Link>
          );
        })}
      </nav>

      {/* Retour au site */}
      <div className="p-3 border-t border-[#1a1a1a] space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 text-[#444] hover:text-white transition-colors text-xs cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span className="font-display-md text-[10px] tracking-wider">RETOUR AU SITE</span>
        </Link>

        {/* Admin info */}
        <div className="px-3 py-2">
          <p className="font-display-md text-[10px] text-[#333] truncate">{adminName}</p>
          <p className="text-[10px] text-[#2a2a2a] font-sans truncate">{adminEmail}</p>
        </div>
      </div>

    </aside>
  );
}
