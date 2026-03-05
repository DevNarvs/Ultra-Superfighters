import type { CharacterData } from '../../types';

export const FROST_NINJA: CharacterData = {
  id: 'frost_ninja',
  name: 'Frost Ninja',
  texture: 'frost_ninja',
  element: 'ice',

  health: 120,
  moveSpeed: 280,
  jumpForce: -450,
  gravity: 800,

  attacks: [
    {
      name: 'Ice Jab',
      damage: 6,
      range: 30,
      knockback: 35,
      comboWindow: 350,
      startup: 1,
      active: 2,
      recovery: 2
    },
    {
      name: 'Frost Slash',
      damage: 9,
      range: 36,
      knockback: 55,
      comboWindow: 350,
      startup: 2,
      active: 2,
      recovery: 2
    },
    {
      name: 'Glacial Strike',
      damage: 14,
      range: 40,
      knockback: 300,
      comboWindow: 0,
      startup: 2,
      active: 3,
      recovery: 4
    }
  ],

  abilities: {
    primary: {
      name: 'Ice Shard',
      type: 'projectile',
      damage: 10,
      speed: 700,
      cooldown: 5000,
      knockback: 180,
      size: { width: 20, height: 20 }
    },
    secondary: {
      name: 'Frost Barrier',
      type: 'shield',
      duration: 2000,
      absorb: 12,
      cooldown: 10000
    },
    ultimate: {
      name: 'Blizzard Slash',
      type: 'wave',
      damage: 30,
      knockback: 400,
      startup: 450,
      chargeRate: {
        dealDamage: 1 / 2,
        takeDamage: 1 / 3,
        passive: 3
      }
    },
    dodge: {
      name: 'Frost Step',
      duration: 700,
      cooldown: 10000
    }
  }
};
