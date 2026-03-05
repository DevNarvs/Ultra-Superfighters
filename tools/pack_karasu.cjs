const sharp = require('sharp');
const path = require('path');

const CELL = 128;
const COLS = 6;
const ROWS = 11;
const OUT_W = COLS * CELL;
const OUT_H = ROWS * CELL;

const SPRITE_DIR = path.join(__dirname, '..', 'Sprites', 'Karasu Sprite');
const OUT_FILE = path.join(__dirname, '..', 'public', 'assets', 'sprites', 'karasu.png');

// Map: row index -> { file, frameCount }
// Row 0: idle(4), Row 1: run(6), Row 2: jump(3),
// Row 3: attack1(3), Row 4: attack2(3), Row 5: attack3(4),
// Row 6: cast(4), Row 7: hit(2), Row 8: dodge(2),
// Row 9: ult(4), Row 10: death(3)
const ROW_MAP = [
  { file: 'A0.png',  frames: 4 },  // idle
  { file: 'A1.png',  frames: 6 },  // run
  { file: 'A2.png',  frames: 3 },  // jump
  { file: 'A4.png',  frames: 3 },  // attack1 - quick strikes
  { file: 'A3.png',  frames: 3 },  // attack2 - medium hits
  { file: 'A6.png',  frames: 4 },  // attack3 - heavy finisher
  { file: 'A5.png',  frames: 4 },  // cast - ability
  { file: 'A7.png',  frames: 2 },  // hit
  { file: 'A8.png',  frames: 2 },  // dodge
  { file: 'A9.png',  frames: 4 },  // ult
  { file: 'A10.png', frames: 4 },  // death (use first 3 in anim, but pack 4)
];

async function extractFrame(srcPath, frameIndex, totalFrames) {
  const meta = await sharp(srcPath).metadata();
  const frameW = Math.floor(meta.width / totalFrames);
  const left = frameIndex * frameW;
  const extractW = Math.min(frameW, meta.width - left);

  // Extract the frame region
  const frameBuf = await sharp(srcPath)
    .extract({ left, top: 0, width: extractW, height: meta.height })
    .png()
    .toBuffer();

  // Trim transparent pixels to find the content bounding box
  const trimmed = sharp(frameBuf);
  const trimMeta = await trimmed.trim().metadata();

  // Resize to fit within CELL x CELL while preserving aspect ratio
  const trimmedBuf = await sharp(frameBuf)
    .trim()
    .resize(CELL, CELL, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return trimmedBuf;
}

async function main() {
  // Create blank transparent canvas
  const composites = [];

  for (let row = 0; row < ROW_MAP.length; row++) {
    const { file, frames } = ROW_MAP[row];
    const srcPath = path.join(SPRITE_DIR, file);
    console.log(`Row ${row}: ${file} (${frames} frames)`);

    for (let col = 0; col < frames; col++) {
      const frameBuf = await extractFrame(srcPath, col, frames);
      composites.push({
        input: frameBuf,
        left: col * CELL,
        top: row * CELL,
      });
    }
  }

  // Create the spritesheet
  await sharp({
    create: {
      width: OUT_W,
      height: OUT_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(OUT_FILE);

  console.log(`Spritesheet saved to ${OUT_FILE} (${OUT_W}x${OUT_H})`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
