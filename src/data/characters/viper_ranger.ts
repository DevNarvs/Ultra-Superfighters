import type { CharacterData } from '../../types';

export const VIPER_RANGER: CharacterData = {
  id: 'viper_ranger',
  name: 'Viper Ranger',
  texture: 'viper_ranger',
  element: 'poison',

  health: 140,
  moveSpeed: 230,
  jumpForce: -410,
  gravity: 800,

  attacks: [
    {
      name: 'Venom Jab',
      damage: 7,
      range: 32,
      knockback: 40,
      comboWindow: 400,
      startup: 1,
      active: 2,
      recovery: 2
    },
    {
      name: 'Toxic Slash',
      damage: 11,
      range: 38,
      knockback: 65,
      comboWindow: 400,
      startup: 2,
      active: 2,
      recovery: 3
    },
    {
      name: 'Serpent Strike',
      damage: 17,
      range: 42,
      knockback: 370,
      comboWindow: 0,
      startup: 3,
      active: 3,
      recovery: 4
    }
  ],

  abilities: {
    primary: {
      name: 'Poison Dart',
      type: 'projectile',
      damage: 11,
      speed: 600,
      cooldown: 5500,
      knockback: 190,
      size: { width: 20, height: 20 }
    },
    secondary: {
      name: 'Toxic Veil',
      type: 'shield',
      duration: 2500,
      absorb: 16,
      cooldown: 11000
    },
    ultimate: {
      name: 'Venom Wave',
      type: 'wave',
      damage: 34,
      knockback: 430,
      startup: 500,
      chargeRate: {
        dealDamage: 1 / 2,
        takeDamage: 1 / 3,
        passive: 3
      }
    },
    dodge: {
      name: 'Serpent Slide',
      duration: 800,
      cooldown: 11000
    }
  }
};
