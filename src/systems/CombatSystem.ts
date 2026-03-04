import Phaser from 'phaser';
import type { Fighter } from '../entities/Fighter';

interface Hitbox extends Phaser.GameObjects.Rectangle {
  attackerIndex: number;
  damage: number;
  knockback: number;
  direction: number;
  hasHit: Set<number>;
}

export class CombatSystem {
  private scene: Phaser.Scene;
  private fighters: Fighter[];
  private activeHitboxes: Hitbox[];

  constructor(scene: Phaser.Scene, fighters: Fighter[]) {
    this.scene = scene;
    this.fighters = fighters;
    this.activeHitboxes = [];
  }

  performAttack(attacker: Fighter, attackIndex: number): void {
    const attackData = attacker.charData.attacks[attackIndex];
    if (!attackData) return;

    const direction = attacker.facingRight ? 1 : -1;
    const hbX = attacker.x + (direction * (attackData.range / 2 + 12));
    const hbY = attacker.y;

    const hitbox = this.scene.add.rectangle(hbX, hbY, attackData.range, 32, 0xff0000, 0) as Hitbox;
    this.scene.physics.add.existing(hitbox, false);
    const body = hitbox.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);

    hitbox.attackerIndex = attacker.playerIndex;
    hitbox.damage = attackData.damage;
    hitbox.knockback = attackData.knockback;
    hitbox.direction = direction;
    hitbox.hasHit = new Set();

    this.activeHitboxes.push(hitbox);

    // Slash trail visual
    const trail = this.scene.add.sprite(hbX, hbY, 'fx_slash_trail');
    trail.setScale(0.5);
    trail.setDepth(85);
    trail.setFlipX(direction < 0);
    trail.play('fx_slash_trail');
    trail.once('animationcomplete', () => trail.destroy());

    for (const target of this.fighters) {
      if (target.playerIndex === attacker.playerIndex) continue;
      if (target.isDead) continue;

      this.scene.physics.add.overlap(hitbox, target, () => {
        this.onHitboxContact(hitbox, target);
      });
    }

    this.scene.time.delayedCall(120, () => {
      this.destroyHitbox(hitbox);
    });
  }

  private onHitboxContact(hitbox: Hitbox, fighter: Fighter): void {
    if (hitbox.hasHit.has(fighter.playerIndex)) return;
    hitbox.hasHit.add(fighter.playerIndex);

    const kbX = hitbox.direction * hitbox.knockback;
    const kbY = hitbox.knockback > 100 ? -150 : -30;
    fighter.takeDamage(hitbox.damage, kbX, kbY);
    this.spawnHitSpark(fighter.x, fighter.y - 10);
  }

  private spawnHitSpark(x: number, y: number): void {
    const spark = this.scene.add.sprite(x, y, 'fx_hit_spark');
    spark.setScale(0.5);
    spark.setDepth(90);
    spark.play('fx_hit_spark');
    spark.once('animationcomplete', () => spark.destroy());
  }

  private destroyHitbox(hitbox: Hitbox): void {
    const idx = this.activeHitboxes.indexOf(hitbox);
    if (idx !== -1) this.activeHitboxes.splice(idx, 1);
    hitbox.destroy();
  }
}
