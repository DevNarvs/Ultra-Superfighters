/**
 * Packs Karasu individual sprite strips into:
 * 1. A character spritesheet (6 columns x 11 rows, 128x128 cells)
 * 2. Individual VFX spritesheets (B-series)
 *
 * Each frame is resized to fit within 128x128, centered on transparent bg.
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const INPUT_DIR = 'Sprites/Karasu Sprite';
const OUTPUT_DIR = 'public/assets/sprites';
const CELL = 128;
const COLS = 6;

// Character animation strips in row order (matching AnimationManager)
const CHARACTER_STRIPS = [
  { file: 'A0.png',  frames: 4 },  // row 0: idle
  { file: 'A1.png',  frames: 6 },  // row 1: run
  { file: 'A2.png',  frames: 3 },  // row 2: jump
  { file: 'A3.png',  frames: 3 },  // row 3: attack1
  { file: 'A4.png',  frames: 3 },  // row 4: attack2
  { file: 'A5.png',  frames: 4 },  // row 5: attack3
  { file: 'A6.png',  frames: 4 },  // row 6: cast
  { file: 'A7.png',  frames: 2 },  // row 7: hit
  { file: 'A8.png',  frames: 2 },  // row 8: dodge
  { file: 'A9.png',  frames: 4 },  // row 9: ult
  { file: 'A10.png', frames: 3 },  // row 10: death
];

// VFX strips
const VFX_STRIPS = [
  { file: 'B1.png', name: 'karasu_black_flame',    frames: 4, cell: 64  },
  { file: 'B2.png', name: 'karasu_flame_impact',   frames: 5, cell: 128 },
  { file: 'B3.png', name: 'karasu_crow_sub',       frames: 4, cell: 128 },
  { file: 'B4.png', name: 'karasu_phantom_slash',  frames: 3, cell: 128 },
  { file: 'B5.png', name: 'karasu_susanoo',        frames: 4, cell: 128 },
  { file: 'B6.png', name: 'karasu_hellfire',        frames: 4, cell: 128 },
];

async function extractFrames(filePath, numFrames) {
  const img = sharp(filePath);
  const meta = await img.metadata();
  const frameW = Math.floor(meta.width / numFrames);
  const frameH = meta.height;
  const frames = [];

  for (let i = 0; i < numFrames; i++) {
    const extracted = await sharp(filePath)
      .extract({ left: i * frameW, top: 0, width: frameW, height: frameH })
      .toBuffer();
    frames.push({ buffer: extracted, width: frameW, height: frameH });
  }
  return frames;
}

async function fitToCell(frameBuffer, frameW, frameH, cellSize) {
  // Scale frame to fit within cellSize x cellSize, maintaining aspect ratio
  const scale = Math.min(cellSize / frameW, cellSize / frameH);
  const newW = Math.round(frameW * scale);
  const newH = Math.round(frameH * scale);

  // Resize the frame
  const resized = await sharp(frameBuffer)
    .resize(newW, newH, { fit: 'inside' })
    .toBuffer();

  // Center on transparent cell
  const offsetX = Math.round((cellSize - newW) / 2);
  const offsetY = Math.round((cellSize - newH) / 2);

  const cell = await sharp({
    create: { width: cellSize, height: cellSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .composite([{ input: resized, left: offsetX, top: offsetY }])
    .png()
    .toBuffer();

  return cell;
}

async function packCharacterSheet() {
  const ROWS = CHARACTER_STRIPS.length;
  const sheetW = COLS * CELL;
  const sheetH = ROWS * CELL;

  // Prepare all cells
  const composites = [];

  for (let row = 0; row < ROWS; row++) {
    const strip = CHARACTER_STRIPS[row];
    const filePath = path.join(INPUT_DIR, strip.file);

    if (!fs.existsSync(filePath)) {
      console.warn(`Missing: ${filePath}, skipping row ${row}`);
      continue;
    }

    console.log(`Processing ${strip.file} (row ${row}, ${strip.frames} frames)...`);
    const frames = await extractFrames(filePath, strip.frames);

    for (let col = 0; col < frames.length; col++) {
      const frame = frames[col];
      const cellBuf = await fitToCell(frame.buffer, frame.width, frame.height, CELL);
      composites.push({
        input: cellBuf,
        left: col * CELL,
        top: row * CELL,
      });
    }
  }

  // Create the final spritesheet
  const sheet = await sharp({
    create: { width: sheetW, height: sheetH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .composite(composites)
    .png()
    .toFile(path.join(OUTPUT_DIR, 'karasu.png'));

  console.log(`Character spritesheet saved: ${COLS}x${ROWS} grid, ${sheetW}x${sheetH}px`);
}

async function packVFXSheets() {
  const effectsDir = path.join(OUTPUT_DIR, 'effects');
  if (!fs.existsSync(effectsDir)) fs.mkdirSync(effectsDir, { recursive: true });

  for (const vfx of VFX_STRIPS) {
    const filePath = path.join(INPUT_DIR, vfx.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`Missing VFX: ${filePath}, skipping`);
      continue;
    }

    console.log(`Processing VFX ${vfx.file} -> ${vfx.name} (${vfx.frames} frames, ${vfx.cell}px cells)...`);
    const frames = await extractFrames(filePath, vfx.frames);
    const composites = [];

    for (let i = 0; i < frames.length; i++) {
      const cellBuf = await fitToCell(frames[i].buffer, frames[i].width, frames[i].height, vfx.cell);
      composites.push({ input: cellBuf, left: i * vfx.cell, top: 0 });
    }

    await sharp({
      create: {
        width: vfx.frames * vfx.cell,
        height: vfx.cell,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite(composites)
      .png()
      .toFile(path.join(effectsDir, `${vfx.name}.png`));

    console.log(`  -> ${vfx.name}.png (${vfx.frames * vfx.cell}x${vfx.cell})`);
  }
}

async function main() {
  console.log('=== Packing Karasu Spritesheets ===\n');
  await packCharacterSheet();
  console.log('');
  await packVFXSheets();
  console.log('\nDone!');
}

main().catch(console.error);
