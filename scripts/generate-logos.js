/**
 * generate-logos.js
 * Génère toutes les variantes de couleur du logo PassionSpark.
 * Usage : node scripts/generate-logos.js
 */

const fs   = require("fs");
const path = require("path");

// ─── Sources ───────────────────────────────────────────────────────────────────
const srcWordmark = path.resolve(__dirname, "../public/PassionSpark_logoavectext_svg.svg");
const srcIcon     = path.resolve(__dirname, "../public/PassionSpark_icon.svg");
const outDir      = path.resolve(__dirname, "../public/logos");

fs.mkdirSync(outDir, { recursive: true });

// ─── Helpers de découpe ───────────────────────────────────────────────────────
function parseSvg(file) {
  const src     = fs.readFileSync(file, "utf-8");
  const defsEnd = src.indexOf("</defs>") + 7;
  const svgClose = src.lastIndexOf("</svg>");
  return {
    header: src.slice(0, src.indexOf("\n")),
    paths:  src.slice(defsEnd, svgClose).trim(),
  };
}

const wm     = parseSvg(srcWordmark);
const icon   = parseSvg(srcIcon);

// compatibilité avec le reste du script (wordmark = default)
const svgHeader = wm.header;
const paths     = wm.paths;

// ─── Variants ─────────────────────────────────────────────────────────────────
const variants = [
  // nom          couleur principale        commentaire
  { name: "blanc",  color: "#FFFFFF"                              },
  { name: "noir",   color: "#0D0D0D"                              },
  { name: "orange", color: "#FF7A00"                              },
  { name: "bleu",   color: "#1D4ED8"                              },
  { name: "rouge",  color: "#DC2626"                              },
  { name: "jaune",  color: "#FBBF24"                              },
  { name: "gris",   color: "#6B7280"                              },
  { name: "or",     color: "#D4AF37"                              },
  { name: "beige",  color: "#C9A96E"                              },
  { name: "creme",  color: "#F5F0E8"                              },
];

// ─── Helper : wrap paths avec un style override ───────────────────────────────
function buildMono(color) {
  return `${svgHeader}
<defs>
  <style>path { fill: ${color}; }</style>
</defs>
${paths}
</svg>`;
}

// ─── 1. Flamme (original) ─────────────────────────────────────────────────────
fs.copyFileSync(srcWordmark, path.join(outDir, "passionspark-flamme.svg"));
console.log("✅  passionspark-flamme.svg   ← original");

// ─── 2. Variants mono ─────────────────────────────────────────────────────────
for (const { name, color } of variants) {
  const filename = `passionspark-${name}.svg`;
  fs.writeFileSync(path.join(outDir, filename), buildMono(color), "utf-8");
  console.log(`✅  ${filename.padEnd(32)} ${color}`);
}

// ─── 3. Métal (gradient argent) ───────────────────────────────────────────────
const metalSvg = `${svgHeader}
<defs>
  <linearGradient id="MetalGrad" gradientUnits="userSpaceOnUse" x1="1024" y1="0" x2="1024" y2="707">
    <stop offset="0%"   stop-color="#F2F2F2"/>
    <stop offset="20%"  stop-color="#C8C8C8"/>
    <stop offset="45%"  stop-color="#888888"/>
    <stop offset="70%"  stop-color="#C8C8C8"/>
    <stop offset="100%" stop-color="#F0F0F0"/>
  </linearGradient>
  <style>path { fill: url(#MetalGrad); }</style>
</defs>
${paths}
</svg>`;
fs.writeFileSync(path.join(outDir, "passionspark-metal.svg"), metalSvg, "utf-8");
console.log("✅  passionspark-metal.svg             gradient argent");

// ─── 4. Or (gradient doré) ────────────────────────────────────────────────────
// Remplace le flat or par un vrai gradient luxe
const goldSvg = `${svgHeader}
<defs>
  <linearGradient id="GoldGrad" gradientUnits="userSpaceOnUse" x1="1024" y1="0" x2="1024" y2="707">
    <stop offset="0%"   stop-color="#FFF0A0"/>
    <stop offset="25%"  stop-color="#D4AF37"/>
    <stop offset="55%"  stop-color="#8B6914"/>
    <stop offset="80%"  stop-color="#D4AF37"/>
    <stop offset="100%" stop-color="#FFE87C"/>
  </linearGradient>
  <style>path { fill: url(#GoldGrad); }</style>
</defs>
${paths}
</svg>`;
// Overwrite the flat or with the gradient version
fs.writeFileSync(path.join(outDir, "passionspark-or.svg"), goldSvg, "utf-8");
console.log("✅  passionspark-or.svg       (overwrite → gradient doré)");

// ─── Icône : mêmes variants ───────────────────────────────────────────────────
console.log("\n── Icône ──");

fs.copyFileSync(srcIcon, path.join(outDir, "icon-flamme.svg"));
console.log("✅  icon-flamme.svg          ← original");

for (const { name, color } of variants) {
  const filename = `icon-${name}.svg`;
  const svg = `${icon.header}\n<defs>\n  <style>path { fill: ${color}; }</style>\n</defs>\n${icon.paths}\n</svg>`;
  fs.writeFileSync(path.join(outDir, filename), svg, "utf-8");
  console.log(`✅  ${filename.padEnd(32)} ${color}`);
}

// icon metal
const iconMetal = `${icon.header}
<defs>
  <linearGradient id="MetalGrad" gradientUnits="userSpaceOnUse" x1="300" y1="658" x2="300" y2="46">
    <stop offset="0%"   stop-color="#F2F2F2"/>
    <stop offset="20%"  stop-color="#C8C8C8"/>
    <stop offset="45%"  stop-color="#888888"/>
    <stop offset="70%"  stop-color="#C8C8C8"/>
    <stop offset="100%" stop-color="#F0F0F0"/>
  </linearGradient>
  <style>path { fill: url(#MetalGrad); }</style>
</defs>
${icon.paths}
</svg>`;
fs.writeFileSync(path.join(outDir, "icon-metal.svg"), iconMetal, "utf-8");
console.log("✅  icon-metal.svg                    gradient argent");

// icon or
const iconGold = `${icon.header}
<defs>
  <linearGradient id="GoldGrad" gradientUnits="userSpaceOnUse" x1="300" y1="658" x2="300" y2="46">
    <stop offset="0%"   stop-color="#FFF0A0"/>
    <stop offset="25%"  stop-color="#D4AF37"/>
    <stop offset="55%"  stop-color="#8B6914"/>
    <stop offset="80%"  stop-color="#D4AF37"/>
    <stop offset="100%" stop-color="#FFE87C"/>
  </linearGradient>
  <style>path { fill: url(#GoldGrad); }</style>
</defs>
${icon.paths}
</svg>`;
fs.writeFileSync(path.join(outDir, "icon-or.svg"), iconGold, "utf-8");
console.log("✅  icon-or.svg               (overwrite → gradient doré)");

// ─── Résumé ───────────────────────────────────────────────────────────────────
const files = fs.readdirSync(outDir).filter(f => f.endsWith(".svg"));
console.log(`\n📁  ${outDir}`);
console.log(`   ${files.length} fichiers SVG générés\n`);
