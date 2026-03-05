import type { CharacterData } from '../../types';

export const MORTIS_DEATH_REAPER: CharacterData = {
  id: 'mortis_death_reaper',
  name: 'Mortis — The Soul Reaper',
  texture: 'mortis',
  element: 'death',

  health: 90,
  moveSpeed: 180,
  jumpForce: -380,
  gravity: 800,

  attacks: [
    {
      name: 'Crypt Slash',
      damage: 7,
      range: 38,
      knockback: 50,
      comboWindow: 500,
      startup: 3,
      active: 3,
      recovery: 4
    },
    {
      name: 'Reaping Arc',
      damage: 14,
      range: 40,
      knockback: 200,
      comboWindow: 500,
      startup: 4,
      active: 3,
      recovery: 5
    },
    {
      name: 'Grave Cleave',
      damage: 22,
      range: 44,
      knockback: 450,
      comboWindow: 0,
      startup: 5,
      active: 4,
      recovery: 7
    }
  ],

  abilities: {
    primary: {
      name: 'Wraith Bolt',
      type: 'projectile',
      damage: 12,
      speed: 400,
      cooldown: 6000,
      knockback: 250,
      size: { width: 28, height: 28 }
    },
    secondary: {
      name: 'Soul Drain',
      type: 'shield',
      duration: 3000,
      absorb: 15,
      cooldown: 14000
    },
    ultimate: {
      name: "Death's Harvest",
      type: 'wave',
      damage: 40,
      knockback: 500,
      startup: 800,
      chargeRate: {
        dealDamage: 1 / 6,
        takeDamage: 1 / 12,
        passive: 0.5
      }
    },
    dodge: {
      name: 'Shadow Step',
      duration: 1000,
      cooldown: 15000
    }
  }
};
