import type { CharacterData } from '../../types';

export const HIRO_SUN_DANCER: CharacterData = {
  id: 'hiro_sun_dancer',
  name: 'Hiro — The Sun Dancer',
  texture: 'hiro',
  element: 'solar',

  health: 105,
  moveSpeed: 210,
  jumpForce: -400,
  gravity: 800,

  attacks: [
    {
      name: 'Dawn Strike',
      damage: 10,
      range: 32,
      knockback: 50,
      comboWindow: 400,
      startup: 1,
      active: 2,
      recovery: 2
    },
    {
      name: 'Rising Sun',
      damage: 16,
      range: 36,
      knockback: 150,
      comboWindow: 400,
      startup: 2,
      active: 2,
      recovery: 3
    },
    {
      name: 'Setting Blaze',
      damage: 24,
      range: 40,
      knockback: 400,
      comboWindow: 0,
      startup: 3,
      active: 3,
      recovery: 4
    }
  ],

  abilities: {
    primary: {
      name: 'Blazing Dawn Slash',
      type: 'projectile',
      damage: 18,
      speed: 800,
      cooldown: 8000,
      knockback: 300,
      size: { width: 32, height: 24 }
    },
    secondary: {
      name: "Sun's Ember",
      type: 'shield',
      duration: 4000,
      absorb: 25,
      cooldown: 14000
    },
    ultimate: {
      name: 'Hinokami — Burning Sun',
      type: 'wave',
      damage: 35,
      knockback: 400,
      startup: 600,
      chargeRate: {
        dealDamage: 1 / 5,
        takeDamage: 1 / 10,
        passive: 0.4
      }
    },
    dodge: {
      name: 'Ember Step',
      duration: 1000,
      cooldown: 15000
    }
  }
};
