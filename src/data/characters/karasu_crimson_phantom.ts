import type { CharacterData } from '../../types';

export const KARASU_CRIMSON_PHANTOM: CharacterData = {
  id: 'karasu_crimson_phantom',
  name: 'Karasu — The Crimson Phantom',
  texture: 'karasu',
  element: 'hellfire',

  health: 105,
  moveSpeed: 180,
  jumpForce: -380,
  gravity: 800,

  attacks: [
    {
      name: 'Shadow Cut',
      damage: 7,
      range: 38,
      knockback: 50,
      comboWindow: 500,
      startup: 3,
      active: 3,
      recovery: 4
    },
    {
      name: 'Phantom Sweep',
      damage: 14,
      range: 40,
      knockback: 200,
      comboWindow: 500,
      startup: 4,
      active: 3,
      recovery: 5
    },
    {
      name: 'Crimson Severance',
      damage: 22,
      range: 44,
      knockback: 450,
      comboWindow: 0,
      startup: 5,
      active: 4,
      recovery: 6
    }
  ],

  abilities: {
    primary: {
      name: 'Black Flame',
      type: 'projectile',
      damage: 8,
      speed: 280,
      cooldown: 10000,
      knockback: 150,
      size: { width: 24, height: 24 }
    },
    secondary: {
      name: 'Crimson Dash',
      type: 'dash',
      damage: 15,
      range: 160,
      knockback: 250,
      cooldown: 8000
    },
    ultimate: {
      name: 'Susanoo Awakening',
      type: 'wave',
      damage: 45,
      knockback: 500,
      startup: 800,
      chargeRate: {
        dealDamage: 1 / 7,
        takeDamage: 1 / 8,
        passive: 0.3
      }
    },
    dodge: {
      name: 'Crow Scatter',
      duration: 1000,
      cooldown: 15000
    }
  }
};
