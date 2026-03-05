import Phaser from 'phaser';
import { generateProceduralTextures } from '../systems/CharacterVFX';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 15, 320, 30);

    const loadingText = this.add.text(width / 2, height / 2 - 40, 'Loading...', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xff6b35, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 10, 300 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    this.load.spritesheet('rina', 'assets/sprites/rina.png', {
      frameWidth: 128,
      frameHeight: 128
    });

    // Placeholder sprites — all use rina spritesheet until dedicated spritesheets exist
    this.load.spritesheet('fire_battlemancer', 'assets/sprites/rina.png', {
      frameWidth: 128,
      frameHeight: 128
    });

    this.load.spritesheet('mortis', 'assets/sprites/rina.png', {
      frameWidth: 128,
      frameHeight: 128
    });

    this.load.spritesheet('hiro', 'assets/sprites/rina.png', {
      frameWidth: 128,
      frameHeight: 128
    });

    this.load.spritesheet('karasu', 'assets/sprites/karasu.png', {
      frameWidth: 128,
      frameHeight: 128
    });

    // Skill effects (2x scale, will be displayed at 0.5x)
    this.load.spritesheet('fx_void_kunai', 'assets/sprites/effects/void_kunai.png', {
      frameWidth: 64, frameHeight: 64
    });
    this.load.spritesheet('fx_kunai_impact', 'assets/sprites/effects/void_kunai_impact.png', {
      frameWidth: 128, frameHeight: 128
    });
    this.load.spritesheet('fx_afterimage', 'assets/sprites/effects/shadow_afterimage.png', {
      frameWidth: 128, frameHeight: 128
    });
    this.load.spritesheet('fx_slash_trail', 'assets/sprites/effects/slash_trail.png', {
      frameWidth: 128, frameHeight: 64
    });
    this.load.spritesheet('fx_phantom_slash', 'assets/sprites/effects/phantom_slash.png', {
      frameWidth: 256, frameHeight: 128
    });
    this.load.spritesheet('fx_hit_spark', 'assets/sprites/effects/hit_spark.png', {
      frameWidth: 64, frameHeight: 64
    });
    this.load.spritesheet('fx_blink_flash', 'assets/sprites/effects/shadow_blink_flash.png', {
      frameWidth: 128, frameHeight: 128
    });

    // Karasu VFX spritesheets
    this.load.spritesheet('fx_karasu_black_flame', 'assets/sprites/effects/karasu_black_flame.png', {
      frameWidth: 64, frameHeight: 64
    });
    this.load.spritesheet('fx_karasu_flame_impact', 'assets/sprites/effects/karasu_flame_impact.png', {
      frameWidth: 128, frameHeight: 128
    });
    this.load.spritesheet('fx_karasu_crow_sub', 'assets/sprites/effects/karasu_crow_sub.png', {
      frameWidth: 128, frameHeight: 128
    });
    this.load.spritesheet('fx_karasu_phantom_slash', 'assets/sprites/effects/karasu_phantom_slash.png', {
      frameWidth: 128, frameHeight: 128
    });
    this.load.spritesheet('fx_karasu_susanoo', 'assets/sprites/effects/karasu_susanoo.png', {
      frameWidth: 128, frameHeight: 128
    });
    this.load.spritesheet('fx_karasu_hellfire', 'assets/sprites/effects/karasu_hellfire.png', {
      frameWidth: 128, frameHeight: 128
    });
  }

  create(): void {
    generateProceduralTextures(this);
    this.scene.start('MainMenuScene');
  }
}
