# CHARACTER SPRITE SPECIFICATION
# Super Battlemancers

---

## GENERAL RULES (All Characters)

| Property            | Value                                              |
|---------------------|----------------------------------------------------|
| **View**            | Side view (profile), facing **RIGHT**              |
| **Frame size**      | **64 x 64 pixels**                                 |
| **Background**      | Transparent (PNG-24 with alpha)                    |
| **Character height**| ~48–56px tall within the 64px frame                |
| **Ground line**     | Feet at **y = 58** (6px from bottom edge)          |
| **Center X**        | Character centered at **x = 32**                   |
| **Outline**         | 1px dark outline around character                  |
| **Shading**         | 2–3 shade levels per color (base, shadow, highlight) |
| **Art style**       | Anime pixel art, semi-chibi (head ~1/3 body height) |
| **Facing**          | Always RIGHT — engine flips for left               |
| **Sheet layout**    | 6 columns × 11 rows = **384 × 704 px** total      |
| **Unused cells**    | Fully transparent                                  |

---

## SPRITESHEET GRID LAYOUT

```
Col:    0       1       2       3       4       5
      64px    64px    64px    64px    64px    64px
Row 0: [IDLE_0] [IDLE_1] [IDLE_2] [IDLE_3] [      ] [      ]   ← Idle (4 frames)
Row 1: [RUN_0 ] [RUN_1 ] [RUN_2 ] [RUN_3 ] [RUN_4 ] [RUN_5 ]   ← Run (6 frames)
Row 2: [JUMP_0] [JUMP_1] [JUMP_2] [      ] [      ] [      ]   ← Jump (3 frames)
Row 3: [ATK1_0] [ATK1_1] [ATK1_2] [      ] [      ] [      ]   ← Attack 1 - Jab (3 frames)
Row 4: [ATK2_0] [ATK2_1] [ATK2_2] [      ] [      ] [      ]   ← Attack 2 - Cross (3 frames)
Row 5: [ATK3_0] [ATK3_1] [ATK3_2] [ATK3_3] [      ] [      ]   ← Attack 3 - Kick (4 frames)
Row 6: [CAST_0] [CAST_1] [CAST_2] [CAST_3] [      ] [      ]   ← Cast Ability (4 frames)
Row 7: [HIT_0 ] [HIT_1 ] [      ] [      ] [      ] [      ]   ← Take Hit (2 frames)
Row 8: [DODGE0] [DODGE1] [      ] [      ] [      ] [      ]   ← Dodge/Phase (2 frames)
Row 9: [ULT_0 ] [ULT_1 ] [ULT_2 ] [ULT_3 ] [      ] [      ]   ← Ultimate (4 frames)
Row10: [DIE_0 ] [DIE_1 ] [DIE_2 ] [      ] [      ] [      ]   ← Death (3 frames)
```

---

## ANIMATION TABLE

| Row | Animation              | Frames | Speed   | Loop | Total used |
|-----|------------------------|--------|---------|------|------------|
| 0   | Idle                   | 4      | 150ms   | Yes  | 4          |
| 1   | Run                    | 6      | 100ms   | Yes  | 6          |
| 2   | Jump                   | 3      | 120ms   | No   | 3          |
| 3   | Attack 1 (Jab)         | 3      | 80ms    | No   | 3          |
| 4   | Attack 2 (Cross Punch) | 3      | 80ms    | No   | 3          |
| 5   | Attack 3 (Heavy Kick)  | 4      | 100ms   | No   | 4          |
| 6   | Cast Ability           | 4      | 120ms   | No   | 4          |
| 7   | Take Hit               | 2      | 150ms   | No   | 2          |
| 8   | Dodge (Phase Shift)    | 2      | holds   | No   | 2          |
| 9   | Ultimate               | 4      | 200ms   | No   | 4          |
| 10  | Death                  | 3      | 200ms   | No   | 3          |
|     |                        |        |         |      | **38 total** |

---

## FRAME-BY-FRAME DESCRIPTIONS

### Row 0 — Idle (4 frames, looping)
| Frame | Pose Description |
|-------|-----------------|
| F0 | Neutral standing pose, relaxed, weight centered |
| F1 | Slight inhale — body rises 1–2px, chest expands subtly |
| F2 | Peak of breath — one hand slightly raised with faint energy glow |
| F3 | Exhale — body lowers back to neutral, hand lowers |

### Row 1 — Run (6 frames, looping)
| Frame | Pose Description |
|-------|-----------------|
| F0 | Right foot contact — left arm swings forward, right arm back |
| F1 | Right foot down — body lowers slightly (down position) |
| F2 | Right foot passing — body centered, legs crossing under |
| F3 | Left foot contact — right arm swings forward, left arm back |
| F4 | Left foot down — body lowers slightly |
| F5 | Left foot passing — body centered, legs crossing |

### Row 2 — Jump (3 frames, one-shot)
| Frame | Pose Description |
|-------|-----------------|
| F0 | **Launch** — legs compressed/bent, pushing off ground, arms pull down |
| F1 | **Peak** — legs tucked slightly, arms out for balance, highest point |
| F2 | **Fall** — legs extend downward, arms reach up, looking down |

### Row 3 — Attack 1: Jab (3 frames, one-shot)
| Frame | Pose Description |
|-------|-----------------|
| F0 | **Windup** — lead fist pulls back, body coils |
| F1 | **Strike** — arm fully extended forward, fist visible at max reach |
| F2 | **Recovery** — arm retracting, returning to stance |

### Row 4 — Attack 2: Cross Punch (3 frames, one-shot)
| Frame | Pose Description |
|-------|-----------------|
| F0 | **Windup** — rear arm pulls back, body twists away |
| F1 | **Strike** — powerful forward punch, body rotated into the hit |
| F2 | **Recovery** — body untwisting, arm pulling back |

### Row 5 — Attack 3: Heavy Kick (4 frames, one-shot)
| Frame | Pose Description |
|-------|-----------------|
| F0 | **Windup** — kicking leg lifts, body leans back for counterbalance |
| F1 | **Extend** — leg extending forward, knee straightening |
| F2 | **Impact** — leg fully extended, maximum forward reach (~40px from center) |
| F3 | **Recovery** — leg returning, slight stumble/step back |

### Row 6 — Cast Ability (4 frames, one-shot)
| Frame | Pose Description |
|-------|-----------------|
| F0 | **Prepare** — both hands raised to chest level, energy gathering |
| F1 | **Charge** — hands pull back, energy ball forming between palms |
| F2 | **Release** — arms thrust forward, energy launches from hands |
| F3 | **Follow-through** — arms still extended, slight backward recoil |

### Row 7 — Take Hit (2 frames, one-shot)
| Frame | Pose Description |
|-------|-----------------|
| F0 | **Impact** — body jerked backward, pain expression, eyes squint |
| F1 | **Recoil** — leaning further back, one foot lifted off ground |

### Row 8 — Dodge / Phase Shift (2 frames, holds F1)
| Frame | Pose Description |
|-------|-----------------|
| F0 | **Enter** — arms crossed in front of body, bracing/focusing |
| F1 | **Active** — ghostly relaxed pose, arms slightly spread (engine makes this frame semi-transparent + blue tint at runtime) |

### Row 9 — Ultimate (4 frames, one-shot)
| Frame | Pose Description |
|-------|-----------------|
| F0 | **Charge** — crouching, fists clenched at sides, power building |
| F1 | **Rise** — standing up, arms rising, aura of energy around body |
| F2 | **Peak** — arms raised above head, maximum energy, dramatic pose |
| F3 | **Release** — arms thrust forward/outward, energy exploding away |

### Row 10 — Death (3 frames, one-shot)
| Frame | Pose Description |
|-------|-----------------|
| F0 | **Stagger** — stumbling, one hand clutches chest/wound |
| F1 | **Falling** — body tilting sideways, legs giving out, arms limp |
| F2 | **Down** — lying on ground (body rotated ~80°, fits within 64×64 frame) |

---

## IMPORTANT RULES FOR ALL CHARACTERS

1. **Always face RIGHT** — the game engine flips the sprite horizontally when facing left
2. **Keep character centered at x=32** — ensures flipping looks symmetrical
3. **Feet on ground line y=58** — must be consistent across ALL frames (prevents jittering)
4. **Attack frames can extend** — fists/kicks reaching beyond normal width is fine, stay within 64px frame
5. **No effects/particles in the spritesheet** — fire trails, explosions, auras are added at runtime by the engine
6. **Both players use the same spritesheet** — Player 2 is tinted to a different color by the engine
7. **Unused cells must be fully transparent** — no leftover pixels

---

## CHARACTER-SPECIFIC DESIGN: FIRE BATTLEMANCER

| Feature   | Description |
|-----------|-------------|
| Hair      | Spiky flame-shaped, orange-red, flowing upward |
| Eyes      | Anime style, determined/fierce expression |
| Build     | Slim/athletic, semi-chibi proportions |
| Outfit    | Dark red/crimson battle robe or tunic |
| Belt      | Black belt with gold/brass buckle |
| Hands     | Visible, one may glow with fire energy |
| Boots     | Dark brown or black combat boots |
| Palette   | Reds (#AA1111, #DC143C, #FF3333), oranges (#FF6600, #FF8C00, #FACC22), dark accents (#331111, #553300) |

---

## AI IMAGE GENERATION PROMPT (Character Sprite)

```
Pixel art sprite sheet for a 2D fighting game character, "Fire Battlemancer."
Anime-style chibi character with spiky flame-shaped orange-red hair, dark red/crimson battle robe, black belt with gold buckle, dark combat boots. Fierce determined expression.

Layout: 6 columns x 11 rows grid, each cell is 64x64 pixels. Total image: 384 x 704 pixels.
Side view, facing right, transparent background, 1px dark outline.

Row 0 (4 frames): Idle breathing loop — standing relaxed, subtle body rise/fall.
Row 1 (6 frames): Full run cycle — arms swinging, legs alternating, forward lean.
Row 2 (3 frames): Jump — crouch launch, peak with tucked legs, falling with legs down.
Row 3 (3 frames): Jab punch — windup, arm extended, recovery.
Row 4 (3 frames): Cross punch — twist windup, powerful punch, recovery.
Row 5 (4 frames): Heavy kick — leg lift, extend, full kick impact, recovery.
Row 6 (4 frames): Cast ability — hands raised, charge energy, thrust forward to release, follow-through.
Row 7 (2 frames): Take hit — body jerked back in pain, recoiling further.
Row 8 (2 frames): Dodge — arms crossed bracing, then ghostly transparent pose.
Row 9 (4 frames): Ultimate — crouch charge, rising with arms up, peak power pose, release blast.
Row 10 (3 frames): Death — stagger, falling sideways, lying on ground.

Unused cells in each row are empty/transparent.
Style: vibrant anime pixel art, retro 2D game sprite, detailed shading.
```

---

## FILE DELIVERY

| Property     | Value |
|-------------|-------|
| **Filename** | `fire_battlemancer.png` (or character name) |
| **Size**     | 384 × 704 pixels |
| **Format**   | PNG-24 with transparency |
| **Location** | `Sprites/` folder |
