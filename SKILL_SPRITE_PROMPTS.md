# SKILL EFFECT SPRITE PROMPTS
# For AI Image Generation (any tool)

Use these prompts to generate each skill effect sprite sheet.
After generating, you may need to:
- Remove background (make transparent)
- Resize to exact dimensions
- Ensure frames are evenly spaced in a horizontal row

---

## STYLE REFERENCE

Use this preamble in ALL prompts to keep art style consistent:

> pixel art, 2D game sprite sheet, anime-style, side view, transparent background, dark outline, vibrant colors, retro game aesthetic, high detail pixel art

---

## 1. FIREBALL PROJECTILE (MUST HAVE)

**Final file:** `fireball.png`
**Size:** 128 x 32 pixels (4 frames, each 32x32, in a horizontal row)

### Prompt:
```
Pixel art sprite sheet of a fireball projectile for a 2D fighting game.
4 animation frames in a single horizontal row.
Each frame is 32x32 pixels.
The fireball is a round ball of fire, facing right, with a bright yellow-white core, orange middle, and dark red outer flames.
Frame 1: compact fireball shape.
Frame 2: flames flicker outward slightly.
Frame 3: flames stretch and expand.
Frame 4: flames contract back.
Transparent background, dark pixel outline, side view, vibrant fire colors.
Style: anime pixel art, retro 2D game sprite.
```

### Color palette to mention:
- Core: bright yellow (#FACC22), white (#FFFFCC)
- Middle: orange (#FF8C00), dark orange (#FF6600)
- Outer: dark red (#CC3300), deep crimson (#661100)

---

## 2. FIREBALL EXPLOSION (MUST HAVE)

**Final file:** `fireball_explosion.png`
**Size:** 320 x 64 pixels (5 frames, each 64x64, in a horizontal row)

### Prompt:
```
Pixel art sprite sheet of a fire explosion for a 2D fighting game.
5 animation frames in a single horizontal row.
Each frame is 64x64 pixels.
Shows a fireball impact explosion sequence:
Frame 1: small bright white-yellow flash at center.
Frame 2: fire expanding outward, orange and yellow.
Frame 3: full size explosion, maximum size, bright orange with red edges and sparks.
Frame 4: fire breaking apart into embers and fragments, fading.
Frame 5: faint smoke wisps dissipating, nearly gone.
Transparent background, dark pixel outline, centered in each frame.
Style: anime pixel art, retro 2D game effect sprite.
```

---

## 3. FLAME SHIELD (SHOULD HAVE)

**Final file:** `flame_shield.png`
**Size:** 384 x 96 pixels (4 frames, each 96x96, in a horizontal row)

### Prompt:
```
Pixel art sprite sheet of a fire shield aura for a 2D fighting game.
4 animation frames in a single horizontal row.
Each frame is 96x96 pixels.
Shows a ring of protective flames surrounding a character. The CENTER of each frame must be EMPTY/TRANSPARENT (the character renders behind this).
The flames form a circular ring around the empty center area.
Frame 1: ring of flames, steady.
Frame 2: flames shift and rotate slightly clockwise, some flames taller.
Frame 3: flames shift more, variation in heights.
Frame 4: flames return toward frame 1 position for seamless loop.
Orange and red flames with yellow tips. Transparent background, transparent center area.
Style: anime pixel art, retro 2D game effect sprite.
```

### IMPORTANT NOTE:
The center ~40x56 pixel area MUST be empty/transparent. The player character shows through the middle. Only draw flames around the edges forming a protective ring.

---

## 4. FIRE PATCH - GROUND FIRE (SHOULD HAVE)

**Final file:** `fire_patch.png`
**Size:** 192 x 32 pixels (3 frames, each 64x32, in a horizontal row)

### Prompt:
```
Pixel art sprite sheet of ground fire for a 2D fighting game.
3 animation frames in a single horizontal row.
Each frame is 64 pixels wide and 32 pixels tall.
Shows low flames burning on a flat ground surface. Flames rise upward from the bottom edge.
Frame 1: several small flames flickering across the width, 16-24 pixels tall.
Frame 2: flames shift, some taller, some shorter, natural fire movement.
Frame 3: flames shift again, different variation.
The bottom edge is glowing embers (dark red/orange). Flames grow upward.
Transparent background, dark pixel outline.
Style: anime pixel art, retro 2D game hazard tile, side view.
```

---

## 5. ULTIMATE FLAME WAVE (SHOULD HAVE)

**Final file:** `ultimate_wave.png`
**Size:** 512 x 64 pixels (4 frames, each 128x64, in a horizontal row)

### Prompt:
```
Pixel art sprite sheet of a massive fire wave attack for a 2D fighting game ultimate ability.
4 animation frames in a single horizontal row.
Each frame is 128 pixels wide and 64 pixels tall.
Shows a large, powerful wall of fire traveling to the right. This is the most dramatic attack in the game.
Frame 1: tall wall of flame, white-hot bright core, orange and red outer flames.
Frame 2: flames churn and shift, intense heat.
Frame 3: leading edge of fire stretches forward aggressively.
Frame 4: flames pull back slightly, cycles back to frame 1.
Very bright colors - white center fading to yellow, orange, and deep crimson edges.
Transparent background, side view, facing right.
Style: anime pixel art, retro 2D game projectile, dramatic and powerful.
```

---

## 6. HIT IMPACT SPARK (NICE TO HAVE)

**Final file:** `hit_spark.png`
**Size:** 96 x 32 pixels (3 frames, each 32x32, in a horizontal row)

### Prompt:
```
Pixel art sprite sheet of a hit impact spark for a 2D fighting game.
3 animation frames in a single horizontal row.
Each frame is 32x32 pixels.
Classic fighting game hit flash effect:
Frame 1: bright white-yellow starburst flash, small, centered.
Frame 2: yellow sparks and lines radiating outward from center, expanding.
Frame 3: sparks fading away, nearly transparent, dissipating.
Transparent background, centered in each frame.
Style: anime pixel art, retro 2D fighting game impact effect.
```

---

# POST-GENERATION CHECKLIST

After generating each sprite with AI, verify:

- [ ] **Transparent background** — remove any solid background color
- [ ] **Correct total dimensions** — resize to exact pixel size listed above
- [ ] **Frames evenly spaced** — each frame occupies equal width in the horizontal strip
- [ ] **Consistent style** — matches your Fire Battlemancer character art
- [ ] **Facing right** — projectiles and wave should move/face to the right
- [ ] **Flame shield center is empty** — character must show through the middle

# QUICK REFERENCE TABLE

| File                    | Total Size  | Frames | Frame Size | Priority |
|-------------------------|-------------|--------|------------|----------|
| fireball.png            | 128 x 32   | 4      | 32 x 32   | MUST     |
| fireball_explosion.png  | 320 x 64   | 5      | 64 x 64   | MUST     |
| flame_shield.png        | 384 x 96   | 4      | 96 x 96   | SHOULD   |
| fire_patch.png          | 192 x 32   | 3      | 64 x 32   | SHOULD   |
| ultimate_wave.png       | 512 x 64   | 4      | 128 x 64  | SHOULD   |
| hit_spark.png           | 96 x 32    | 3      | 32 x 32   | NICE     |

All files go in the `Sprites/` folder.

# TIPS FOR AI IMAGE GENERATORS

1. If the AI doesn't generate a proper sprite sheet (frames in a row), generate individual frames separately and stitch them together in any image editor or even MS Paint.

2. If backgrounds aren't transparent, use a free tool like:
   - remove.bg (web-based, free)
   - GIMP (free, has "Color to Alpha" tool)
   - Photopea.com (free Photoshop clone in browser, supports transparency)

3. If the frames are uneven sizes, use Photopea or GIMP to:
   - Create a new canvas at the exact total size
   - Paste each frame at the correct position
   - Export as PNG with transparency

4. To keep style consistent, include a reference to your Fire Battlemancer character in the prompt (upload it as a style reference if the AI tool supports it).
