# SKILL EFFECTS SPRITE SPECIFICATION
# Super Battlemancers

---

## GENERAL RULES (All Effects)

| Property         | Value                                                |
|------------------|------------------------------------------------------|
| **Layout**       | Horizontal strip — all frames in a single row        |
| **Background**   | Transparent (PNG-24 with alpha)                      |
| **Art style**    | Anime pixel art, matching character sprite style     |
| **Outline**      | 1px dark outline                                     |
| **Shading**      | 2–3 shade levels per color                           |
| **Direction**    | Projectiles face **RIGHT** — engine flips for left   |
| **Centering**    | Each effect centered within its frame                |
| **Format**       | PNG-24 with transparency                             |
| **Location**     | `Sprites/` folder                                    |

---

## OVERVIEW TABLE

| #  | Effect              | Filename                 | Frame Size | Frames | Total Sheet Size | Priority     |
|----|---------------------|--------------------------|------------|--------|------------------|--------------|
| 1  | Fireball Projectile | `fireball.png`           | 32 × 32   | 4      | **128 × 32**     | 🔴 MUST HAVE |
| 2  | Fireball Explosion  | `fireball_explosion.png` | 64 × 64   | 5      | **320 × 64**     | 🔴 MUST HAVE |
| 3  | Flame Shield Ring   | `flame_shield.png`       | 96 × 96   | 4      | **384 × 96**     | 🟡 SHOULD    |
| 4  | Fire Patch (Ground) | `fire_patch.png`         | 64 × 32   | 3      | **192 × 32**     | 🟡 SHOULD    |
| 5  | Ultimate Flame Wave | `ultimate_wave.png`      | 128 × 64  | 4      | **512 × 64**     | 🟡 SHOULD    |
| 6  | Hit Impact Spark    | `hit_spark.png`          | 32 × 32   | 3      | **96 × 32**      | 🟢 NICE      |

> Any effect you skip will automatically use a **particle-only fallback** at runtime. The game still works — just less polished.

---

## HOW HYBRID EFFECTS WORK

Each skill visual = **your sprite** + **engine particles**

```
  [Your Sprite Art]   +   [Engine Particles]   =   [Final In-Game Look]
   (shape & style)       (glow, trail, sparks)     (polished & dynamic)
```

- You provide the **core shape and art** (the fireball, the explosion, the flames)
- The engine adds **glow, trails, sparks, screen shake** on top at runtime
- This means your sprites don't need to include trailing particles or ambient glow — just the main effect shape

---

## EFFECT 1: FIREBALL PROJECTILE 🔴

### Specification

| Property         | Value                                       |
|------------------|---------------------------------------------|
| **Filename**     | `fireball.png`                              |
| **Frame size**   | 32 × 32 px                                 |
| **Frames**       | 4                                           |
| **Total size**   | 128 × 32 px                                |
| **Animation**    | Looping, 80ms per frame                     |
| **Direction**    | Facing right (engine flips for left)        |
| **Engine adds**  | Fire particle trail behind, additive glow   |

### Layout
```
[  F0  ][  F1  ][  F2  ][  F3  ]
 32×32   32×32   32×32   32×32
```

### Frame Descriptions

| Frame | Description |
|-------|-------------|
| F0 | Compact fireball shape — round ball of fire, bright yellow-white core, orange middle layer, dark red outer flames |
| F1 | Slight flicker — flames shift outward slightly, core wobbles, outer shape changes subtly |
| F2 | Flames stretch — fire expands slightly, some flame wisps extend, size varies from F0 |
| F3 | Flames contract — returning toward F0 shape for seamless loop |

### Color Palette
| Layer       | Colors |
|-------------|--------|
| Core        | Bright yellow (#FACC22), white-yellow (#FFFFCC) |
| Middle      | Orange (#FF8C00), dark orange (#FF6600) |
| Outer       | Dark red (#CC3300), deep crimson (#661100) |

### Design Notes
- Fireball diameter: ~20–24px centered in the 32×32 frame
- Leave some padding around the fireball for the flame edges to flicker into
- The engine adds a trailing particle effect behind it, so the sprite only needs the ball itself

### AI Prompt
```
Pixel art sprite sheet of a fireball projectile for a 2D fighting game.
4 animation frames in a single horizontal row, each frame 32x32 pixels.
Total image: 128x32 pixels.
Round ball of fire facing right.
Bright yellow-white hot core center, orange middle, dark red outer flames.
Frame 1: compact round fireball.
Frame 2: flames flicker outward slightly.
Frame 3: flames stretch and expand.
Frame 4: flames contract back toward frame 1.
Transparent background, dark pixel outline, side view.
Style: anime pixel art, retro 2D game sprite, vibrant fire colors.
```

---

## EFFECT 2: FIREBALL EXPLOSION 🔴

### Specification

| Property         | Value                                          |
|------------------|------------------------------------------------|
| **Filename**     | `fireball_explosion.png`                       |
| **Frame size**   | 64 × 64 px                                    |
| **Frames**       | 5                                              |
| **Total size**   | 320 × 64 px                                   |
| **Animation**    | One-shot, 60ms per frame (very fast)           |
| **Engine adds**  | Small spark particles flying outward, screen shake on heavy hits |

### Layout
```
[   F0   ][   F1   ][   F2   ][   F3   ][   F4   ]
  64×64    64×64     64×64     64×64     64×64
```

### Frame Descriptions

| Frame | Description |
|-------|-------------|
| F0 | **Initial flash** — small bright white-yellow flash at center (~16px diameter) |
| F1 | **Expanding** — fire blooms outward (~32px), bright yellow core with orange edges |
| F2 | **Full size** — maximum expansion (~48px), intense orange with red edges, sparks visible |
| F3 | **Fading** — fire breaks apart into embers and fragments, becoming more transparent |
| F4 | **Dissipating** — faint smoke wisps, nearly transparent, just traces remaining |

### Color Progression
| Frame | Dominant Colors |
|-------|----------------|
| F0    | White (#FFFFFF), bright yellow (#FFFF88) |
| F1    | Yellow (#FACC22), bright orange (#FF8C00) |
| F2    | Orange (#FF6600), red (#FF3300) |
| F3    | Dark orange (#CC5500), red (#AA2200), gray smoke (#666666) |
| F4    | Gray smoke (#555555), faint orange (#88440044) |

### Design Notes
- Center the explosion in each 64×64 frame
- F0–F1 should be VERY bright (whites and yellows) — the moment of impact
- F3–F4 shift to darker colors and transparency — the fade-out
- Plays every time a fireball hits a player or wall

### AI Prompt
```
Pixel art sprite sheet of a fire explosion for a 2D fighting game.
5 animation frames in a single horizontal row, each frame 64x64 pixels.
Total image: 320x64 pixels.
Fireball impact explosion sequence, centered in each frame:
Frame 1: small bright white-yellow flash at center, 16px.
Frame 2: fire expanding outward to 32px, orange and yellow.
Frame 3: full size explosion at 48px, bright orange with red edges and sparks.
Frame 4: fire breaking apart into embers, fragments fading.
Frame 5: faint smoke wisps dissipating, nearly gone.
Transparent background, dark pixel outline.
Style: anime pixel art, retro 2D game effect, dramatic impact.
```

---

## EFFECT 3: FLAME SHIELD RING 🟡

### Specification

| Property         | Value                                          |
|------------------|------------------------------------------------|
| **Filename**     | `flame_shield.png`                             |
| **Frame size**   | 96 × 96 px                                    |
| **Frames**       | 4                                              |
| **Total size**   | 384 × 96 px                                   |
| **Animation**    | Looping, 120ms per frame                       |
| **Alignment**    | Centered on the player sprite                  |
| **Engine adds**  | Additional ember particles, slight screen tint |

### Layout
```
[    F0    ][    F1    ][    F2    ][    F3    ]
   96×96     96×96      96×96      96×96
```

### Frame Descriptions

| Frame | Description |
|-------|-------------|
| F0 | Ring of flames around the edge, steady. **Center area is empty/transparent** |
| F1 | Flames rotate/shift clockwise slightly, some flames become taller |
| F2 | Flames shift more, some contract while others expand — natural fire variation |
| F3 | Flames return toward F0 position for seamless loop |

### ⚠️ CRITICAL: Empty Center Zone
```
         96px
    ┌─────────────────┐
    │ 🔥🔥🔥🔥🔥🔥🔥 │
    │ 🔥             🔥│
    │ 🔥   EMPTY     🔥│  ← Center ~40×56px must be
    │ 🔥  TRANSPARENT 🔥│     FULLY TRANSPARENT
    │ 🔥   (player   🔥│     (player character renders
    │ 🔥  shows here) 🔥│      behind this sprite)
    │ 🔥             🔥│
    │ 🔥🔥🔥🔥🔥🔥🔥 │
    └─────────────────┘
```

The center ~40×56 pixel area MUST be empty. The player character renders BEHIND this sprite, showing through the transparent center. Only draw flames around the edges forming a protective ring/aura.

### Color Palette
| Element     | Colors |
|-------------|--------|
| Flame tips  | Yellow (#FACC22), bright orange (#FF8C00) |
| Flame body  | Orange (#FF6600), red-orange (#FF4400) |
| Flame base  | Dark red (#CC2200), deep red (#881100) |
| Inner glow  | Semi-transparent orange (#FF660033) at inner edge |

### AI Prompt
```
Pixel art sprite sheet of a protective fire shield aura for a 2D fighting game.
4 animation frames in a single horizontal row, each frame 96x96 pixels.
Total image: 384x96 pixels.
A ring of protective flames surrounding an empty center area.
The CENTER of each frame must be EMPTY and TRANSPARENT — about 40x56 pixels in the middle should have no pixels, only the surrounding ring of fire.
Flames form a circular ring around the empty center.
Frame 1: steady ring of fire.
Frame 2: flames shift clockwise, some taller.
Frame 3: more variation, natural fire movement.
Frame 4: returns toward frame 1 for seamless loop.
Orange and red flames with yellow tips. Transparent background and transparent center.
Style: anime pixel art, retro 2D game aura effect.
```

---

## EFFECT 4: FIRE PATCH — GROUND FIRE 🟡

### Specification

| Property         | Value                                          |
|------------------|------------------------------------------------|
| **Filename**     | `fire_patch.png`                               |
| **Frame size**   | 64 × 32 px                                    |
| **Frames**       | 3                                              |
| **Total size**   | 192 × 32 px                                   |
| **Animation**    | Looping, 150ms per frame                       |
| **Alignment**    | Bottom edge sits on platform surface           |
| **Engine adds**  | Rising smoke particles, flickering light effect|

### Layout
```
[    F0    ][    F1    ][    F2    ]
   64×32     64×32      64×32
```

### Frame Descriptions

| Frame | Description |
|-------|-------------|
| F0 | Several low flames flickering across the 64px width, rising 16–24px from bottom |
| F1 | Flames shift — some taller, some shorter — natural fire movement variation |
| F2 | Flames shift again — different pattern from F0 and F1, for variety |

### Structure (side view)
```
        64px wide
    ┌──────────────────┐
    │    🔥  🔥   🔥   │  ← Flame tips (yellow/orange)
    │  🔥🔥 🔥🔥 🔥🔥  │  ← Flame body (orange/red)
    │ 🔥🔥🔥🔥🔥🔥🔥🔥 │  ← Flame base (dark red)
    │████████████████████│  ← Bottom embers (darkest, 1-2px)
    └──────────────────────┘  y=32 (ground)
```

- Flames grow UPWARD from the bottom edge
- Bottom 1–2px row = embers/base glow (dark red/orange)
- Flames are short (16–24px tall) — this is ground fire, not a bonfire
- Left on the ground by the Ultimate ability, lasts 5 seconds

### AI Prompt
```
Pixel art sprite sheet of ground fire for a 2D fighting game.
3 animation frames in a single horizontal row, each frame 64 pixels wide and 32 pixels tall.
Total image: 192x32 pixels.
Low flames burning on a flat surface, rising upward from the bottom edge.
Multiple small flames spread across the full 64px width, 16-24 pixels tall.
Bottom edge has glowing embers in dark red and orange.
Frame 1: flames flickering at various heights.
Frame 2: flames shift — some taller, some shorter.
Frame 3: different variation of flame heights.
Transparent background, dark pixel outline, side view.
Style: anime pixel art, retro 2D game hazard, fire trap tile.
```

---

## EFFECT 5: ULTIMATE FLAME WAVE 🟡

### Specification

| Property         | Value                                          |
|------------------|------------------------------------------------|
| **Filename**     | `ultimate_wave.png`                            |
| **Frame size**   | 128 × 64 px                                   |
| **Frames**       | 4                                              |
| **Total size**   | 512 × 64 px                                   |
| **Animation**    | Looping, 100ms per frame                       |
| **Direction**    | Traveling right (engine flips for left)        |
| **Engine adds**  | Intense particle trail, screen shake, camera flash |

### Layout
```
[      F0      ][      F1      ][      F2      ][      F3      ]
    128×64         128×64          128×64          128×64
```

### Frame Descriptions

| Frame | Description |
|-------|-------------|
| F0 | Massive wall of flame — bright white-hot core, orange and red outer flames, ~128px wide × 50px tall |
| F1 | Flames churn and shift — intense heat distortion look, shape changes |
| F2 | Leading edge (right side) stretches forward aggressively, sharp flame tips |
| F3 | Flames pull back slightly — cycles back toward F0 for loop |

### Design Notes
- This is the **BIGGEST, MOST DRAMATIC** effect in the game — the "Inferno Cataclysm" ultimate
- Use the BRIGHTEST colors here — white-hot center (#FFFFFF, #FFFFAA) fading to deep crimson edges (#660000)
- 128px wide makes this clearly the most powerful attack
- The wave travels across the arena horizontally
- Leading edge (right side) should look aggressive/sharp
- Trailing edge (left side) can be more diffuse/smoky

### Color Palette
| Zone            | Colors |
|-----------------|--------|
| Core (center)   | White (#FFFFFF), pale yellow (#FFFFAA) |
| Inner           | Bright yellow (#FACC22), gold (#FFD700) |
| Middle          | Orange (#FF8C00), dark orange (#FF5500) |
| Outer           | Red (#CC2200), deep crimson (#881100) |
| Edge/tips       | Dark red (#660000), black-red (#330000) |

### AI Prompt
```
Pixel art sprite sheet of a massive fire wave ultimate attack for a 2D fighting game.
4 animation frames in a single horizontal row, each frame 128 pixels wide and 64 pixels tall.
Total image: 512x64 pixels.
A huge, powerful wall of fire traveling to the right. The most dramatic and powerful attack in the game.
White-hot bright core in the center, fading to orange, then red, then deep crimson at the edges.
Frame 1: tall wall of flame, intense and bright.
Frame 2: flames churn and shift, heat distortion.
Frame 3: leading right edge stretches forward aggressively.
Frame 4: flames settle slightly, cycles back to frame 1.
Transparent background, facing right, side view.
Style: anime pixel art, retro 2D game projectile, extremely dramatic and powerful, bright vivid colors.
```

---

## EFFECT 6: HIT IMPACT SPARK 🟢

### Specification

| Property         | Value                                          |
|------------------|------------------------------------------------|
| **Filename**     | `hit_spark.png`                                |
| **Frame size**   | 32 × 32 px                                    |
| **Frames**       | 3                                              |
| **Total size**   | 96 × 32 px                                    |
| **Animation**    | One-shot, 50ms per frame (very fast)           |
| **Engine adds**  | Additional tiny spark particles                |

### Layout
```
[  F0  ][  F1  ][  F2  ]
 32×32   32×32   32×32
```

### Frame Descriptions

| Frame | Description |
|-------|-------------|
| F0 | **Flash** — bright white-yellow starburst, small (~16px), centered |
| F1 | **Expand** — yellow sparks and lines radiating outward from center, expanding |
| F2 | **Fade** — sparks dissipating, nearly transparent, traces fading |

### Design Notes
- Plays on every melee hit — it's fast and punchy
- Classic fighting game impact flash
- If you skip this sprite, the engine uses particle-only sparks (still decent)

### AI Prompt
```
Pixel art sprite sheet of a hit impact spark for a 2D fighting game.
3 animation frames in a single horizontal row, each frame 32x32 pixels.
Total image: 96x32 pixels.
Classic fighting game hit flash effect, centered in each frame:
Frame 1: bright white-yellow starburst flash, small, at center.
Frame 2: yellow and orange sparks radiating outward, expanding.
Frame 3: sparks fading away, nearly transparent.
Transparent background.
Style: anime pixel art, retro 2D fighting game impact effect, punchy and fast.
```

---

## POST-GENERATION CHECKLIST

After generating each sprite with AI, verify:

- [ ] **Transparent background** — remove any solid background color
- [ ] **Correct total dimensions** — resize to exact pixel sizes listed above
- [ ] **Frames evenly spaced** — each frame occupies exactly equal width in the strip
- [ ] **Consistent style** — matches the Fire Battlemancer character art style
- [ ] **Facing right** — projectiles and wave move/face to the right
- [ ] **Flame shield center is empty** — character must show through the middle
- [ ] **No extra padding** — frames should be tightly aligned with no gaps between them

## TIPS FOR AI GENERATION

1. **If the AI generates individual images** instead of a sprite sheet — generate each frame separately, then stitch them side-by-side using [Photopea.com](https://photopea.com) (free, browser-based Photoshop) or even MS Paint

2. **To remove backgrounds** — use [remove.bg](https://remove.bg) or Photopea's "Magic Wand + Delete" tool, or the "Color to Alpha" feature

3. **To resize to exact dimensions** — open in Photopea, go to Image → Canvas Size, set exact pixel values with "Nearest Neighbor" resampling (preserves pixel art sharpness)

4. **To keep style consistent** — upload your Fire Battlemancer sprite as a style reference when generating (if your AI tool supports reference images)

5. **Frame alignment** — if frames are slightly different sizes, create a new canvas at the exact total size, then paste each frame at the correct X position (frame 0 at x=0, frame 1 at x=frameWidth, etc.)

---

## FILE DELIVERY SUMMARY

Place all files in the `Sprites/` folder:

```
Sprites/
├── Fire Battlemancer SPRITE.png    ← Character (done ✅)
├── fireball.png                    ← 128×32  (4 frames)   🔴
├── fireball_explosion.png          ← 320×64  (5 frames)   🔴
├── flame_shield.png                ← 384×96  (4 frames)   🟡
├── fire_patch.png                  ← 192×32  (3 frames)   🟡
├── ultimate_wave.png               ← 512×64  (4 frames)   🟡
└── hit_spark.png                   ← 96×32   (3 frames)   🟢
```
