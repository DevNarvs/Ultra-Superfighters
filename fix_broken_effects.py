"""
Fix broken effects B3 and B6 — Replace broken frames with faded versions
=========================================================================
B3 frame 3: Checkerboard baked into dissolving afterimage
B6 frame 3: Checkerboard baked into fading spark

Fix: Replace broken frames by creating fade/dissolve from the good frames.
"""

import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np

INPUT_DIR = 'Sprites/02_Rina_Shadow_Assassin'


def split_frames_by_content(img, num_frames):
    """Split a horizontal strip into individual frames by detecting gaps."""
    px = np.array(img)
    w = px.shape[1]
    h = px.shape[0]

    alpha_per_col = np.sum(px[:, :, 3] > 20, axis=0)
    threshold = max(2, h // 30)
    in_content = alpha_per_col > threshold

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

    # Merge nearby
    if len(boundaries) > num_frames:
        min_gap = w // (num_frames * 4)
        merged = [boundaries[0]]
        for b in boundaries[1:]:
            if b[0] - merged[-1][1] < min_gap:
                merged[-1] = (merged[-1][0], b[1])
            else:
                merged.append(b)
        boundaries = merged

    if len(boundaries) > num_frames:
        by_size = sorted(boundaries, key=lambda b: b[1]-b[0], reverse=True)
        boundaries = sorted(by_size[:num_frames], key=lambda b: b[0])

    if len(boundaries) < num_frames:
        frame_w = w // num_frames
        boundaries = [(i * frame_w, (i+1) * frame_w - 1) for i in range(num_frames)]

    frames = []
    for xs, xe in boundaries:
        frame = img.crop((xs, 0, xe + 1, img.height))
        frames.append(frame)

    return frames, boundaries


def fade_frame(frame, opacity=0.4):
    """Create a faded version of a frame by reducing alpha."""
    px = np.array(frame).copy()
    px[:,:,3] = (px[:,:,3].astype(float) * opacity).astype(np.uint8)
    return Image.fromarray(px)


def dissolve_frame(frame, opacity=0.3, scatter=True):
    """Create a dissolving version — faded + some pixels randomly removed."""
    px = np.array(frame).copy().astype(np.float64)

    # Reduce opacity
    px[:,:,3] = px[:,:,3] * opacity

    if scatter:
        # Randomly remove ~60% of remaining visible pixels
        h, w = px.shape[:2]
        random_mask = np.random.random((h, w)) > 0.4
        visible = px[:,:,3] > 10
        px[:,:,3][visible & random_mask] = 0

        # Shift some pixels slightly for "breaking apart" effect
        shifted = np.zeros_like(px)
        shift_y = np.random.randint(-2, 3, size=(h, w))
        shift_x = np.random.randint(-2, 3, size=(h, w))
        for y in range(h):
            for x in range(w):
                if px[y, x, 3] > 10:
                    ny = min(max(0, y + shift_y[y,x]), h-1)
                    nx = min(max(0, x + shift_x[y,x]), w-1)
                    shifted[ny, nx] = px[y, x]
        px = shifted

    return Image.fromarray(px.astype(np.uint8))


def fix_b3(input_path):
    """
    Fix B3 Shadow Afterimage.
    Frame 1: Good (solid silhouette)
    Frame 2: Good (glitch effect)
    Frame 3: BROKEN (checkerboard) -> Replace with dissolve of frame 2
    Frame 4: Okay (scattered dots) -> Keep or replace with better scatter
    """
    print('  Fixing B3 Shadow Afterimage...')
    img = Image.open(input_path).convert('RGBA')

    frames, boundaries = split_frames_by_content(img, 4)
    print('    Found {} frames'.format(len(frames)))

    # Frame 0 and 1 are good — keep them
    good_f0 = frames[0]
    good_f1 = frames[1]

    # Frame 2 (index 2): Replace with dissolving version of frame 1
    new_f2 = dissolve_frame(good_f1, opacity=0.5, scatter=True)

    # Frame 3 (index 3): Replace with nearly-gone scattered pixels
    new_f3 = dissolve_frame(good_f1, opacity=0.2, scatter=True)

    # Reassemble strip with same layout
    result = Image.new('RGBA', img.size, (0, 0, 0, 0))

    for i, (xs, xe) in enumerate(boundaries):
        if i == 0:
            frame = good_f0
        elif i == 1:
            frame = good_f1
        elif i == 2:
            frame = new_f2
        else:
            frame = new_f3

        # Resize frame to fit the boundary width
        bw = xe - xs + 1
        bh = img.height
        if frame.width != bw or frame.height != bh:
            frame = frame.resize((bw, bh), Image.NEAREST)

        result.paste(frame, (xs, 0), frame)

    result.save(input_path, 'PNG')
    print('    Saved: {} ({}x{})'.format(input_path, result.width, result.height))

    return result


def fix_b6(input_path):
    """
    Fix B6 Hit Spark.
    Frame 1: Good (starburst)
    Frame 2: Good (expanding)
    Frame 3: BROKEN (checkerboard) -> Replace with faded version of frame 2
    """
    print('  Fixing B6 Hit Spark...')
    img = Image.open(input_path).convert('RGBA')

    frames, boundaries = split_frames_by_content(img, 3)
    print('    Found {} frames'.format(len(frames)))

    good_f0 = frames[0]
    good_f1 = frames[1]

    # Frame 2 (index 2): Replace with faded version
    new_f2 = fade_frame(good_f1, opacity=0.25)

    # Reassemble
    result = Image.new('RGBA', img.size, (0, 0, 0, 0))

    for i, (xs, xe) in enumerate(boundaries):
        if i == 0:
            frame = good_f0
        elif i == 1:
            frame = good_f1
        else:
            frame = new_f2

        bw = xe - xs + 1
        bh = img.height
        if frame.width != bw or frame.height != bh:
            frame = frame.resize((bw, bh), Image.NEAREST)

        result.paste(frame, (xs, 0), frame)

    result.save(input_path, 'PNG')
    print('    Saved: {} ({}x{})'.format(input_path, result.width, result.height))

    return result


if __name__ == '__main__':
    print('=' * 60)
    print('  FIXING BROKEN FRAMES: B3 + B6')
    print('=' * 60)
    print()

    b3_path = os.path.join(INPUT_DIR, 'B3-removebg-preview.png')
    b6_path = os.path.join(INPUT_DIR, 'B6-removebg-preview.png')

    fix_b3(b3_path)
    print()
    fix_b6(b6_path)

    print()
    print('  Done! Now rebuilding all sheets...')
    print('=' * 60)
