import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from PIL import Image

sprite_dir = 'Sprites/02_Rina_Shadow_Assassin'

# Map: key = base name, value = spec
expected = {
    'A0':  {'w': 256, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 4,  'desc': 'Idle'},
    'A1':  {'w': 384, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 6,  'desc': 'Run'},
    'A2':  {'w': 192, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 3,  'desc': 'Jump'},
    'A3':  {'w': 192, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 3,  'desc': 'Attack 1'},
    'A4':  {'w': 192, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 3,  'desc': 'Attack 2'},
    'A5':  {'w': 256, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 4,  'desc': 'Attack 3'},
    'A6':  {'w': 256, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 4,  'desc': 'Cast'},
    'A7':  {'w': 128, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 2,  'desc': 'Hit'},
    'A8':  {'w': 128, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 2,  'desc': 'Dodge'},
    'A9':  {'w': 256, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 4,  'desc': 'Ultimate'},
    'A10': {'w': 192, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 3,  'desc': 'Death'},
    'B1':  {'w': 128, 'h': 32,  'fw': 32,  'fh': 32,  'frames': 4,  'desc': 'Void Kunai'},
    'B2':  {'w': 320, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 5,  'desc': 'Kunai Impact'},
    'B3':  {'w': 256, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 4,  'desc': 'Afterimage'},
    'B4':  {'w': 192, 'h': 32,  'fw': 64,  'fh': 32,  'frames': 3,  'desc': 'Slash Trail'},
    'B5':  {'w': 512, 'h': 64,  'fw': 128, 'fh': 64,  'frames': 4,  'desc': 'Phantom Slash'},
    'B6':  {'w': 96,  'h': 32,  'fw': 32,  'fh': 32,  'frames': 3,  'desc': 'Hit Spark'},
    'C1':  {'w': 128, 'h': 64,  'fw': 64,  'fh': 64,  'frames': 2,  'desc': 'Blink Flash'},
}

def find_file(base_name):
    """Find the actual file matching a base name (handles -removebg-preview suffix etc)."""
    candidates = [
        base_name + '.png',
        base_name + '-removebg-preview.png',
        base_name + '_removebg.png',
        base_name + '-cleaned.png',
    ]
    for c in candidates:
        path = os.path.join(sprite_dir, c)
        if os.path.exists(path):
            return path, c
    # Try a glob-like search
    for f in os.listdir(sprite_dir):
        if f.startswith(base_name) and f.lower().endswith('.png') and os.path.isfile(os.path.join(sprite_dir, f)):
            return os.path.join(sprite_dir, f), f
    return None, None

print('=' * 80)
print('  SPRITE VALIDATION: RINA - THE PHANTOM BLADE')
print('=' * 80)
print()

ok = 0
warn = 0
fail = 0

for base_name, spec in expected.items():
    path, actual_filename = find_file(base_name)

    if path is None:
        print('  [MISSING]  {} -- {}'.format(base_name, spec['desc']))
        fail += 1
        continue

    img = Image.open(path)
    w, h = img.size
    ew, eh = spec['w'], spec['h']
    fw, fh = spec['fw'], spec['fh']
    ef = spec['frames']
    issues = []

    # Mode check
    if img.mode != 'RGBA':
        issues.append('Mode: {} (need RGBA)'.format(img.mode))

    # Dimensions - check various scales
    size_status = 'BAD'
    actual_f = None
    for s in [1, 2, 3, 4, 8]:
        if (w, h) == (ew * s, eh * s):
            size_status = '{}x'.format(s)
            actual_f = w // (fw * s)
            break

    if size_status == 'BAD':
        # Check if aspect ratio is correct even at non-standard size
        expected_ratio = ew / eh
        actual_ratio = w / h if h > 0 else 0
        if abs(expected_ratio - actual_ratio) < 0.1:
            # Ratio matches, just non-standard scale
            approx_scale = round(w / ew, 1)
            size_status = '~{}x'.format(approx_scale)
            issues.append('Size: {}x{} (non-standard scale ~{}x, need {}x{} or {}x{})'.format(
                w, h, approx_scale, ew, eh, ew*2, eh*2))
        else:
            issues.append('Size: {}x{} (expected {}x{} or {}x{})'.format(w, h, ew, eh, ew*2, eh*2))

    # Frame count
    if actual_f is not None and actual_f != ef:
        issues.append('Frames: {} (expected {})'.format(actual_f, ef))

    # Transparency check
    if img.mode == 'RGBA':
        amin, amax = img.getextrema()[3]
        if amin > 0:
            issues.append('No transparent pixels (alpha min={})'.format(amin))
        if amax == 0:
            issues.append('Completely empty image!')
        # Check percentage of transparent pixels
        total_pixels = w * h
        alpha_data = list(img.getdata())
        transparent_count = sum(1 for p in alpha_data if p[3] == 0)
        transparent_pct = (transparent_count / total_pixels) * 100
    else:
        transparent_pct = 0

    # Determine status
    has_err = False
    for i in issues:
        if 'Size' in i or 'Mode' in i or 'empty' in i:
            has_err = True

    if not issues:
        status = '[  OK  ]'
        ok += 1
    elif has_err:
        status = '[ FAIL ]'
        fail += 1
    else:
        status = '[ WARN ]'
        warn += 1

    print('  {}  {:8s}  {:16s}  {:4d}x{:<4d}  {:4s}  scale={}  transp={:.0f}%'.format(
        status, actual_filename[:20], spec['desc'], w, h, img.mode, size_status, transparent_pct))
    for issue in issues:
        print('              -> {}'.format(issue))

print()
print('=' * 80)
print('  RESULTS:  {} OK  |  {} warnings  |  {} errors'.format(ok, warn, fail))
print('  FILES:    {}/{} found'.format(ok + warn + fail, len(expected)))
print('=' * 80)
