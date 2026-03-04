"""
Stitch Rina's FULL sprite sheet: character animations + skill effects
=====================================================================
Creates a single combined sprite sheet with:
  - Rows 0-10:  Character animations (6 cols x 11 rows, 128x128 per cell at 2x)
  - Rows 11-17: Skill effects (fitted into 128px-tall rows)

Output: 768 x 2304 at 2x scale (6 cols x 18 rows)
        384 x 1152 at 1x scale

Each effect is placed in its own row, centered within the 128px-tall space.
"""

import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from PIL import Image

BASE_DIR = 'Sprites/02_Rina_Shadow_Assassin'

# Character animation rows (0-10)
CHAR_ROWS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10']

# Effect rows (11-17) — each gets one row
EFFECT_ROWS = [
    {'name': 'B1', 'desc': 'Void Kunai (projectile)'},
    {'name': 'B2', 'desc': 'Kunai Impact (explosion)'},
    {'name': 'B3', 'desc': 'Shadow Afterimage'},
    {'name': 'B4', 'desc': 'Slash Trail'},
    {'name': 'B5', 'desc': 'Phantom Slash (ultimate)'},
    {'name': 'B6', 'desc': 'Hit Spark (shared)'},
    {'name': 'C1', 'desc': 'Shadow Blink Flash'},
]


def build_combined_sheet(input_dir, cell_size, cols, output_path, scale_label):
    """Build the combined character + effects sheet."""
    total_rows = len(CHAR_ROWS) + len(EFFECT_ROWS)  # 11 + 7 = 18
    sheet_w = cols * cell_size
    sheet_h = total_rows * cell_size

    sheet = Image.new('RGBA', (sheet_w, sheet_h), (0, 0, 0, 0))

    # === Part A: Character animation rows (0-10) ===
    print('    Character animations (rows 0-10):')
    for row_idx, name in enumerate(CHAR_ROWS):
        strip_path = os.path.join(input_dir, name + '.png')
        if not os.path.exists(strip_path):
            print('      MISSING: {}'.format(name))
            continue

        strip = Image.open(strip_path).convert('RGBA')
        y = row_idx * cell_size

        # Paste strip left-aligned
        pw = min(strip.width, sheet_w)
        ph = min(strip.height, cell_size)
        cropped = strip.crop((0, 0, pw, ph))
        sheet.paste(cropped, (0, y), cropped)
        print('      Row {:2d}: {} — {}x{}'.format(row_idx, name, strip.width, strip.height))

    # === Part B: Effect rows (11-17) ===
    print('    Skill effects (rows 11-17):')
    for eff_idx, eff in enumerate(EFFECT_ROWS):
        row_idx = len(CHAR_ROWS) + eff_idx
        name = eff['name']
        strip_path = os.path.join(input_dir, name + '.png')

        if not os.path.exists(strip_path):
            print('      MISSING: {}'.format(name))
            continue

        strip = Image.open(strip_path).convert('RGBA')
        sw, sh = strip.size
        y = row_idx * cell_size

        # Scale to fit within sheet_w x cell_size if needed
        if sw > sheet_w or sh > cell_size:
            scale_x = sheet_w / sw
            scale_y = cell_size / sh
            scale = min(scale_x, scale_y)
            new_w = max(1, int(sw * scale))
            new_h = max(1, int(sh * scale))
            strip = strip.resize((new_w, new_h), Image.NEAREST)
            sw, sh = strip.size

        # Center the effect within the row
        x_offset = 0  # left-aligned for consistency
        y_offset = y + (cell_size - sh) // 2  # vertically centered in the row

        sheet.paste(strip, (x_offset, y_offset), strip)
        print('      Row {:2d}: {} ({}) — {}x{}'.format(row_idx, name, eff['desc'], sw, sh))

    # Save
    sheet.save(output_path, 'PNG')
    print('    Saved: {} ({}x{})'.format(output_path, sheet_w, sheet_h))
    return sheet_w, sheet_h


if __name__ == '__main__':
    print('=' * 70)
    print('  BUILDING COMBINED SPRITE SHEET: RINA - THE PHANTOM BLADE')
    print('  Character (11 rows) + Effects (7 rows) = 18 rows total')
    print('=' * 70)
    print()

    # === 2x Scale (matches Fire Battlemancer) ===
    print('  [2x] Building 768x2304 combined sheet...')
    input_2x = os.path.join(BASE_DIR, 'fixed_2x')
    output_2x = os.path.join(BASE_DIR, 'fixed_2x', 'Rina Shadow Assassin FULL.png')
    w2, h2 = build_combined_sheet(input_2x, 128, 6, output_2x, '2x')
    print()

    # === 1x Scale ===
    print('  [1x] Building 384x1152 combined sheet...')
    input_1x = os.path.join(BASE_DIR, 'fixed')
    output_1x = os.path.join(BASE_DIR, 'fixed', 'Rina Shadow Assassin FULL.png')
    w1, h1 = build_combined_sheet(input_1x, 64, 6, output_1x, '1x')
    print()

    # === Copy 2x to main Sprites folder ===
    main_output = 'Sprites/Rina Shadow Assassin FULL.png'
    main_img = Image.open(output_2x)
    main_img.save(main_output, 'PNG')
    print('  Copied 2x to: {} ({}x{})'.format(main_output, main_img.width, main_img.height))
    print()

    # === Print grid reference ===
    print('=' * 70)
    print('  GRID REFERENCE (2x scale: 128x128 per cell, 6 cols x 18 rows)')
    print('=' * 70)
    print()
    print('  CHARACTER ANIMATIONS:')
    labels = ['Idle (4f)', 'Run (6f)', 'Jump (3f)', 'Attack 1 (3f)',
              'Attack 2 (3f)', 'Attack 3 (4f)', 'Cast (4f)', 'Hit (2f)',
              'Dodge (2f)', 'Ultimate (4f)', 'Death (3f)']
    for i, label in enumerate(labels):
        print('    Row {:2d}:  {}'.format(i, label))

    print()
    print('  SKILL EFFECTS:')
    eff_labels = [
        ('B1', 'Void Kunai projectile',    '4 frames, 64x64 at 2x'),
        ('B2', 'Kunai Impact explosion',    '5 frames, 128x128 at 2x'),
        ('B3', 'Shadow Afterimage',         '4 frames, 128x128 at 2x'),
        ('B4', 'Slash Trail',               '3 frames, 128x64 at 2x'),
        ('B5', 'Phantom Slash (ultimate)',   '4 frames, scaled to fit'),
        ('B6', 'Hit Spark (shared)',        '3 frames, 64x64 at 2x'),
        ('C1', 'Shadow Blink Flash',        '2 frames, 128x128 at 2x'),
    ]
    for i, (code, label, detail) in enumerate(eff_labels):
        print('    Row {:2d}:  {} — {} — {}'.format(11 + i, code, label, detail))

    print()
    print('=' * 70)
    print('  DONE!')
    print('=' * 70)
