import type { CharacterData } from '../../types';

export const BLAZE_FIGHTER: CharacterData = {
  id: 'blaze_fighter',
  name: 'Blaze Fighter',
  texture: 'blaze_fighter',
  element: 'fire',

  health: 160,
  moveSpeed: 200,
  jumpForce: -380,
  gravity: 800,

  attacks: [
    {
      name: 'Ember Punch',
      damage: 9,
      range: 34,
      knockback: 50,
      comboWindow: 450,
      startup: 2,
      active: 3,
      recovery: 3
    },
    {
      name: 'Blaze Cross',
      damage: 14,
      range: 40,
      knockback: 80,
      comboWindow: 450,
      startup: 3,
      active: 3,
      recovery: 4
    },
    {
      name: 'Inferno Crush',
      damage: 22,
      range: 44,
      knockback: 400,
      comboWindow: 0,
      startup: 4,
      active: 3,
      recovery: 5
    }
  ],

  abilities: {
    primary: {
      name: 'Flame Bolt',
      type: 'projectile',
      damage: 16,
      speed: 450,
      cooldown: 7000,
      knockback: 250,
      size: { width: 24, height: 24 }
    },
    secondary: {
      name: 'Magma Shield',
      type: 'shield',
      duration: 3000,
      absorb: 20,
      cooldown: 14000
    },
    ultimate: {
      name: 'Eruption Wave',
      type: 'wave',
      damage: 42,
      knockback: 500,
      startup: 600,
      chargeRate: {
        dealDamage: 1 / 3,
        takeDamage: 1 / 4,
        passive: 2
      }
    },
    dodge: {
      name: 'Flame Dash',
      duration: 900,
      cooldown: 13000
    }
  }
};
