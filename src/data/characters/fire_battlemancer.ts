import type { CharacterData } from '../../types';

export const FIRE_BATTLEMANCER: CharacterData = {
  id: 'fire_battlemancer',
  name: 'Fire Battlemancer',
  texture: 'fire_battlemancer',
  element: 'fire',

  health: 100,
  moveSpeed: 200,
  jumpForce: -400,
  gravity: 800,

  attacks: [
    {
      name: 'Flame Jab',
      damage: 8,
      range: 30,
      knockback: 150,
      comboWindow: 400,
      startup: 2,
      active: 2,
      recovery: 3
    },
    {
      name: 'Fire Cross',
      damage: 12,
      range: 35,
      knockback: 250,
      comboWindow: 400,
      startup: 3,
      active: 2,
      recovery: 4
    },
    {
      name: 'Inferno Slam',
      damage: 18,
      range: 40,
      knockback: 400,
      comboWindow: 0,
      startup: 4,
      active: 3,
      recovery: 5
    }
  ],

  abilities: {
    primary: {
      name: 'Fireball',
      type: 'projectile',
      damage: 15,
      speed: 500,
      cooldown: 8000,
      knockback: 300,
      size: { width: 24, height: 24 }
    },
    secondary: {
      name: 'Flame Shield',
      type: 'shield',
      duration: 3000,
      absorb: 20,
      cooldown: 14000
    },
    ultimate: {
      name: 'Flame Wave',
      type: 'wave',
      damage: 40,
      knockback: 500,
      startup: 600,
      chargeRate: {
        dealDamage: 1 / 5,
        takeDamage: 1 / 10,
        passive: 1
      }
    },
    dodge: {
      name: 'Phase Shift',
      duration: 1000,
      cooldown: 15000
    }
  }
};
