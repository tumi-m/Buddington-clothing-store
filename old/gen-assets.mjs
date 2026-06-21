// scripts/gen-assets.mjs
// Run in the Codespace terminal:  node scripts/gen-assets.mjs
// Generates license-free, house-palette SVG imagery into public/generated/.
// No native deps. These are CODE-drawn assets — the honest way a text model "ships images".
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "public/generated";
mkdirSync(OUT, { recursive: true });

const INK = "#16150f", PAPER = "#f4f1ea", GOLD = "#c9a44c", HAIR = "#d4cdbd";

// 1. GHOST tonal Voronoi-ish dazzle (near-black cells) — tileable 512x512
function voronoi() {
  const R = (n) => Math.floor(Math.random() * n);
  let cells = "";
  for (let i = 0; i < 46; i++) {
    const x = R(512), y = R(512), s = 40 + R(120);
    const g = 8 + R(26); // near-black greys
    const fill = `rgb(${g},${g},${g - 2 < 0 ? 0 : g - 2})`;
    cells += `<polygon points="${x},${y} ${x + s},${y + R(40)} ${x + R(50)},${y + s} ${x - R(40)},${y + R(60)}" fill="${fill}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<rect width="512" height="512" fill="${INK}"/>${cells}</svg>`;
}

// 2. GHOST dazzle wedges — asymmetric high-contrast silhouette breakers
function dazzle() {
  let w = "";
  for (let i = 0; i < 18; i++) {
    const x = i * 30 + (i % 2 ? 8 : 0);
    const fill = i % 2 ? GOLD : INK;
    w += `<polygon points="${x},0 ${x + 22},0 ${x + 4},512 ${x - 16},512" fill="${fill}" opacity="${i % 3 ? 0.9 : 0.5}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<rect width="512" height="512" fill="${INK}"/>${w}</svg>`;
}

// 3. Hi-frequency interference (SVG turbulence) — aliasing-style bands
function noise() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.02" numOctaves="2" stitchTiles="stitch"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.09  0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 0.5 0"/></filter>
<rect width="512" height="512" fill="${INK}"/><rect width="512" height="512" filter="url(#n)"/></svg>`;
}

// 4. Subtle paper grain overlay (low opacity, for hero/section grounds)
function grain() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
<filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
<feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer></filter>
<rect width="256" height="256" fill="${PAPER}"/><rect width="256" height="256" filter="url(#g)"/></svg>`;
}

// 5. Folio hairline rule
function folio() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="2" viewBox="0 0 1200 2">
<line x1="0" y1="1" x2="1200" y2="1" stroke="${HAIR}" stroke-width="1"/></svg>`;
}

const files = {
  "ghost-voronoi.svg": voronoi(),
  "ghost-dazzle.svg": dazzle(),
  "ghost-noise.svg": noise(),
  "hero-grain.svg": grain(),
  "folio-rule.svg": folio(),
};
for (const [name, svg] of Object.entries(files)) {
  writeFileSync(`${OUT}/${name}`, svg);
  console.log("wrote", `${OUT}/${name}`);
}
console.log("\nDone. Reference e.g.  background-image: url('/generated/ghost-voronoi.svg');");
