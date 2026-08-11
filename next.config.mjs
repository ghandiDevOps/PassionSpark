/** @type {import('next').NextConfig} */

// CSP en 'unsafe-inline'/'unsafe-eval' plutôt qu'en nonce : le layout racine utilise
// un <script> inline (anti-flash thème) et Clerk a besoin d'eval — un CSP à base de
// nonce serait plus strict mais demande de faire transiter le nonce jusqu'au middleware
// et à chaque script inline. Tracké comme suite possible dans SECURITY.md.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(self)" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.passionspark.fr https://challenges.cloudflare.com https://prod.spline.design https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data: blob: https://*.supabase.co https://img.clerk.com https://*.clerk.com",
      "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co https://*.clerk.accounts.dev https://*.clerk.com https://clerk.passionspark.fr https://api-adresse.data.gouv.fr https://prod.spline.design https://vitals.vercel-insights.com",
      "frame-src https://js.stripe.com https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/webhooks/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
