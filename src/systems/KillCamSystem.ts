import Phaser from 'phaser';
import type { Fighter } from '../entities/Fighter';

export class KillCamSystem {
  private scene: Phaser.Scene;
  private isActive = false;
  private slowMoScale = 0.3;
  private duration = 1500; // real-time ms

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  trigger(koFighter: Fighter): void {
    if (this.isActive) return;
    this.isActive = true;

    // Slow motion — both scene time and physics
    this.scene.time.timeScale = this.slowMoScale;
    this.scene.physics.world.timeScale = this.slowMoScale;

    // Camera flash
    this.scene.cameras.main.flash(200, 255, 255, 255, true);

    // Big camera shake
    this.scene.cameras.main.shake(300, 0.015);

    // Zoom toward KO location
    const cam = this.scene.cameras.main;
    const targetZoom = Math.min(cam.zoom * 1.5, 1.5);
    this.scene.tweens.add({
      targets: cam,
      zoom: targetZoom,
      duration: 400,
      ease: 'Quad.easeOut'
    });

    // Restore after duration
    // scene.time.delayedCall uses game time, which is scaled
    // To get 1.5s real time: gameTime = realTime * timeScale
    this.scene.time.delayedCall(this.duration * this.slowMoScale, () => {
      this.restore();
    });
  }

  private restore(): void {
    this.scene.time.timeScale = 1;
    this.scene.physics.world.timeScale = 1;
    this.isActive = false;
    // Camera zoom will be restored by CameraSystem's lerp on next frames
  }

  get active(): boolean {
    return this.isActive;
  }
}
