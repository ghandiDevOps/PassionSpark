import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "./providers";
import "@/styles/globals.css";

// Auto-hébergé dans public/fonts/ — pas de dépendance Google Fonts externe
const barlowCondensed = localFont({
  src: [
    { path: "../../public/fonts/barlow-condensed-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/barlow-condensed-700.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/barlow-condensed-800.woff2", weight: "800", style: "normal" },
    { path: "../../public/fonts/barlow-condensed-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-barlow-condensed",
  display: "swap",
  preload: true,
});


export const metadata: Metadata = {
  title: {
    default: "Passion Spark — Allume ta prochaine passion.",
    template: "%s | Passion Spark",
  },
  description:
    "Spark your next passion. Sessions collectives ultra-ciblées avec des passionnés. Découverte ou progression — réserve en 30 secondes.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://passionspark.fr"),
  openGraph: {
    type: "website",
    siteName: "Passion Spark",
    locale: "fr_FR",
    url: "https://passionspark.fr",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Désactive le zoom — intentionnel (app mobile-first)
  themeColor: "#ff3b3b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr" suppressHydrationWarning>
        <head>
          {/* Anti-flash: apply theme class before first paint */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var t=localStorage.getItem('pp-theme');document.documentElement.classList.toggle('dark',t?t==='dark':true);})();`,
            }}
          />
        </head>
        <body
          className={`${GeistSans.variable} ${GeistMono.variable} ${barlowCondensed.variable} font-sans`}
        >
          <Providers>{children}</Providers>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
