import Phaser from 'phaser';
import { EventBus, Events } from './EventBus';
import { Fighter, State } from '../entities/Fighter';

interface ComboData {
  targetIndex: number;
  attackerIndex: number;
  hitCount: number;
  totalDamage: number;
  lastHitTime: number;
}

export class ComboTracker {
  private scene: Phaser.Scene;
  private fighters: Fighter[];
  private combos: Map<number, ComboData>;
  private recoveryTimeout = 1200;
  private groundRecoveryDelay = 500;

  constructor(scene: Phaser.Scene, fighters: Fighter[]) {
    this.scene = scene;
    this.fighters = fighters;
    this.combos = new Map();

    EventBus.on(Events.HIT_LANDED, this.onHitLanded, this);
    EventBus.on(Events.ROUND_START, this.resetAll, this);
  }

  private onHitLanded(data: { attackerIndex: number; targetIndex: number; damage: number }): void {
    const now = this.scene.time.now;
    let combo = this.combos.get(data.targetIndex);

    if (!combo || combo.attackerIndex !== data.attackerIndex) {
      combo = {
        targetIndex: data.targetIndex,
        attackerIndex: data.attackerIndex,
        hitCount: 0,
        totalDamage: 0,
        lastHitTime: now
      };
      this.combos.set(data.targetIndex, combo);
    }

    combo.hitCount++;
    combo.totalDamage += data.damage;
    combo.lastHitTime = now;

    if (combo.hitCount >= 2) {
      EventBus.emit(Events.COMBO_HIT, {
        attackerIndex: combo.attackerIndex,
        targetIndex: combo.targetIndex,
        comboCount: combo.hitCount,
        totalDamage: combo.totalDamage
      });
    }
  }

  update(time: number, _delta: number): void {
    for (const [targetIndex, combo] of this.combos) {
      const target = this.fighters.find(f => f.playerIndex === targetIndex);
      if (!target) continue;

      const recovered = target.isOnGround &&
        (target.state === State.IDLE || target.state === State.RUN) &&
        (time - combo.lastHitTime > this.groundRecoveryDelay);

      const timedOut = time - combo.lastHitTime > this.recoveryTimeout;

      if (recovered || timedOut) {
        if (combo.hitCount >= 2) {
          EventBus.emit(Events.COMBO_RESET, { targetIndex });
        }
        this.combos.delete(targetIndex);
      }
    }
  }

  resetAll(): void {
    this.combos.clear();
  }

  destroy(): void {
    EventBus.off(Events.HIT_LANDED, this.onHitLanded, this);
    EventBus.off(Events.ROUND_START, this.resetAll, this);
  }
}
