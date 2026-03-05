import Phaser from 'phaser';
import type { ProjectileConfig } from '../types';
import type { Fighter } from './Fighter';
import type { ProjectileVFX } from '../systems/CharacterVFX';

export interface ProjectileOptions extends ProjectileConfig {
  vfx?: ProjectileVFX | null;
}

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  public damage: number;
  public knockbackForce: number;
  public direction: number;
  public ownerIndex: number;
  public passThrough: boolean;
  public visual: Phaser.GameObjects.GameObject;
  private customVFX: ProjectileVFX | null;
  private lifespanTimer: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ProjectileOptions) {
    super(scene, x, y, '__DEFAULT');

    this.damage = config.damage;
    this.knockbackForce = config.knockback;
    this.direction = config.direction;
    this.ownerIndex = config.ownerIndex;
    this.passThrough = config.passThrough || false;
    this.customVFX = config.vfx || null;

    const size = config.size || { width: 24, height: 24 };

    this.setVisible(false);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    if (this.customVFX) {
      this.visual = this.customVFX.createVisual(scene, x, y, this.direction);
    } else {
      const sprite = scene.add.sprite(x, y, 'fx_void_kunai');
      sprite.setScale(0.5);
      sprite.setDepth(50);
      sprite.setFlipX(this.direction < 0);
      sprite.play('fx_void_kunai');
      this.visual = sprite;
    }

    this.body.setSize(size.width, size.height);
    this.body.setAllowGravity(false);
    this.body.setVelocityX(config.speed * config.direction);

    this.lifespanTimer = scene.time.delayedCall(config.lifespan || 3000, () => {
      this.destroyProjectile();
    });
  }

  update(): void {
    if (this.visual && this.active) {
      if (this.customVFX) {
        this.customVFX.updateVisual(this.visual, this.x, this.y);
      } else {
        (this.visual as Phaser.GameObjects.Sprite).setPosition(this.x, this.y);
      }
    }
  }

  onHitFighter(fighter: Fighter): void {
    if (fighter.playerIndex === this.ownerIndex) return;
    if (fighter.isDead || fighter.isInvulnerable) return;

    const kbX = this.direction * this.knockbackForce;
    fighter.takeDamage(this.damage, kbX, -100);
    this.spawnImpact();
    this.destroyProjectile();
  }

  private spawnImpact(): void {
    if (this.customVFX) {
      this.customVFX.createImpact(this.scene, this.x, this.y);
      return;
    }
    const impact = this.scene.add.sprite(this.x, this.y, 'fx_kunai_impact');
    impact.setScale(0.5);
    impact.setDepth(90);
    impact.play('fx_kunai_impact');
    impact.once('animationcomplete', () => impact.destroy());
  }

  destroyProjectile(): void {
    if (this.lifespanTimer) this.lifespanTimer.remove();
    if (this.visual) {
      if (this.customVFX) {
        this.customVFX.destroyVisual(this.visual);
      } else {
        this.visual.destroy();
      }
    }
    this.destroy();
  }
}
