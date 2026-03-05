"""
Palette Swap Tool - Creates color variants of Rina's spritesheet.
Generates 3 variants: Ice Blue, Fire Red, Forest Green
"""
from PIL import Image, ImageDraw
import numpy as np
import os


def hue_shift_sprite(img, hue_shift, sat_mult=1.0, val_mult=1.0):
    """Shift hue of an RGBA image while preserving transparency."""
    arr = np.array(img).astype(np.float32)
    alpha = arr[:, :, 3]
    r, g, b = arr[:, :, 0] / 255, arr[:, :, 1] / 255, arr[:, :, 2] / 255

    # RGB to HSV
    cmax = np.maximum(r, np.maximum(g, b))
    cmin = np.minimum(r, np.minimum(g, b))
    delta = cmax - cmin

    h = np.zeros_like(delta)
    mask = delta > 0
    mr = mask & (cmax == r)
    mg = mask & (cmax == g) & ~mr
    mb = mask & (cmax == b) & ~mr & ~mg
    h[mr] = ((g[mr] - b[mr]) / delta[mr]) % 6
    h[mg] = ((b[mg] - r[mg]) / delta[mg]) + 2
    h[mb] = ((r[mb] - g[mb]) / delta[mb]) + 4
    h = h / 6.0

    s = np.zeros_like(delta)
    s[cmax > 0] = delta[cmax > 0] / cmax[cmax > 0]
    v = cmax

    # Apply shifts
    h = (h + hue_shift) % 1.0
    s = np.clip(s * sat_mult, 0, 1)
    v = np.clip(v * val_mult, 0, 1)

    # HSV to RGB
    hi = (h * 6).astype(int) % 6
    f = (h * 6) - hi
    p = v * (1 - s)
    q = v * (1 - f * s)
    t = v * (1 - (1 - f) * s)

    out = np.zeros_like(arr)
    for i, (r_val, g_val, b_val) in enumerate([
        (v, t, p), (q, v, p), (p, v, t),
        (p, q, v), (t, p, v), (v, p, q)
    ]):
        mask_i = hi == i
        out[:, :, 0][mask_i] = r_val[mask_i] * 255
        out[:, :, 1][mask_i] = g_val[mask_i] * 255
        out[:, :, 2][mask_i] = b_val[mask_i] * 255

    out[:, :, 3] = alpha
    return Image.fromarray(out.astype(np.uint8))


def main():
    src = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'sprites', 'rina.png')
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'sprites')

    img = Image.open(src).convert('RGBA')

    variants = [
        ('ice_blue',     0.55, 1.0, 1.05),
        ('fire_red',     0.08, 1.2, 1.0),
        ('forest_green', 0.38, 0.9, 0.95),
    ]

    frame_w, frame_h = 128, 128
    first_frame = img.crop((0, 0, frame_w, frame_h))
    preview_frames = [first_frame]

    for name, hue, sat, val in variants:
        result = hue_shift_sprite(img, hue, sat, val)
        out_path = os.path.join(out_dir, f'rina_{name}.png')
        result.save(out_path)
        print(f"Saved: {out_path}")
        preview_frames.append(result.crop((0, 0, frame_w, frame_h)))

    # Create side-by-side preview
    labels = ['Original', 'Ice Blue', 'Fire Red', 'Forest Green']
    margin = 20
    preview_w = len(preview_frames) * frame_w + (len(preview_frames) - 1) * margin
    preview_h = frame_h + 30
    preview = Image.new('RGBA', (preview_w, preview_h), (40, 40, 40, 255))
    draw = ImageDraw.Draw(preview)

    for i, (frame, label) in enumerate(zip(preview_frames, labels)):
        x = i * (frame_w + margin)
        preview.paste(frame, (x, 0), frame)
        draw.text((x + frame_w // 2 - len(label) * 3, frame_h + 5), label, fill=(255, 255, 255, 255))

    preview_path = os.path.join(out_dir, 'palette_swap_preview.png')
    preview.save(preview_path)
    print(f"\nPreview saved: {preview_path}")


if __name__ == '__main__':
    main()
