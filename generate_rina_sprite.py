"""
Generate Rina (Shadow Assassin) sprite sheet.
768 x 1408 pixels (6 cols x 11 rows of 128x128 frames)
Pixel art drawn at 2x scale (designing at 64x64, rendering at 128x128)
"""

from PIL import Image, ImageDraw
import math

# Constants
SCALE = 2
FRAME_W = 64 * SCALE  # 128
FRAME_H = 64 * SCALE  # 128
COLS = 6
ROWS = 11
SHEET_W = COLS * FRAME_W  # 768
SHEET_H = ROWS * FRAME_H  # 1408

# Rina's color palette
C = {
    'coat':         (139, 26, 110),     # #8B1A6E
    'coat_shadow':  (92, 17, 88),       # #5C1158
    'coat_light':   (170, 50, 140),     # AA328C
    'pink':         (255, 105, 180),    # #FF69B4
    'pink_light':   (255, 182, 217),    # #FFB6D9
    'shadow_black': (42, 16, 40),       # #2A1028
    'skin':         (255, 224, 204),    # #FFE0CC
    'skin_shadow':  (230, 190, 170),    # E6BEAA
    'hair':         (244, 166, 200),    # #F4A6C8
    'hair_dark':    (196, 75, 153),     # #C44B99
    'hair_light':   (255, 200, 220),    # FFC8DC
    'boots':        (26, 16, 24),       # #1A1018
    'boots_high':   (50, 35, 48),       # 322330
    'glasses':      (58, 40, 56),       # #3A2838
    'glint':        (255, 255, 255),    # #FFFFFF
    'scarf':        (255, 204, 224),    # #FFCCE0
    'outline':      (42, 16, 40),       # #2A1028
    'belt':         (26, 16, 24),       # same as boots
    'gem':          (255, 105, 180),    # pink gem
    'shirt':        (255, 204, 224),    # light pink
    'eye':          (255, 105, 180),    # pink
    'eye_dark':     (139, 26, 110),     # darker
    'mouth':        (196, 75, 153),
    'stripe':       (255, 105, 180),    # boot stripe
}

S = SCALE  # shorthand


def px(draw, x, y, color, size=1):
    """Draw a scaled pixel."""
    draw.rectangle([x*S, y*S, (x+size)*S-1, (y+size)*S-1], fill=color)


def rect(draw, x, y, w, h, color):
    """Draw a scaled rectangle."""
    draw.rectangle([x*S, y*S, (x+w)*S-1, (y+h)*S-1], fill=color)


def outline_rect(draw, x, y, w, h, fill_color, outline_color):
    """Rectangle with outline."""
    rect(draw, x, y, w, h, outline_color)
    if w > 2 and h > 2:
        rect(draw, x+1, y+1, w-2, h-2, fill_color)


# ============================================================
# CHARACTER BODY PARTS
# ============================================================

def draw_head(draw, hx, hy, facing=1, expression='calm'):
    """Draw head with hair, glasses, face. hx,hy = top-left of head area."""
    # Hair back (ponytail extends behind)
    # In side view, ponytail goes to the left (behind)
    for i in range(8):
        c = C['hair'] if i < 5 else C['hair_dark']
        px(draw, hx - 3 - i//2, hy + 4 + i, c)
        if i > 0:
            px(draw, hx - 4 - i//2, hy + 4 + i, c)

    # Hair top (bangs flowing forward)
    for i in range(10):
        px(draw, hx + i, hy - 1, C['hair'])
        px(draw, hx + i, hy, C['hair'])
    # Bangs over forehead
    for i in range(4):
        px(draw, hx + 8 + i, hy + 1, C['hair'])
        px(draw, hx + 9 + i, hy + 2, C['hair_dark'])

    # Hair sides
    for i in range(8):
        px(draw, hx - 1, hy + i, C['hair'])
        px(draw, hx, hy + i, C['hair'])

    # Head shape (side profile)
    rect(draw, hx + 1, hy + 1, 10, 10, C['skin'])
    # Forehead
    rect(draw, hx + 1, hy + 1, 10, 3, C['skin'])
    # Chin (narrower)
    rect(draw, hx + 3, hy + 9, 7, 2, C['skin'])
    rect(draw, hx + 5, hy + 10, 4, 1, C['skin_shadow'])

    # Face shadow
    rect(draw, hx + 1, hy + 6, 3, 4, C['skin_shadow'])

    # Glasses
    rect(draw, hx + 4, hy + 4, 7, 3, C['glasses'])
    rect(draw, hx + 5, hy + 5, 5, 1, C['pink_light'])  # lens
    px(draw, hx + 8, hy + 4, C['glint'])  # glint

    # Eye behind glasses
    px(draw, hx + 6, hy + 5, C['eye'])
    px(draw, hx + 7, hy + 5, C['eye_dark'])
    px(draw, hx + 8, hy + 5, C['glint'])  # highlight

    # Nose
    px(draw, hx + 10, hy + 6, C['skin_shadow'])

    # Mouth
    if expression == 'calm':
        px(draw, hx + 8, hy + 8, C['mouth'])
        px(draw, hx + 9, hy + 8, C['mouth'])
    elif expression == 'pain':
        px(draw, hx + 8, hy + 8, C['mouth'])
        px(draw, hx + 9, hy + 8, C['skin_shadow'])
        px(draw, hx + 8, hy + 9, C['mouth'])
    elif expression == 'fierce':
        px(draw, hx + 8, hy + 7, C['mouth'])
        px(draw, hx + 9, hy + 7, C['mouth'])
        px(draw, hx + 10, hy + 7, C['mouth'])

    # Ear area
    px(draw, hx, hy + 4, C['skin_shadow'])
    px(draw, hx, hy + 5, C['skin_shadow'])

    # Head outline
    for i in range(12):
        px(draw, hx + i, hy, C['outline'])  # top
    for i in range(11):
        px(draw, hx + 11, hy + i, C['outline'])  # front
    # Chin outline
    for i in range(6):
        px(draw, hx + 5 + i, hy + 11, C['outline'])

    # Hair highlight
    px(draw, hx + 3, hy, C['hair_light'])
    px(draw, hx + 4, hy, C['hair_light'])


def draw_ponytail(draw, px_x, py, sway=0, length=12):
    """Draw the ponytail hanging behind."""
    for i in range(length):
        c = C['hair'] if i < length * 0.6 else C['hair_dark']
        x_off = sway + (i // 4)
        px(draw, px_x - x_off, py + i, c)
        px(draw, px_x - x_off - 1, py + i, c)
        if i < length - 2:
            px(draw, px_x - x_off + 1, py + i, c)


def draw_body(draw, bx, by, lean=0):
    """Draw torso with coat."""
    # Coat body
    outline_rect(draw, bx + lean, by, 10, 12, C['coat'], C['outline'])
    # Coat shadow side
    rect(draw, bx + lean, by + 1, 3, 10, C['coat_shadow'])
    # Coat light
    rect(draw, bx + lean + 6, by + 1, 3, 5, C['coat_light'])
    # Collar
    rect(draw, bx + lean + 1, by - 1, 8, 2, C['coat'])
    px(draw, bx + lean + 2, by - 1, C['coat_shadow'])
    # Shirt visible at neck
    rect(draw, bx + lean + 3, by, 4, 2, C['shirt'])
    # Belt
    rect(draw, bx + lean, by + 10, 10, 2, C['belt'])
    px(draw, bx + lean + 5, by + 10, C['gem'])  # gem buckle
    px(draw, bx + lean + 5, by + 11, C['gem'])
    # Belt pouch (back)
    rect(draw, bx + lean - 1, by + 9, 2, 3, C['belt'])


def draw_arm(draw, ax, ay, pose='down', hand_glow=False):
    """Draw arm + fingerless glove. pose: down, forward, back, guard, cross, throw"""
    if pose == 'down':
        # Arm hanging down
        rect(draw, ax, ay, 3, 8, C['coat'])
        rect(draw, ax, ay, 1, 8, C['coat_shadow'])
        # Glove + hand
        rect(draw, ax, ay + 8, 3, 3, C['boots'])  # glove
        px(draw, ax + 1, ay + 10, C['skin'])  # fingers
        px(draw, ax + 2, ay + 10, C['skin'])
    elif pose == 'forward':
        # Arm reaching forward
        rect(draw, ax, ay, 10, 3, C['coat'])
        rect(draw, ax, ay, 10, 1, C['coat_shadow'])
        rect(draw, ax + 8, ay, 3, 3, C['boots'])  # glove
        px(draw, ax + 10, ay + 1, C['skin'])
        px(draw, ax + 11, ay + 1, C['skin'])
    elif pose == 'back':
        # Arm pulled back
        rect(draw, ax, ay, 3, 6, C['coat'])
        rect(draw, ax - 3, ay + 4, 4, 3, C['coat'])
        rect(draw, ax - 3, ay + 6, 3, 2, C['boots'])  # glove
        px(draw, ax - 3, ay + 7, C['skin'])
    elif pose == 'guard':
        # Arm in front, guarding
        rect(draw, ax, ay, 6, 3, C['coat'])
        rect(draw, ax + 4, ay - 1, 3, 4, C['boots'])
        px(draw, ax + 5, ay + 2, C['skin'])
    elif pose == 'cross':
        # Arms crossed in X
        rect(draw, ax, ay, 8, 3, C['coat'])
        rect(draw, ax + 2, ay - 2, 3, 7, C['coat'])
        rect(draw, ax + 6, ay, 3, 2, C['boots'])
    elif pose == 'throw':
        # Throwing motion - arm extended forward and up
        rect(draw, ax, ay - 2, 12, 3, C['coat'])
        rect(draw, ax, ay - 2, 4, 1, C['coat_shadow'])
        rect(draw, ax + 10, ay - 2, 3, 3, C['boots'])
        px(draw, ax + 12, ay - 1, C['skin'])
    elif pose == 'up':
        # Arms raised up
        rect(draw, ax, ay - 6, 3, 8, C['coat'])
        rect(draw, ax, ay - 6, 1, 8, C['coat_shadow'])
        rect(draw, ax, ay - 7, 3, 2, C['boots'])
        px(draw, ax + 1, ay - 8, C['skin'])

    if hand_glow:
        # Add pink glow to hand area
        if pose == 'down':
            px(draw, ax + 1, ay + 11, C['pink'])
            px(draw, ax, ay + 11, C['pink_light'])
        elif pose == 'forward':
            px(draw, ax + 11, ay, C['pink'])
            px(draw, ax + 12, ay + 1, C['pink_light'])


def draw_legs(draw, lx, ly, pose='stand', step=0):
    """Draw legs with boots."""
    if pose == 'stand':
        # Standing legs
        # Back leg
        rect(draw, lx + 1, ly, 3, 5, C['coat_shadow'])  # upper leg (under coat)
        rect(draw, lx + 1, ly + 5, 3, 8, C['boots'])  # boot
        px(draw, lx + 3, ly + 6, C['stripe'])  # pink stripe
        px(draw, lx + 3, ly + 8, C['stripe'])
        px(draw, lx + 3, ly + 10, C['stripe'])
        # Front leg
        rect(draw, lx + 5, ly, 3, 5, C['coat_shadow'])
        rect(draw, lx + 5, ly + 5, 3, 8, C['boots'])
        px(draw, lx + 7, ly + 6, C['stripe'])
        px(draw, lx + 7, ly + 8, C['stripe'])
        px(draw, lx + 7, ly + 10, C['stripe'])
        # Boot tops (highlight)
        px(draw, lx + 2, ly + 5, C['boots_high'])
        px(draw, lx + 6, ly + 5, C['boots_high'])
    elif pose == 'run':
        s = step % 6
        # Simplified run cycle
        offsets = [
            (3, -2, -1, 4),   # 0: front forward, back behind
            (2, 0, 0, 3),     # 1: lowering
            (0, 1, 1, 1),     # 2: crossing
            (-1, 4, 3, -2),   # 3: mirror
            (0, 3, 2, 0),     # 4: mirror low
            (1, 1, 0, 1),     # 5: crossing
        ]
        f_dx, f_dy, b_dx, b_dy = offsets[s]
        # Back leg
        _draw_single_leg(draw, lx + 2 - b_dx, ly + b_dy, C['coat_shadow'])
        # Front leg
        _draw_single_leg(draw, lx + 5 + f_dx, ly + f_dy, C['boots'])
    elif pose == 'jump':
        if step == 0:  # crouch
            rect(draw, lx + 1, ly + 2, 4, 4, C['coat_shadow'])
            rect(draw, lx + 1, ly + 6, 4, 6, C['boots'])
            rect(draw, lx + 5, ly + 2, 4, 4, C['coat_shadow'])
            rect(draw, lx + 5, ly + 6, 4, 6, C['boots'])
        elif step == 1:  # tucked
            rect(draw, lx + 2, ly + 1, 3, 4, C['coat_shadow'])
            rect(draw, lx + 2, ly + 5, 3, 4, C['boots'])
            rect(draw, lx + 5, ly + 1, 3, 4, C['coat_shadow'])
            rect(draw, lx + 5, ly + 5, 3, 4, C['boots'])
        else:  # falling
            rect(draw, lx + 2, ly, 3, 6, C['coat_shadow'])
            rect(draw, lx + 2, ly + 6, 3, 6, C['boots'])
            rect(draw, lx + 5, ly, 3, 6, C['coat_shadow'])
            rect(draw, lx + 5, ly + 6, 3, 6, C['boots'])


def _draw_single_leg(draw, x, y, color):
    """Helper to draw one leg."""
    rect(draw, x, y, 3, 5, C['coat_shadow'])
    rect(draw, x, y + 5, 3, 7, C['boots'])
    px(draw, x + 2, y + 6, C['stripe'])
    px(draw, x + 2, y + 8, C['stripe'])
    px(draw, x + 2, y + 10, C['stripe'])
    px(draw, x + 1, y + 5, C['boots_high'])


# ============================================================
# FULL FRAME DRAWING FUNCTIONS
# ============================================================

def draw_idle(draw, ox, oy, frame):
    """Idle animation: 4 frames, breathing."""
    breathe = [0, -1, -1, 0][frame]
    glow = frame == 2

    hx, hy = ox + 22, oy + 6 + breathe
    draw_ponytail(draw, hx - 2, hy + 8, sway=0, length=14)
    draw_head(draw, hx, hy, expression='calm')
    draw_body(draw, ox + 24, oy + 17 + breathe)
    draw_arm(draw, ox + 22, oy + 19 + breathe, pose='down', hand_glow=False)
    draw_arm(draw, ox + 32, oy + 19 + breathe, pose='down', hand_glow=glow)
    draw_legs(draw, ox + 23, oy + 31 + breathe, pose='stand')
    # Scarf
    rect(draw, ox + 26, oy + 15 + breathe, 2, 3, C['scarf'])
    px(draw, ox + 25, oy + 17 + breathe, C['scarf'])


def draw_run(draw, ox, oy, frame):
    """Run animation: 6 frames."""
    lean = 2
    bob = [0, 1, 0, 0, 1, 0][frame]
    ponytail_sway = [2, 3, 2, 2, 3, 2][frame]

    hx, hy = ox + 24 + lean, oy + 6 + bob
    draw_ponytail(draw, hx - 2, hy + 8, sway=ponytail_sway, length=16)
    draw_head(draw, hx, hy, expression='calm')
    draw_body(draw, ox + 26 + lean, oy + 17 + bob, lean=1)

    # Alternating arms
    if frame < 3:
        draw_arm(draw, ox + 34 + lean, oy + 18 + bob, pose='forward')
        draw_arm(draw, ox + 22 + lean, oy + 19 + bob, pose='back')
    else:
        draw_arm(draw, ox + 22 + lean, oy + 18 + bob, pose='forward')
        draw_arm(draw, ox + 34 + lean, oy + 19 + bob, pose='back')

    draw_legs(draw, ox + 25 + lean, oy + 31 + bob, pose='run', step=frame)
    # Scarf flying back
    rect(draw, ox + 22, oy + 15 + bob, 3, 2, C['scarf'])
    px(draw, ox + 20, oy + 16 + bob, C['scarf'])


def draw_jump(draw, ox, oy, frame):
    """Jump animation: 3 frames."""
    y_offsets = [4, -4, 0]
    yo = y_offsets[frame]

    hx, hy = ox + 22, oy + 6 + yo
    pt_sway = [0, -2, 2][frame]
    pt_len = [12, 10, 14][frame]
    draw_ponytail(draw, hx - 2, hy + 8, sway=pt_sway, length=pt_len)
    draw_head(draw, hx, hy, expression='calm')
    draw_body(draw, ox + 24, oy + 17 + yo)

    if frame == 0:
        draw_arm(draw, ox + 22, oy + 22 + yo, pose='down')
        draw_arm(draw, ox + 32, oy + 22 + yo, pose='down')
    elif frame == 1:
        draw_arm(draw, ox + 20, oy + 18 + yo, pose='guard')
        draw_arm(draw, ox + 32, oy + 18 + yo, pose='guard')
    else:
        draw_arm(draw, ox + 22, oy + 14 + yo, pose='up')
        draw_arm(draw, ox + 30, oy + 14 + yo, pose='up')

    draw_legs(draw, ox + 23, oy + 31 + yo, pose='jump', step=frame)
    rect(draw, ox + 26, oy + 15 + yo, 2, 3, C['scarf'])


def draw_attack1(draw, ox, oy, frame):
    """Attack 1: quick slash - 3 frames."""
    leans = [0, 3, 1]
    lean = leans[frame]
    expr = ['calm', 'fierce', 'calm'][frame]

    hx, hy = ox + 22 + lean, oy + 7
    draw_ponytail(draw, hx - 2, hy + 8, sway=1-lean, length=12)
    draw_head(draw, hx, hy, expression=expr)
    draw_body(draw, ox + 24 + lean, oy + 18, lean=lean//2)

    if frame == 0:
        draw_arm(draw, ox + 22, oy + 20, pose='back')
        draw_arm(draw, ox + 32, oy + 18, pose='guard')
    elif frame == 1:
        draw_arm(draw, ox + 30 + lean, oy + 18, pose='forward', hand_glow=True)
        draw_arm(draw, ox + 22, oy + 22, pose='down')
    else:
        draw_arm(draw, ox + 30, oy + 19, pose='down')
        draw_arm(draw, ox + 24, oy + 20, pose='down')

    draw_legs(draw, ox + 23 + lean, oy + 32, pose='stand')


def draw_attack2(draw, ox, oy, frame):
    """Attack 2: backhand slash - 3 frames."""
    leans = [-1, 3, 0]
    lean = leans[frame]
    expr = ['calm', 'fierce', 'calm'][frame]

    hx, hy = ox + 22 + lean, oy + 7
    draw_ponytail(draw, hx - 2, hy + 8, sway=-lean, length=12)
    draw_head(draw, hx, hy, expression=expr)
    draw_body(draw, ox + 24 + lean, oy + 18)

    if frame == 0:
        draw_arm(draw, ox + 28, oy + 17, pose='cross')
    elif frame == 1:
        draw_arm(draw, ox + 28 + lean, oy + 19, pose='forward', hand_glow=True)
    else:
        draw_arm(draw, ox + 28, oy + 20, pose='down')

    draw_legs(draw, ox + 23 + lean, oy + 32, pose='stand')


def draw_attack3(draw, ox, oy, frame):
    """Attack 3: spin slash - 4 frames."""
    leans = [0, 1, 4, 2]
    lean = leans[frame]
    expr = ['calm', 'fierce', 'fierce', 'calm'][frame]

    hx, hy = ox + 22 + lean, oy + 7
    draw_ponytail(draw, hx - 2, hy + 8, sway=3 - lean, length=14)
    draw_head(draw, hx, hy, expression=expr)
    draw_body(draw, ox + 24 + lean, oy + 18, lean=lean//2)

    if frame == 0:
        draw_arm(draw, ox + 24, oy + 14, pose='up')
        draw_arm(draw, ox + 30, oy + 14, pose='up')
    elif frame == 1:
        draw_arm(draw, ox + 30, oy + 17, pose='forward')
        draw_arm(draw, ox + 22, oy + 22, pose='back')
    elif frame == 2:
        draw_arm(draw, ox + 30 + lean, oy + 24, pose='forward', hand_glow=True)
        draw_arm(draw, ox + 22, oy + 24, pose='forward', hand_glow=True)
    else:
        draw_arm(draw, ox + 28, oy + 20, pose='down')
        draw_arm(draw, ox + 24, oy + 21, pose='down')

    draw_legs(draw, ox + 23 + lean, oy + 32, pose='stand')


def draw_cast(draw, ox, oy, frame):
    """Cast: kunai throw - 4 frames."""
    leans = [0, -1, 4, 2]
    lean = leans[frame]
    expr = ['calm', 'calm', 'fierce', 'calm'][frame]

    hx, hy = ox + 22 + lean, oy + 7
    draw_ponytail(draw, hx - 2, hy + 8, sway=-lean, length=12)
    draw_head(draw, hx, hy, expression=expr)
    draw_body(draw, ox + 24 + lean, oy + 18, lean=lean//3)

    if frame == 0:
        # Reaching to belt pouch
        draw_arm(draw, ox + 22, oy + 24, pose='back')
        draw_arm(draw, ox + 30, oy + 19, pose='guard')
    elif frame == 1:
        # Drawing back past ear
        draw_arm(draw, ox + 20, oy + 12, pose='back')
        draw_arm(draw, ox + 30, oy + 20, pose='guard')
    elif frame == 2:
        # Throwing forward
        draw_arm(draw, ox + 28, oy + 18, pose='throw', hand_glow=True)
    else:
        # Follow through
        draw_arm(draw, ox + 32, oy + 20, pose='forward')
        draw_arm(draw, ox + 24, oy + 21, pose='down')

    draw_legs(draw, ox + 23 + lean, oy + 32, pose='stand')


def draw_hit(draw, ox, oy, frame):
    """Take hit - 2 frames."""
    leans = [-3, -6]
    lean = leans[frame]

    hx, hy = ox + 22 + lean, oy + 7
    draw_ponytail(draw, hx + 10, hy + 4, sway=-4, length=10)
    draw_head(draw, hx, hy, expression='pain')
    draw_body(draw, ox + 24 + lean, oy + 18)

    draw_arm(draw, ox + 20 + lean, oy + 17, pose='guard')
    draw_arm(draw, ox + 32 + lean, oy + 18, pose='back')

    if frame == 0:
        draw_legs(draw, ox + 23 + lean, oy + 32, pose='stand')
    else:
        # Front foot lifted
        draw_legs(draw, ox + 23 + lean, oy + 32, pose='jump', step=2)


def draw_dodge(draw, ox, oy, frame):
    """Dodge / Phase Shift - 2 frames."""
    hx, hy = ox + 22, oy + 7

    if frame == 0:
        # Arms crossed, bracing
        draw_ponytail(draw, hx - 2, hy + 8, sway=0, length=12)
        draw_head(draw, hx, hy, expression='calm')
        draw_body(draw, ox + 24, oy + 18)
        draw_arm(draw, ox + 26, oy + 17, pose='cross')
        draw_legs(draw, ox + 23, oy + 32, pose='stand')
        rect(draw, ox + 26, oy + 15, 2, 3, C['scarf'])
    else:
        # Ghostly pose - draw slightly transparent looking
        # (Engine handles real transparency, but we show relaxed pose)
        draw_ponytail(draw, hx - 2, hy + 4, sway=-2, length=14)
        draw_head(draw, hx, hy, expression='calm')
        draw_body(draw, ox + 24, oy + 18)
        draw_arm(draw, ox + 18, oy + 19, pose='down')
        draw_arm(draw, ox + 34, oy + 19, pose='down')
        draw_legs(draw, ox + 23, oy + 32, pose='stand')
        # Floating scarf
        rect(draw, ox + 24, oy + 13, 2, 4, C['scarf'])
        px(draw, ox + 23, oy + 14, C['scarf'])


def draw_ultimate(draw, ox, oy, frame):
    """Ultimate: Phantom Barrage - 4 frames."""
    if frame == 0:
        # Low crouch, power charging
        hx, hy = ox + 22, oy + 14
        draw_ponytail(draw, hx - 2, hy + 8, sway=0, length=10)
        draw_head(draw, hx, hy, expression='fierce')
        draw_body(draw, ox + 24, oy + 25)
        draw_arm(draw, ox + 22, oy + 27, pose='down')
        draw_arm(draw, ox + 32, oy + 27, pose='down')
        draw_legs(draw, ox + 23, oy + 37, pose='jump', step=0)
    elif frame == 1:
        # Rising, arms sweeping
        hx, hy = ox + 22, oy + 8
        draw_ponytail(draw, hx - 2, hy + 8, sway=-1, length=14)
        draw_head(draw, hx, hy, expression='fierce')
        draw_body(draw, ox + 24, oy + 19)
        draw_arm(draw, ox + 20, oy + 16, pose='guard')
        draw_arm(draw, ox + 32, oy + 16, pose='guard')
        draw_legs(draw, ox + 23, oy + 33, pose='stand')
    elif frame == 2:
        # Dynamic dash pose - most aggressive
        hx, hy = ox + 26, oy + 8
        draw_ponytail(draw, hx - 6, hy + 8, sway=4, length=16)
        draw_head(draw, hx, hy, expression='fierce')
        draw_body(draw, ox + 28, oy + 19, lean=3)
        draw_arm(draw, ox + 22, oy + 20, pose='back')
        draw_arm(draw, ox + 36, oy + 18, pose='forward', hand_glow=True)
        draw_legs(draw, ox + 27, oy + 33, pose='run', step=0)
    else:
        # Superhero landing
        hx, hy = ox + 22, oy + 12
        draw_ponytail(draw, hx - 2, hy + 8, sway=1, length=12)
        draw_head(draw, hx, hy, expression='calm')
        draw_body(draw, ox + 24, oy + 23)
        draw_arm(draw, ox + 22, oy + 25, pose='down')
        draw_arm(draw, ox + 30, oy + 30, pose='forward')
        draw_legs(draw, ox + 23, oy + 37, pose='jump', step=0)


def draw_death(draw, ox, oy, frame):
    """Death - 3 frames."""
    if frame == 0:
        # Stagger
        hx, hy = ox + 22, oy + 8
        draw_ponytail(draw, hx - 2, hy + 8, sway=2, length=12)
        draw_head(draw, hx, hy, expression='pain')
        draw_body(draw, ox + 24, oy + 19)
        draw_arm(draw, ox + 28, oy + 20, pose='guard')  # hand on chest
        draw_arm(draw, ox + 22, oy + 22, pose='down')
        draw_legs(draw, ox + 23, oy + 33, pose='stand')
    elif frame == 1:
        # Falling sideways
        hx, hy = ox + 20, oy + 12
        draw_ponytail(draw, hx + 8, hy + 2, sway=-3, length=10)
        draw_head(draw, hx, hy, expression='pain')
        draw_body(draw, ox + 22, oy + 23)
        draw_arm(draw, ox + 20, oy + 22, pose='down')
        draw_arm(draw, ox + 30, oy + 22, pose='down')
        draw_legs(draw, ox + 21, oy + 37, pose='jump', step=2)
    else:
        # Lying on ground (rotated)
        # Simplified: draw as horizontal figure near bottom
        y_base = oy + 46
        # Body horizontal
        rect(draw, ox + 10, y_base, 32, 6, C['coat'])
        rect(draw, ox + 10, y_base, 32, 2, C['coat_shadow'])
        # Head on right
        rect(draw, ox + 38, y_base - 2, 8, 8, C['skin'])
        rect(draw, ox + 38, y_base - 3, 6, 3, C['hair'])
        px(draw, ox + 42, y_base, C['glasses'])
        px(draw, ox + 43, y_base, C['glasses'])
        # Legs on left
        rect(draw, ox + 4, y_base + 1, 7, 4, C['boots'])
        px(draw, ox + 5, y_base + 2, C['stripe'])
        # Hair spread
        rect(draw, ox + 44, y_base - 4, 8, 3, C['hair'])
        rect(draw, ox + 48, y_base - 3, 5, 2, C['hair_dark'])
        # Belt
        rect(draw, ox + 24, y_base + 1, 2, 5, C['belt'])
        px(draw, ox + 24, y_base + 3, C['gem'])


# ============================================================
# MAIN: COMPOSE THE FULL SHEET
# ============================================================

def main():
    img = Image.new('RGBA', (SHEET_W, SHEET_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Row 0: Idle (4 frames)
    for f in range(4):
        draw_idle(draw, f * FRAME_W, 0 * FRAME_H, f)

    # Row 1: Run (6 frames)
    for f in range(6):
        draw_run(draw, f * FRAME_W, 1 * FRAME_H, f)

    # Row 2: Jump (3 frames)
    for f in range(3):
        draw_jump(draw, f * FRAME_W, 2 * FRAME_H, f)

    # Row 3: Attack 1 (3 frames)
    for f in range(3):
        draw_attack1(draw, f * FRAME_W, 3 * FRAME_H, f)

    # Row 4: Attack 2 (3 frames)
    for f in range(3):
        draw_attack2(draw, f * FRAME_W, 4 * FRAME_H, f)

    # Row 5: Attack 3 (4 frames)
    for f in range(4):
        draw_attack3(draw, f * FRAME_W, 5 * FRAME_H, f)

    # Row 6: Cast (4 frames)
    for f in range(4):
        draw_cast(draw, f * FRAME_W, 6 * FRAME_H, f)

    # Row 7: Hit (2 frames)
    for f in range(2):
        draw_hit(draw, f * FRAME_W, 7 * FRAME_H, f)

    # Row 8: Dodge (2 frames)
    for f in range(2):
        draw_dodge(draw, f * FRAME_W, 8 * FRAME_H, f)

    # Row 9: Ultimate (4 frames)
    for f in range(4):
        draw_ultimate(draw, f * FRAME_W, 9 * FRAME_H, f)

    # Row 10: Death (3 frames)
    for f in range(3):
        draw_death(draw, f * FRAME_W, 10 * FRAME_H, f)

    # Save
    out_path = r"C:\Users\Admin\Documents\1 Narvs Documents\Freelancing\GDev\UltraSuperFighters\Sprites\Rina Shadow Assassin SPRITE.png"
    img.save(out_path)
    print(f"Saved: {out_path}")
    print(f"Size: {img.size}")


if __name__ == '__main__':
    main()
