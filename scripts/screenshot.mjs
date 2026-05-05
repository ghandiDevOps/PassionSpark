/**
 * PassionSpark — Screenshot Tool
 * Permet à Claude de "voir" le site pour donner du feedback design
 *
 * Usage :
 *   npm run screenshot              → capture toutes les pages
 *   npm run screenshot -- /explore  → capture une page spécifique
 *   npm run screenshot -- --full    → full-page (sans viewport crop)
 *
 * Install (une fois) :
 *   npm install -D playwright
 *   npx playwright install chromium
 */

import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT_DIR  = "screenshots";

const PAGES = [
  // Public — mobile
  { route: "/",            name: "homepage",          viewport: { width: 390,  height: 844 } },
  { route: "/",            name: "homepage-desktop",  viewport: { width: 1440, height: 900 } },
  { route: "/explore",     name: "explore",           viewport: { width: 390,  height: 844 } },
  { route: "/explore",     name: "explore-desktop",   viewport: { width: 1440, height: 900 } },
  { route: "/legal/cgu",   name: "cgu",               viewport: { width: 390,  height: 844 } },
  { route: "/legal/contact", name: "contact",         viewport: { width: 390,  height: 844 } },
  // Auth (Clerk — peut timeout si hors ligne)
  { route: "/sign-in",     name: "sign-in",           viewport: { width: 390,  height: 844 } },
  { route: "/sign-up",     name: "sign-up",           viewport: { width: 390,  height: 844 } },
  // Coach (redirige vers sign-in si pas auth)
  { route: "/dashboard",   name: "dashboard",         viewport: { width: 390,  height: 844 } },
  { route: "/sessions",    name: "sessions",          viewport: { width: 390,  height: 844 } },
  { route: "/sessions/new", name: "sessions-new",     viewport: { width: 390,  height: 844 } },
  { route: "/earnings",    name: "earnings",          viewport: { width: 390,  height: 844 } },
  { route: "/analytics",   name: "analytics",         viewport: { width: 390,  height: 844 } },
  { route: "/onboarding",  name: "onboarding",        viewport: { width: 390,  height: 844 } },
];

const args = process.argv.slice(2);
const specificRoute = args.find(a => a.startsWith("/"));
const fullPage = args.includes("--full");

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const pagesToCapture = specificRoute
    ? [{ route: specificRoute, name: specificRoute.replace(/\//g, "_").slice(1) || "home", viewport: { width: 390, height: 844 } }]
    : PAGES;

  console.log(`📸 Capturing ${pagesToCapture.length} page(s) from ${BASE_URL}\n`);

  for (const { route, name, viewport } of pagesToCapture) {
    const context = await browser.newContext({ viewport });
    const page    = await context.newPage();

    try {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(1500); // laisse les composants client s'hydrater

      const filename = path.join(OUT_DIR, `${name}.png`);
      await page.screenshot({ path: filename, fullPage });

      console.log(`  ✅ ${name.padEnd(20)} → ${filename}  (${viewport.width}×${viewport.height})`);
    } catch (err) {
      console.log(`  ❌ ${name.padEnd(20)} → Erreur : ${err.message}`);
    }

    await context.close();
  }

  await browser.close();
  console.log(`\n🎨 Screenshots sauvegardés dans /${OUT_DIR}/`);
  console.log("💡 Partage ces images à Claude pour un feedback design précis.");
}

main().catch(console.error);
