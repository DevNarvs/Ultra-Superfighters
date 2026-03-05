const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────
const FRAME_W = 128;
const FRAME_H = 128;
const COLS = 6;
const ROWS = 11;
const PX = 4; // pixel scale (each "pixel" is 4x4 real pixels)

// ── Earth/Stone Palette ─────────────────────────────────
const C = {
  outline:    '#2a1f14',
  skin:       '#c4956a',
  skinLight:  '#d4a87a',
  skinDark:   '#a07850',
  hair:       '#3d2b1a',
  hairLight:  '#5a3f28',
  eyes:       '#1a1a1a',
  eyeWhite:   '#e8ddd0',
  bandage:    '#d4c8a0',
  bandageDk:  '#b0a480',
  pants:      '#5c4a32',
  pantsDk:    '#3e3222',
  belt:       '#8b7355',
  beltBuckle: '#c8a84e',
  boots:      '#3e3222',
  bootsDk:    '#2a2018',
  stone:      '#8a8a7a',
  stoneDk:    '#6a6a5a',
  stoneGlow:  '#b8a850',
  scar:       '#a07060',
  ground:     '#6a5a3a',
};

const canvas = createCanvas(COLS * FRAME_W, ROWS * FRAME_H);
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// ── Drawing Helpers ─────────────────────────────────────
function px(frameCol, frameRow, x, y, color, w = 1, h = 1) {
  ctx.fillStyle = color;
  const fx = frameCol * FRAME_W + x * PX;
  const fy = frameRow * FRAME_H + y * PX;
  ctx.fillRect(fx, fy, w * PX, h * PX);
}

function rect(fc, fr, x, y, w, h, color) {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++)
      px(fc, fr, x + dx, y + dy, color);
}

function outlined(fc, fr, x, y, w, h, fill) {
  rect(fc, fr, x, y, w, h, C.outline);
  rect(fc, fr, x + 1, y + 1, w - 2, h - 2, fill);
}

// Draw a simple head: blocky, strong jaw
function drawHead(fc, fr, x, y, lookDir = 0) {
  // Hair (spiky, short)
  rect(fc, fr, x + 2, y, 8, 2, C.hair);
  rect(fc, fr, x + 1, y + 1, 10, 1, C.hair);
  // Spikes
  px(fc, fr, x + 3, y - 1, C.hair);
  px(fc, fr, x + 6, y - 2, C.hair);
  px(fc, fr, x + 8, y - 1, C.hairLight);
  px(fc, fr, x + 5, y - 1, C.hairLight);

  // Head shape
  rect(fc, fr, x + 1, y + 2, 10, 7, C.skin);
  rect(fc, fr, x + 2, y + 9, 8, 1, C.skin); // jaw
  // Outline
  rect(fc, fr, x, y + 2, 1, 7, C.outline);
  rect(fc, fr, x + 11, y + 2, 1, 7, C.outline);
  rect(fc, fr, x + 1, y + 10, 10, 1, C.outline);

  // Face details
  // Eyes
  px(fc, fr, x + 3 + lookDir, y + 4, C.eyeWhite);
  px(fc, fr, x + 4 + lookDir, y + 4, C.eyes);
  px(fc, fr, x + 7 + lookDir, y + 4, C.eyeWhite);
  px(fc, fr, x + 8 + lookDir, y + 4, C.eyes);
  // Brow (thick, angry)
  rect(fc, fr, x + 3, y + 3, 3, 1, C.outline);
  rect(fc, fr, x + 7, y + 3, 3, 1, C.outline);
  // Nose
  px(fc, fr, x + 5, y + 5, C.skinDark);
  px(fc, fr, x + 6, y + 6, C.skinDark);
  // Mouth
  rect(fc, fr, x + 4, y + 7, 4, 1, C.skinDark);
  // Scar across left eye
  px(fc, fr, x + 3, y + 3, C.scar);
  px(fc, fr, x + 3, y + 5, C.scar);
  // Chin shadow
  rect(fc, fr, x + 3, y + 8, 6, 1, C.skinDark);
}

// Draw muscular torso
function drawTorso(fc, fr, x, y, lean = 0) {
  // Broad shoulders
  rect(fc, fr, x, y, 14, 2, C.skin);
  rect(fc, fr, x + 1, y + 2, 12, 7, C.skin);
  // Muscle definition
  px(fc, fr, x + 7 + lean, y + 3, C.skinDark); // center line
  px(fc, fr, x + 7 + lean, y + 5, C.skinDark);
  px(fc, fr, x + 7 + lean, y + 7, C.skinDark);
  // Pecs
  rect(fc, fr, x + 3, y + 2, 3, 2, C.skinLight);
  rect(fc, fr, x + 9, y + 2, 3, 2, C.skinLight);
  // Abs
  px(fc, fr, x + 5, y + 5, C.skinLight);
  px(fc, fr, x + 9, y + 5, C.skinLight);
  px(fc, fr, x + 5, y + 7, C.skinLight);
  px(fc, fr, x + 9, y + 7, C.skinLight);
  // Outline
  rect(fc, fr, x - 1, y, 1, 2, C.outline);
  rect(fc, fr, x + 14, y, 1, 2, C.outline);
  rect(fc, fr, x, y + 9, 14, 1, C.outline);
  // Stone markings on shoulder
  px(fc, fr, x + 1, y, C.stone);
  px(fc, fr, x + 2, y + 1, C.stone);
  px(fc, fr, x + 12, y, C.stone);
  px(fc, fr, x + 11, y + 1, C.stone);
  // Belt
  rect(fc, fr, x + 1, y + 8, 12, 2, C.belt);
  px(fc, fr, x + 7, y + 8, C.beltBuckle);
  px(fc, fr, x + 7, y + 9, C.beltBuckle);
}

// Arm with bandaged fist
function drawArm(fc, fr, x, y, raised = 0, fist = false) {
  // Upper arm
  rect(fc, fr, x, y, 3, 4 - raised, C.skin);
  px(fc, fr, x + 1, y + 1, C.skinLight);
  // Forearm with bandage
  const fy = y + 4 - raised;
  rect(fc, fr, x, fy, 3, 3, C.bandage);
  px(fc, fr, x, fy + 1, C.bandageDk);
  px(fc, fr, x + 2, fy + 2, C.bandageDk);
  // Fist
  if (fist) {
    rect(fc, fr, x - 1, fy + 3, 4, 3, C.bandage);
    rect(fc, fr, x - 1, fy + 3, 4, 1, C.bandageDk);
    // Stone knuckle glow
    px(fc, fr, x, fy + 3, C.stoneGlow);
    px(fc, fr, x + 1, fy + 3, C.stoneGlow);
  } else {
    rect(fc, fr, x, fy + 3, 3, 2, C.bandage);
    px(fc, fr, x, fy + 3, C.bandageDk);
  }
}

// Leg with pants and boots
function drawLeg(fc, fr, x, y, step = 0) {
  // Upper leg (pants)
  rect(fc, fr, x, y, 4, 5 + step, C.pants);
  px(fc, fr, x + 1, y + 1, C.pantsDk);
  rect(fc, fr, x, y + 5 + step, 4, 1, C.pantsDk);
  // Boot
  const by = y + 6 + step;
  rect(fc, fr, x - 1, by, 5, 3, C.boots);
  rect(fc, fr, x - 1, by + 3, 6, 1, C.bootsDk); // sole
  px(fc, fr, x, by, C.bootsDk);
}

// ── Full Character Pose ─────────────────────────────────
function drawBrawler(fc, fr, opts = {}) {
  const {
    headX = 10, headY = 2,
    torsoX = 8, torsoY = 12,
    lArmX = 3, lArmY = 12, lArmRaise = 0, lFist = true,
    rArmX = 22, rArmY = 12, rArmRaise = 0, rFist = true,
    lLegX = 9, lLegY = 22, lLegStep = 0,
    rLegX = 17, rLegY = 22, rLegStep = 0,
    headLook = 0, torsoLean = 0,
    stoneAura = false, yell = false,
  } = opts;

  // Stone aura effect
  if (stoneAura) {
    for (let i = 0; i < 6; i++) {
      const ax = torsoX + Math.floor(Math.random() * 14);
      const ay = torsoY - 2 + Math.floor(Math.random() * 14);
      px(fc, fr, ax, ay, C.stoneGlow);
    }
    // Ground cracks
    rect(fc, fr, lLegX - 3, lLegY + 12, 2, 1, C.stone);
    rect(fc, fr, rLegX + 5, rLegY + 12, 3, 1, C.stone);
    px(fc, fr, lLegX - 1, lLegY + 13, C.stoneDk);
    px(fc, fr, rLegX + 6, rLegY + 13, C.stoneDk);
  }

  // Draw order: legs behind, torso, arms, head on top
  drawLeg(fc, fr, lLegX, lLegY, lLegStep);
  drawLeg(fc, fr, rLegX, rLegY, rLegStep);
  drawTorso(fc, fr, torsoX, torsoY, torsoLean);
  drawArm(fc, fr, lArmX, lArmY, lArmRaise, lFist);
  drawArm(fc, fr, rArmX, rArmY, rArmRaise, rFist);
  drawHead(fc, fr, headX, headY, headLook);

  // Yelling mouth
  if (yell) {
    rect(fc, fr, headX + 4, headY + 7, 4, 2, C.outline);
    rect(fc, fr, headX + 5, headY + 7, 2, 1, C.scar);
  }
}

// ── Animation Frames ────────────────────────────────────
// Row 0: Idle (4 frames) — breathing/stance shift
for (let i = 0; i < 4; i++) {
  const bob = i < 2 ? 0 : 1;
  drawBrawler(i, 0, {
    headY: 2 + bob,
    torsoY: 12 + bob,
    lArmY: 12 + bob, rArmY: 12 + bob,
    lLegY: 22 + bob, rLegY: 22 + bob,
    lArmRaise: i === 1 ? 1 : 0,
    rArmRaise: i === 3 ? 1 : 0,
  });
}

// Row 1: Run (6 frames)
for (let i = 0; i < 6; i++) {
  const phase = [0, 1, 2, 1, 0, -1][i];
  const armPhase = [1, 2, 0, -1, 0, 1][i];
  drawBrawler(i, 1, {
    headX: 11 + (i % 2), headY: 2 - Math.abs(phase),
    torsoX: 9, torsoY: 12 - Math.abs(phase), torsoLean: 1,
    lArmX: 4, lArmY: 12 - Math.abs(phase), lArmRaise: armPhase > 0 ? armPhase : 0,
    rArmX: 23, rArmY: 12 - Math.abs(phase), rArmRaise: armPhase < 0 ? -armPhase : 0,
    lLegX: 9, lLegY: 22 - Math.abs(phase), lLegStep: phase,
    rLegX: 17, rLegY: 22 - Math.abs(phase), rLegStep: -phase,
  });
}

// Row 2: Jump (3 frames) — crouch, rise, peak
drawBrawler(0, 2, {
  headY: 5, torsoY: 15,
  lArmY: 15, rArmY: 15,
  lLegY: 25, rLegY: 25, lLegStep: -2, rLegStep: -2,
});
drawBrawler(1, 2, {
  headY: 0, torsoY: 10,
  lArmX: 3, lArmY: 10, lArmRaise: 2,
  rArmX: 22, rArmY: 10, rArmRaise: 2,
  lLegY: 20, rLegY: 20,
});
drawBrawler(2, 2, {
  headY: 1, torsoY: 11,
  lArmX: 2, lArmY: 11, lArmRaise: 3,
  rArmX: 23, rArmY: 11, rArmRaise: 3,
  lLegY: 21, rLegY: 21, lLegStep: 1, rLegStep: -1,
});

// Row 3: Attack1 — quick jab (3 frames)
drawBrawler(0, 3, {
  torsoLean: 0,
  rArmRaise: 1, rFist: true,
});
drawBrawler(1, 3, {
  headX: 12, torsoX: 10, torsoLean: 1,
  lArmX: 5, rArmX: 25, rArmY: 11, rArmRaise: 3, rFist: true,
});
drawBrawler(2, 3, {
  headX: 11, torsoX: 9,
  rArmRaise: 1, rFist: true, stoneAura: false,
});

// Row 4: Attack2 — cross hook (3 frames)
drawBrawler(0, 4, {
  lArmRaise: 1, lFist: true,
});
drawBrawler(1, 4, {
  headX: 9, torsoX: 7, torsoLean: -1,
  lArmX: 1, lArmY: 11, lArmRaise: 3, lFist: true,
  rArmX: 21,
});
drawBrawler(2, 4, {
  headX: 10, torsoX: 8,
  lArmRaise: 1, lFist: true,
});

// Row 5: Attack3 — ground slam (4 frames)
drawBrawler(0, 5, {
  lArmRaise: 2, rArmRaise: 2, lFist: true, rFist: true,
  yell: true,
});
drawBrawler(1, 5, {
  headY: 0,
  lArmRaise: 4, rArmRaise: 4, lFist: true, rFist: true,
  yell: true,
});
drawBrawler(2, 5, {
  headY: 4, torsoY: 14,
  lArmX: 4, lArmY: 16, rArmX: 21, rArmY: 16,
  lLegY: 23, rLegY: 23, lLegStep: -1, rLegStep: -1,
  lFist: true, rFist: true, stoneAura: true,
  yell: true,
});
drawBrawler(3, 5, {
  headY: 3, torsoY: 13,
  lArmY: 14, rArmY: 14,
  lLegY: 23, rLegY: 23,
  lFist: true, rFist: true, stoneAura: true,
});

// Row 6: Cast / ability (4 frames) — stone summon
drawBrawler(0, 6, {
  lArmRaise: 1, rArmRaise: 1,
});
drawBrawler(1, 6, {
  lArmRaise: 2, rArmRaise: 2, lFist: true, rFist: true,
  stoneAura: true,
});
drawBrawler(2, 6, {
  lArmRaise: 3, rArmRaise: 3, lFist: true, rFist: true,
  stoneAura: true, yell: true,
});
drawBrawler(3, 6, {
  lArmRaise: 1, rArmRaise: 1,
  stoneAura: true,
});

// Row 7: Hit / hurt (2 frames)
drawBrawler(0, 7, {
  headX: 9, headY: 3, torsoX: 7, torsoLean: -1,
  lArmX: 2, rArmX: 21,
});
drawBrawler(1, 7, {
  headX: 8, headY: 4, torsoX: 6, torsoLean: -2,
  lArmX: 1, lArmY: 13, rArmX: 20, rArmY: 13,
});

// Row 8: Dodge (2 frames) — stone skin flash
drawBrawler(0, 8, {
  headX: 12, torsoX: 10,
  lArmX: 5, rArmX: 24,
  lLegX: 11, rLegX: 19,
});
drawBrawler(1, 8, {
  headX: 14, torsoX: 12,
  lArmX: 7, rArmX: 26,
  lLegX: 13, rLegX: 21,
});

// Row 9: Ultimate (4 frames) — earth eruption
drawBrawler(0, 9, {
  lArmRaise: 1, rArmRaise: 1, yell: true,
});
drawBrawler(1, 9, {
  headY: 1, lArmRaise: 3, rArmRaise: 3,
  lFist: true, rFist: true, yell: true, stoneAura: true,
});
drawBrawler(2, 9, {
  headY: 4, torsoY: 14,
  lArmX: 2, lArmY: 16, lArmRaise: 0,
  rArmX: 23, rArmY: 16, rArmRaise: 0,
  lLegY: 23, rLegY: 23, lLegStep: -2, rLegStep: -2,
  lFist: true, rFist: true, stoneAura: true, yell: true,
});
// Big stone eruption effect
drawBrawler(3, 9, {
  headY: 3, torsoY: 13,
  lArmY: 14, rArmY: 14,
  lLegY: 23, rLegY: 23,
  lFist: true, rFist: true, stoneAura: true,
});
// Extra stone pillars for ult frame 2-3
for (let i = 2; i <= 3; i++) {
  for (let p = 0; p < 3; p++) {
    const px0 = 2 + p * 10;
    const h = 3 + Math.floor(Math.random() * 5);
    rect(i, 9, px0, 30 - h, 3, h, C.stone);
    rect(i, 9, px0 + 1, 30 - h, 1, h, C.stoneDk);
    px(i, 9, px0, 30 - h, C.stoneGlow);
  }
}

// Row 10: Death (3 frames) — fall backward
drawBrawler(0, 10, {
  headX: 9, headY: 4, torsoX: 7, torsoLean: -1,
  lArmX: 2, lArmY: 13, rArmX: 20, rArmY: 13,
});
drawBrawler(1, 10, {
  headX: 7, headY: 8, torsoX: 5, torsoY: 16,
  lArmX: 0, lArmY: 17, rArmX: 18, rArmY: 17,
  lLegX: 7, lLegY: 24, rLegX: 15, rLegY: 24,
  lLegStep: -2, rLegStep: -1,
});
// Lying flat — simplified
drawBrawler(2, 10, {
  headX: 5, headY: 14, torsoX: 3, torsoY: 20,
  lArmX: -2, lArmY: 21, rArmX: 16, rArmY: 21,
  lLegX: 5, lLegY: 26, rLegX: 13, rLegY: 26,
  lLegStep: -3, rLegStep: -3,
});

// ── Output ──────────────────────────────────────────────
const outPath = path.join(__dirname, '..', 'public', 'assets', 'sprites', 'golem_brawler.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outPath, buffer);
console.log(`Spritesheet saved to ${outPath}`);
console.log(`Size: ${COLS * FRAME_W}x${ROWS * FRAME_H} (${COLS}×${ROWS} grid, ${FRAME_W}×${FRAME_H} per frame)`);
