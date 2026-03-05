/**
 * Generates palette-swapped character sprites from Rina's base spritesheet.
 * Uses node-canvas for pixel manipulation.
 *
 * Usage: node tools/generate_sprites.mjs
 */
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPRITES_DIR = path.join(__dirname, '..', 'public', 'assets', 'sprites');
const INPUT = path.join(SPRITES_DIR, 'rina.png');

// ──── Color utilities ────

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  h /= 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255)
  ];
}

// ──── Palette definitions ────
// Each character maps color regions to new HSL values.
// Rina's base colors:
//   Hair: pink/magenta hue ~320-360, high saturation, high lightness
//   Outfit: purple hue ~270-320, medium saturation
//   Skin: warm low-saturation, high lightness
//   Dark (boots/outlines): low lightness

const PALETTES = {
  // Mortis — Death Reaper: spectral cyan-green, very dark robes
  mortis: {
    name: 'Mortis — The Soul Reaper',
    hair: { hue: 165, satMul: 0.8, lightMul: 0.7 },      // cyan-green hair
    outfit: { hue: 180, satMul: 0.3, lightMul: 0.35 },    // very dark teal robes
    skin: { hue: 40, satMul: 0.3, lightMul: 0.85 },       // pale bone
    dark: { hue: 200, satMul: 0.2, lightMul: 0.7 },       // dark blue-teal
  },

  // Hiro — Sun Dancer: golden-orange hair, dark navy outfit
  hiro: {
    name: 'Hiro — The Sun Dancer',
    hair: { hue: 35, satMul: 1.0, lightMul: 0.9 },        // golden orange
    outfit: { hue: 230, satMul: 0.5, lightMul: 0.45 },    // dark navy
    skin: { hue: 30, satMul: 0.5, lightMul: 1.0 },        // warm tan
    dark: { hue: 25, satMul: 0.15, lightMul: 0.75 },      // dark warm brown
  },

  // Karasu — Crimson Phantom: dark hair, crimson eyes/accents, near-black cloak
  karasu: {
    name: 'Karasu — The Crimson Phantom',
    hair: { hue: 270, satMul: 0.25, lightMul: 0.35 },     // near-black with violet
    outfit: { hue: 0, satMul: 0.4, lightMul: 0.3 },       // deep blood red/black
    skin: { hue: 25, satMul: 0.2, lightMul: 0.95 },       // pale ivory
    dark: { hue: 280, satMul: 0.15, lightMul: 0.6 },      // dark violet
  },
};

// ──── Main ────

async function main() {
  console.log('Loading base sprite:', INPUT);
  const img = await loadImage(INPUT);
  const w = img.width, h = img.height;
  console.log(`Sprite size: ${w}x${h}`);

  for (const [charKey, palette] of Object.entries(PALETTES)) {
    console.log(`\nGenerating: ${palette.name}`);

    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    let pixelsChanged = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
      if (a < 10) continue;

      const [hue, sat, light] = rgbToHsl(r, g, b);

      let region = null;

      // Classify pixel by Rina's palette regions
      if ((hue > 300 || hue < 20) && sat > 0.25 && light > 0.45) {
        // Pink hair region
        region = palette.hair;
      } else if (hue >= 260 && hue <= 330 && sat > 0.12 && light > 0.15 && light < 0.7) {
        // Purple outfit region
        region = palette.outfit;
      } else if (sat < 0.4 && light > 0.55 && r > g * 0.9) {
        // Skin tones
        region = palette.skin;
      } else if (light < 0.25) {
        // Dark areas (boots, outlines)
        region = palette.dark;
      }

      if (region) {
        const newH = region.hue;
        const newS = Math.min(sat * region.satMul, 0.95);
        const newL = Math.min(Math.max(light * region.lightMul, 0.02), 0.98);
        const [nr, ng, nb] = hslToRgb(newH, newS, newL);
        data[i] = nr;
        data[i+1] = ng;
        data[i+2] = nb;
        pixelsChanged++;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const outPath = path.join(SPRITES_DIR, `${charKey}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outPath, buffer);
    console.log(`  -> ${outPath} (${pixelsChanged} pixels remapped)`);
  }

  console.log('\nDone! Generated sprites for: ' + Object.keys(PALETTES).join(', '));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
