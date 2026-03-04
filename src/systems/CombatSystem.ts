import Phaser from 'phaser';
import type { Fighter } from '../entities/Fighter';
import { EventBus, Events } from './EventBus';

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
  private isFrozen = false;

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
    this.ignoreOnUI(hitbox);

    // Slash trail visual
    const trail = this.scene.add.sprite(hbX, hbY, 'fx_slash_trail');
    trail.setScale(0.5);
    trail.setDepth(85);
    trail.setFlipX(direction < 0);
    trail.play('fx_slash_trail');
    this.ignoreOnUI(trail);
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

    // Rage mode damage boost
    const attacker = this.fighters.find(f => f.playerIndex === hitbox.attackerIndex);
    let finalDamage = hitbox.damage;
    if (attacker && attacker.isRaging) {
      finalDamage = Math.floor(hitbox.damage * attacker.rageDamageMultiplier);
    }

    const kbX = hitbox.direction * hitbox.knockback;
    const kbY = hitbox.knockback > 100 ? -150 : -30;
    fighter.takeDamage(finalDamage, kbX, kbY);
    this.spawnHitSpark(fighter.x, fighter.y - 10);

    // Emit hit event for combo tracking
    EventBus.emit(Events.HIT_LANDED, {
      attackerIndex: hitbox.attackerIndex,
      targetIndex: fighter.playerIndex,
      damage: finalDamage
    });

    // Screen shake
    const isHeavy = hitbox.knockback > 100;
    if (isHeavy) {
      this.scene.cameras.main.shake(200, 0.01);
    } else {
      this.scene.cameras.main.shake(80, 0.004);
    }

    // Hit freeze
    if (!this.isFrozen) {
      this.isFrozen = true;
      const freezeMs = isHeavy ? 80 : 40;
      this.scene.physics.pause();
      this.scene.time.delayedCall(freezeMs, () => {
        this.scene.physics.resume();
        this.isFrozen = false;
      });
    }

    // Damage number
    const isRageHit = attacker?.isRaging ?? false;
    this.spawnDamageNumber(fighter.x, fighter.y - 30, finalDamage, isHeavy || isRageHit);
  }

  private spawnHitSpark(x: number, y: number): void {
    const spark = this.scene.add.sprite(x, y, 'fx_hit_spark');
    spark.setScale(0.5);
    spark.setDepth(90);
    spark.play('fx_hit_spark');
    this.ignoreOnUI(spark);
    spark.once('animationcomplete', () => spark.destroy());
  }

  private spawnDamageNumber(x: number, y: number, damage: number, isHeavy: boolean): void {
    const offsetX = (Math.random() - 0.5) * 20;
    const text = this.scene.add.text(x + offsetX, y, String(damage), {
      fontSize: isHeavy ? '18px' : '14px',
      fontFamily: 'monospace',
      color: isHeavy ? '#ffcc00' : '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    text.setOrigin(0.5);
    text.setDepth(95);
    this.ignoreOnUI(text);
    this.scene.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }

  private ignoreOnUI(obj: Phaser.GameObjects.GameObject): void {
    const uiCam = this.scene.cameras.getCamera('ui');
    if (uiCam) uiCam.ignore(obj);
  }

  private destroyHitbox(hitbox: Hitbox): void {
    const idx = this.activeHitboxes.indexOf(hitbox);
    if (idx !== -1) this.activeHitboxes.splice(idx, 1);
    hitbox.destroy();
  }
}
