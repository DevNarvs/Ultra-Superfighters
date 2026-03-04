import type { ArenaData } from '../../types';

export const TRAINING_GROUNDS: ArenaData = {
  id: 'training_grounds',
  name: 'Training Grounds',
  backgroundColor: '#1a1a2e',
  bounds: { x: 0, y: 0, width: 1000, height: 700 },
  killZone: { y: 750 },

  ground: [
    { x: 500, y: 680, width: 1000, height: 40, color: 0x444444 }
  ],

  platforms: [
    { x: 200, y: 520, width: 180, height: 12, color: 0x555566 },
    { x: 800, y: 520, width: 180, height: 12, color: 0x555566 },
    { x: 500, y: 400, width: 220, height: 12, color: 0x555566 },
    { x: 150, y: 300, width: 140, height: 12, color: 0x555566 },
    { x: 850, y: 300, width: 140, height: 12, color: 0x555566 },
    { x: 500, y: 200, width: 160, height: 12, color: 0x555566 }
  ],

  spawnPoints: [
    { x: 200, y: 600 },
    { x: 800, y: 600 },
    { x: 500, y: 320 },
    { x: 150, y: 220 },
    { x: 850, y: 220 },
    { x: 500, y: 120 }
  ],

  hazards: [
    {
      type: 'falling_object',
      spawnInterval: 5000,
      damage: 10,
      knockback: 150,
      spawnArea: { xMin: 100, xMax: 900, y: -20 },
      fallSpeed: 300,
      size: { width: 24, height: 24 }
    }
  ]
};
