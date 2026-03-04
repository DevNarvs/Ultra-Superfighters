import Phaser from 'phaser';
import type { Fighter } from '../entities/Fighter';

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class CameraSystem {
  private scene: Phaser.Scene;
  private fighters: Fighter[];
  private camera: Phaser.Cameras.Scene2D.Camera;
  private minZoom: number;
  private maxZoom: number;
  private padding: number;
  private lerpSpeed: number;

  constructor(scene: Phaser.Scene, fighters: Fighter[], bounds: Bounds) {
    this.scene = scene;
    this.fighters = fighters;
    this.camera = scene.cameras.main;
    this.camera.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

    this.minZoom = 0.6;
    this.maxZoom = 1.2;
    this.padding = 120;
    this.lerpSpeed = 0.08;
  }

  update(): void {
    const alive = this.fighters.filter(f => !f.isDead);
    if (alive.length === 0) return;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (const f of alive) {
      minX = Math.min(minX, f.x);
      maxX = Math.max(maxX, f.x);
      minY = Math.min(minY, f.y);
      maxY = Math.max(maxY, f.y);
    }

    const targetX = (minX + maxX) / 2;
    const targetY = (minY + maxY) / 2;

    const viewWidth = (maxX - minX) + this.padding * 2;
    const viewHeight = (maxY - minY) + this.padding * 2;

    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;
    const zoomX = gameWidth / viewWidth;
    const zoomY = gameHeight / viewHeight;
    const targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, Math.min(zoomX, zoomY)));

    const cx = this.camera.scrollX + this.camera.width / 2;
    const cy = this.camera.scrollY + this.camera.height / 2;

    const newX = cx + (targetX - cx) * this.lerpSpeed;
    const newY = cy + (targetY - cy) * this.lerpSpeed;
    const newZoom = this.camera.zoom + (targetZoom - this.camera.zoom) * this.lerpSpeed;

    this.camera.centerOn(newX, newY);
    this.camera.setZoom(newZoom);
  }

  shake(duration = 100, intensity = 0.005): void {
    this.camera.shake(duration, intensity);
  }

  bigShake(): void {
    this.camera.shake(300, 0.01);
  }
}
