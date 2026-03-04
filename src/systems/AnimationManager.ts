import Phaser from 'phaser';

interface AnimConfig {
  key: string;
  row: number;
  frames: number;
  frameRate: number;
  repeat: number;
}

export function createFighterAnimations(scene: Phaser.Scene, textureKey: string): void {
  const anims = scene.anims;
  const prefix = textureKey;

  const animConfigs: AnimConfig[] = [
    { key: `${prefix}_idle`,    row: 0,  frames: 4, frameRate: 7,  repeat: -1 },
    { key: `${prefix}_run`,     row: 1,  frames: 6, frameRate: 10, repeat: -1 },
    { key: `${prefix}_jump`,    row: 2,  frames: 3, frameRate: 8,  repeat: 0  },
    { key: `${prefix}_attack1`, row: 3,  frames: 3, frameRate: 12, repeat: 0  },
    { key: `${prefix}_attack2`, row: 4,  frames: 3, frameRate: 12, repeat: 0  },
    { key: `${prefix}_attack3`, row: 5,  frames: 4, frameRate: 10, repeat: 0  },
    { key: `${prefix}_cast`,    row: 6,  frames: 4, frameRate: 8,  repeat: 0  },
    { key: `${prefix}_hit`,     row: 7,  frames: 2, frameRate: 7,  repeat: 0  },
    { key: `${prefix}_dodge`,   row: 8,  frames: 2, frameRate: 4,  repeat: 0  },
    { key: `${prefix}_ult`,     row: 9,  frames: 4, frameRate: 5,  repeat: 0  },
    { key: `${prefix}_death`,   row: 10, frames: 3, frameRate: 5,  repeat: 0  },
  ];

  for (const cfg of animConfigs) {
    if (anims.exists(cfg.key)) continue;

    const frames: number[] = [];
    for (let col = 0; col < cfg.frames; col++) {
      frames.push(cfg.row * 6 + col);
    }

    anims.create({
      key: cfg.key,
      frames: anims.generateFrameNumbers(textureKey, { frames }),
      frameRate: cfg.frameRate,
      repeat: cfg.repeat
    });
  }
}
