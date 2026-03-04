import type { CharacterData } from '../../types';

export const RINA_SHADOW_ASSASSIN: CharacterData = {
  id: 'rina_shadow_assassin',
  name: 'Rina — The Phantom Blade',
  texture: 'rina',
  element: 'shadow',

  health: 85,
  moveSpeed: 240,
  jumpForce: -420,
  gravity: 800,

  attacks: [
    {
      name: 'Shadow Jab',
      damage: 7,
      range: 32,
      knockback: 40,
      comboWindow: 400,
      startup: 1,
      active: 2,
      recovery: 2
    },
    {
      name: 'Void Slash',
      damage: 11,
      range: 38,
      knockback: 60,
      comboWindow: 400,
      startup: 2,
      active: 2,
      recovery: 3
    },
    {
      name: 'Phantom Strike',
      damage: 16,
      range: 42,
      knockback: 350,
      comboWindow: 0,
      startup: 3,
      active: 3,
      recovery: 4
    }
  ],

  abilities: {
    primary: {
      name: 'Void Kunai',
      type: 'projectile',
      damage: 12,
      speed: 600,
      cooldown: 6000,
      knockback: 200,
      size: { width: 20, height: 20 }
    },
    secondary: {
      name: 'Shadow Afterimage',
      type: 'shield',
      duration: 2500,
      absorb: 15,
      cooldown: 12000
    },
    ultimate: {
      name: 'Phantom Slash',
      type: 'wave',
      damage: 35,
      knockback: 450,
      startup: 500,
      chargeRate: {
        dealDamage: 1 / 2,
        takeDamage: 1 / 3,
        passive: 3
      }
    },
    dodge: {
      name: 'Shadow Blink',
      duration: 800,
      cooldown: 12000
    }
  }
};
