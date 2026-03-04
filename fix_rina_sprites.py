"""
Fix Rina Sprites v2 — Resize Only (BG already removed by user)
===============================================================
Background already removed via remove.bg.
Just need to: split frames, resize to spec, assemble strips.
Outputs 1x and 2x scale versions.
"""

import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from PIL import Image
import numpy as np

INPUT_DIR = 'Sprites/02_Rina_Shadow_Assassin'
OUTPUT_DIR_1X = 'Sprites/02_Rina_Shadow_Assassin/fixed'
OUTPUT_DIR_2X = 'Sprites/02_Rina_Shadow_Assassin/fixed_2x'

SPECS = {
    'A0':  {'w': 256, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 4,  'desc': 'Idle',          'type': 'char'},
    'A1':  {'w': 384, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 6,  'desc': 'Run',           'type': 'char'},
    'A2':  {'w': 192, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 3,  'desc': 'Jump',          'type': 'char'},
    'A3':  {'w': 192, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 3,  'desc': 'Attack 1',      'type': 'char'},
    'A4':  {'w': 192, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 3,  'desc': 'Attack 2',      'type': 'char'},
    'A5':  {'w': 256, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 4,  'desc': 'Attack 3',      'type': 'char'},
    'A6':  {'w': 256, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 4,  'desc': 'Cast',          'type': 'char'},
    'A7':  {'w': 128, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 2,  'desc': 'Hit',           'type': 'char'},
    'A8':  {'w': 128, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 2,  'desc': 'Dodge',         'type': 'char'},
    'A9':  {'w': 256, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 4,  'desc': 'Ultimate',      'type': 'char'},
    'A10': {'w': 192, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 3,  'desc': 'Death',         'type': 'char'},
    'B1':  {'w': 128, 'h': 32,  'fw': 32,  'fh': 32,  'frames': 4,  'desc': 'Void Kunai',    'type': 'effect'},
    'B2':  {'w': 320, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 5,  'desc': 'Kunai Impact',  'type': 'effect'},
    'B3':  {'w': 256, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 4,  'desc': 'Afterimage',    'type': 'effect'},
    'B4':  {'w': 192, 'h': 32,  'fw': 64,  'fh': 32,  'frames': 3,  'desc': 'Slash Trail',   'type': 'effect'},
    'B5':  {'w': 512, 'h': 64,  'fw': 128, 'fh': 64,  'frames': 4,  'desc': 'Phantom Slash', 'type': 'effect'},
    'B6':  {'w': 96,  'h': 32,  'fw': 32,  'fh': 32,  'frames': 3,  'desc': 'Hit Spark',     'type': 'effect'},
    'C1':  {'w': 128, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 2,  'desc': 'Blink Flash',   'type': 'effect'},
}


def find_file(base_name):
    """Find the actual file in the input directory."""
    for f in os.listdir(INPUT_DIR):
        lower = f.lower()
        if lower.startswith(base_name.lower()) and lower.endswith('.png'):
            full = os.path.join(INPUT_DIR, f)
            if os.path.isfile(full):
                return full, f
    return None, None


def find_frame_boundaries(img, num_frames):
    """Find individual frames by detecting transparent column gaps."""
    px = np.array(img)
    w = px.shape[1]
    h = px.shape[0]

    # Alpha per column — count visible pixels
    alpha_per_col = np.sum(px[:, :, 3] > 20, axis=0)

    # Threshold: a column needs some visible pixels to be "content"
    threshold = max(2, h // 30)
    in_content = alpha_per_col > threshold

    # Find content clusters
    boundaries = []
    start = None
    for x in range(w):
        if in_content[x] and start is None:
            start = x
        elif not in_content[x] and start is not None:
            boundaries.append((start, x - 1))
            start = None
    if start is not None:
        boundaries.append((start, w - 1))

    # If exact match, great
    if len(boundaries) == num_frames:
        return boundaries

    # If more than expected, merge nearby ones
    if len(boundaries) > num_frames:
        min_gap = w // (num_frames * 4)
        merged = [boundaries[0]]
        for b in boundaries[1:]:
            if b[0] - merged[-1][1] < min_gap:
                merged[-1] = (merged[-1][0], b[1])
            else:
                merged.append(b)
        if len(merged) == num_frames:
            return merged
        # Still too many? Take the N largest
        if len(merged) > num_frames:
            by_size = sorted(merged, key=lambda b: b[1]-b[0], reverse=True)
            merged = sorted(by_size[:num_frames], key=lambda b: b[0])
            return merged

    # If fewer, divide the content area evenly
    if len(boundaries) > 0:
        total_start = boundaries[0][0]
        total_end = boundaries[-1][1]
        total_w = total_end - total_start + 1
        frame_w = total_w // num_frames
        return [(total_start + i * frame_w, total_start + (i + 1) * frame_w - 1) for i in range(num_frames)]

    # Last fallback: divide whole image
    frame_w = w // num_frames
    return [(i * frame_w, (i + 1) * frame_w - 1) for i in range(num_frames)]


def extract_and_resize_frame(img, x_start, x_end, target_w, target_h, sprite_type='char'):
    """Extract a frame, crop to content, resize to target, center it."""
    # Crop frame region
    frame = img.crop((x_start, 0, x_end + 1, img.height))

    # Find bounding box of visible content
    bbox = frame.getbbox()
    if bbox is None:
        return Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))

    content = frame.crop(bbox)
    cw, ch = content.size

    # Scale to fit target (90% to leave padding)
    scale_x = (target_w * 0.92) / cw
    scale_y = (target_h * 0.92) / ch
    scale = min(scale_x, scale_y)

    new_w = max(1, int(cw * scale))
    new_h = max(1, int(ch * scale))

    # Clamp to target
    new_w = min(new_w, target_w)
    new_h = min(new_h, target_h)

    # Resize with nearest neighbor for pixel art
    resized = content.resize((new_w, new_h), Image.NEAREST)

    # Place on target canvas
    result = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
    x_offset = (target_w - new_w) // 2

    if sprite_type == 'char':
        # Character: feet anchored near bottom
        bottom_pad = max(2, int(target_h * 0.09))
        y_offset = target_h - new_h - bottom_pad
        y_offset = max(0, y_offset)
    else:
        # Effect: center vertically
        y_offset = (target_h - new_h) // 2

    result.paste(resized, (x_offset, y_offset), resized)
    return result


def process_sprite(base_name, spec, output_dir, scale=1):
    """Process one sprite at the given scale."""
    path, actual_name = find_file(base_name)
    if path is None:
        return 'MISSING: {}'.format(base_name)

    img = Image.open(path).convert('RGBA')

    # Target sizes
    tfw = spec['fw'] * scale
    tfh = spec['fh'] * scale
    tw = spec['w'] * scale
    th = spec['h'] * scale

    # Find frames
    boundaries = find_frame_boundaries(img, spec['frames'])

    # Extract and resize each frame
    frames = []
    for i, (xs, xe) in enumerate(boundaries):
        frame = extract_and_resize_frame(img, xs, xe, tfw, tfh, spec.get('type', 'effect'))
        frames.append(frame)

    # Assemble strip
    result = Image.new('RGBA', (tw, th), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        result.paste(frame, (i * tfw, 0), frame)

    # Save
    out_path = os.path.join(output_dir, base_name + '.png')
    result.save(out_path, 'PNG')

    # Verify
    v = Image.open(out_path)
    size_ok = (v.size == (tw, th))
    has_transp = (v.mode == 'RGBA' and v.getextrema()[3][0] == 0)

    status = 'OK' if (size_ok and has_transp) else 'CHECK'
    return '[{:5s}]  {:8s}  {:16s}  {}x{}  frames={}'.format(
        status, base_name, spec['desc'], tw, th, spec['frames'])


if __name__ == '__main__':
    os.makedirs(OUTPUT_DIR_1X, exist_ok=True)
    os.makedirs(OUTPUT_DIR_2X, exist_ok=True)

    for label, output_dir, scale in [
        ('1x (64x64 logical)', OUTPUT_DIR_1X, 1),
        ('2x (128x128 — matches Fire Battlemancer)', OUTPUT_DIR_2X, 2),
    ]:
        print('=' * 70)
        print('  PASS: {} scale'.format(label))
        print('=' * 70)
        print('  Output: {}/'.format(output_dir))
        print()

        ok_count = 0
        for base_name, spec in SPECS.items():
            try:
                result = process_sprite(base_name, spec, output_dir, scale)
                if '[OK' in result:
                    ok_count += 1
                print('  {}'.format(result))
            except Exception as e:
                print('  [ERROR]  {:8s}  {}'.format(base_name, str(e)))

        print()
        print('  -> {}/{} OK'.format(ok_count, len(SPECS)))
        print()

    print('=' * 70)
    print('  DONE! Check fixed/ and fixed_2x/ folders.')
    print('=' * 70)
