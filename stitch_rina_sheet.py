"""
Stitch Rina's 11 animation strips into a single sprite sheet.
Produces both 1x (384x704) and 2x (768x1408) versions.
Also copies skill effects to the main Sprites/ folder with proper names.
"""

import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from PIL import Image

BASE_DIR = 'Sprites/02_Rina_Shadow_Assassin'

# Row order matches the sprite sheet spec (rows 0-10)
ROWS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10']

# Skill effect files to copy with proper names
EFFECTS = {
    'B1': 'void_kunai.png',
    'B2': 'void_kunai_impact.png',
    'B3': 'shadow_afterimage.png',
    'B4': 'slash_trail.png',
    'B5': 'phantom_slash.png',
    'B6': 'hit_spark.png',
    'C1': 'shadow_blink_flash.png',
}


def stitch_sheet(input_dir, frame_w, frame_h, cols, output_path):
    """Stitch row strips into a full sprite sheet grid."""
    rows = len(ROWS)
    sheet_w = cols * frame_w
    sheet_h = rows * frame_h

    sheet = Image.new('RGBA', (sheet_w, sheet_h), (0, 0, 0, 0))

    for row_idx, name in enumerate(ROWS):
        strip_path = os.path.join(input_dir, name + '.png')
        if not os.path.exists(strip_path):
            print('    WARNING: Missing {}'.format(strip_path))
            continue

        strip = Image.open(strip_path).convert('RGBA')
        y = row_idx * frame_h

        # Paste the strip — it may be shorter than full row width
        # (rows with fewer than 6 frames will leave right cells transparent)
        paste_w = min(strip.width, sheet_w)
        paste_h = min(strip.height, frame_h)
        cropped = strip.crop((0, 0, paste_w, paste_h))
        sheet.paste(cropped, (0, y), cropped)

    sheet.save(output_path, 'PNG')
    return sheet.size


def copy_effects(input_dir, output_dir):
    """Copy skill effect files with proper game-ready names."""
    copied = 0
    for base_name, target_name in EFFECTS.items():
        src = os.path.join(input_dir, base_name + '.png')
        dst = os.path.join(output_dir, target_name)
        if os.path.exists(src):
            img = Image.open(src)
            img.save(dst, 'PNG')
            print('    {} -> {}  ({}x{})'.format(base_name + '.png', target_name, img.width, img.height))
            copied += 1
        else:
            print('    MISSING: {}'.format(src))
    return copied


if __name__ == '__main__':
    print('=' * 70)
    print('  STITCHING RINA SPRITE SHEET')
    print('=' * 70)
    print()

    # === 1x Sheet (384 x 704) ===
    print('  [1x] Stitching 384x704 sprite sheet...')
    input_1x = os.path.join(BASE_DIR, 'fixed')
    output_1x = os.path.join(BASE_DIR, 'fixed', 'Rina Shadow Assassin SPRITE.png')
    size = stitch_sheet(input_1x, 64, 64, 6, output_1x)
    print('    -> {} ({}x{})'.format(output_1x, size[0], size[1]))
    print()

    # === 2x Sheet (768 x 1408) — matches Fire Battlemancer ===
    print('  [2x] Stitching 768x1408 sprite sheet...')
    input_2x = os.path.join(BASE_DIR, 'fixed_2x')
    output_2x = os.path.join(BASE_DIR, 'fixed_2x', 'Rina Shadow Assassin SPRITE.png')
    size = stitch_sheet(input_2x, 128, 128, 6, output_2x)
    print('    -> {} ({}x{})'.format(output_2x, size[0], size[1]))
    print()

    # === Also copy to main Sprites/ folder (2x as the primary) ===
    main_output = 'Sprites/Rina Shadow Assassin SPRITE.png'
    print('  [MAIN] Copying 2x sheet to main Sprites/ folder...')
    main_img = Image.open(output_2x)
    main_img.save(main_output, 'PNG')
    print('    -> {} ({}x{})'.format(main_output, main_img.width, main_img.height))
    print()

    # === Copy skill effects to main Sprites/ folder ===
    print('  [EFFECTS] Copying 2x skill effects to Sprites/ ...')
    copied = copy_effects(input_2x, 'Sprites')
    print('    -> {}/{} effects copied'.format(copied, len(EFFECTS)))
    print()

    # === Final verification ===
    print('=' * 70)
    print('  VERIFICATION')
    print('=' * 70)
    print()

    check_files = {
        'Sprites/Rina Shadow Assassin SPRITE.png': (768, 1408),
        'Sprites/void_kunai.png': (256, 64),
        'Sprites/void_kunai_impact.png': (640, 128),
        'Sprites/shadow_afterimage.png': (512, 128),
        'Sprites/slash_trail.png': (384, 64),
        'Sprites/phantom_slash.png': (1024, 128),
        'Sprites/hit_spark.png': (192, 64),
        'Sprites/shadow_blink_flash.png': (256, 128),
    }

    all_ok = True
    for filepath, (ew, eh) in check_files.items():
        if os.path.exists(filepath):
            img = Image.open(filepath)
            w, h = img.size
            ok = (w == ew and h == eh and img.mode == 'RGBA')
            status = 'OK' if ok else 'SIZE MISMATCH'
            if not ok:
                all_ok = False
            print('  [{}]  {:45s}  {}x{}'.format(status, filepath, w, h))
        else:
            print('  [MISSING]  {}'.format(filepath))
            all_ok = False

    print()
    if all_ok:
        print('  ALL FILES READY! Rina is game-ready.')
    else:
        print('  Some files need attention (see above).')
    print('=' * 70)
