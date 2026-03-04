import Phaser from 'phaser';
import type { Fighter } from '../entities/Fighter';
import { EventBus, Events } from './EventBus';

export interface HazardConfig {
  type: 'falling_object';
  spawnInterval: number;
  damage: number;
  knockback: number;
  spawnArea: { xMin: number; xMax: number; y: number };
  fallSpeed: number;
  size: { width: number; height: number };
}

export class HazardSystem {
  private scene: Phaser.Scene;
  private fighters: Fighter[];
  private configs: HazardConfig[];
  private spawnTimers: number[];
  private activeHazards: Phaser.GameObjects.GameObject[] = [];
  private enabled = false;

  constructor(scene: Phaser.Scene, fighters: Fighter[], configs: HazardConfig[]) {
    this.scene = scene;
    this.fighters = fighters;
    this.configs = configs;
    this.spawnTimers = configs.map(c => c.spawnInterval);

    EventBus.on(Events.FIGHT, this.onFight, this);
    EventBus.on(Events.ROUND_END, this.onRoundEnd, this);
  }

  private onFight(): void { this.enabled = true; }
  private onRoundEnd(): void {
    this.enabled = false;
    this.clearActiveHazards();
  }

  update(_time: number, delta: number): void {
    if (!this.enabled) return;

    for (let i = 0; i < this.configs.length; i++) {
      this.spawnTimers[i] -= delta;
      if (this.spawnTimers[i] <= 0) {
        this.spawnFallingObject(this.configs[i]);
        this.spawnTimers[i] = this.configs[i].spawnInterval + (Math.random() - 0.5) * 2000;
      }
    }
  }

  private spawnFallingObject(cfg: HazardConfig): void {
    const area = cfg.spawnArea;
    const x = Phaser.Math.Between(area.xMin, area.xMax);

    // Warning indicator on ground
    const warning = this.scene.add.circle(x, 660, 14, 0xff0000, 0.3);
    warning.setDepth(5);
    this.ignoreOnUI(warning);
    this.scene.tweens.add({
      targets: warning,
      alpha: 0,
      duration: 250,
      yoyo: true,
      repeat: 3,
      onComplete: () => warning.destroy()
    });

    // Spawn hazard after warning
    this.scene.time.delayedCall(800, () => {
      if (!this.enabled) return;

      const size = cfg.size;
      const hazard = this.scene.add.rectangle(x, area.y, size.width, size.height, 0xff4400);
      hazard.setDepth(50);
      this.scene.physics.add.existing(hazard, false);
      const body = hazard.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setVelocityY(cfg.fallSpeed);
      body.setSize(size.width, size.height);
      this.ignoreOnUI(hazard);

      const hitTargets = new Set<number>();

      for (const fighter of this.fighters) {
        this.scene.physics.add.overlap(hazard, fighter, () => {
          if (hitTargets.has(fighter.playerIndex)) return;
          if (fighter.isDead || fighter.isInvulnerable) return;
          hitTargets.add(fighter.playerIndex);
          fighter.takeDamage(cfg.damage, 0, -cfg.knockback);
          this.spawnHitEffect(fighter.x, fighter.y);
          this.scene.cameras.main.shake(80, 0.004);
        });
      }

      this.activeHazards.push(hazard);

      // Destroy after falling off screen
      this.scene.time.delayedCall(3000, () => {
        const idx = this.activeHazards.indexOf(hazard);
        if (idx !== -1) this.activeHazards.splice(idx, 1);
        if (hazard.active) hazard.destroy();
      });
    });
  }

  private spawnHitEffect(x: number, y: number): void {
    const spark = this.scene.add.sprite(x, y, 'fx_hit_spark');
    spark.setScale(0.5);
    spark.setDepth(90);
    spark.setTint(0xff4400);
    spark.play('fx_hit_spark');
    this.ignoreOnUI(spark);
    spark.once('animationcomplete', () => spark.destroy());
  }

  private clearActiveHazards(): void {
    for (const h of this.activeHazards) {
      if (h.active) h.destroy();
    }
    this.activeHazards = [];
  }

  private ignoreOnUI(obj: Phaser.GameObjects.GameObject): void {
    const uiCam = this.scene.cameras.getCamera('ui');
    if (uiCam) uiCam.ignore(obj);
  }

  destroy(): void {
    this.clearActiveHazards();
    EventBus.off(Events.FIGHT, this.onFight, this);
    EventBus.off(Events.ROUND_END, this.onRoundEnd, this);
  }
}
