import Phaser from 'phaser';
import { Projectile } from '../entities/Projectile';
import { Fighter, State } from '../entities/Fighter';
import { EventBus, Events } from './EventBus';
import type { AbilityState } from '../types';

export class AbilitySystem {
  private scene: Phaser.Scene;
  private fighters: Fighter[];
  private projectiles: Projectile[];
  private abilityState: Map<number, AbilityState>;

  constructor(scene: Phaser.Scene, fighters: Fighter[]) {
    this.scene = scene;
    this.fighters = fighters;
    this.projectiles = [];
    this.abilityState = new Map();

    for (const fighter of fighters) {
      this.abilityState.set(fighter.playerIndex, {
        primaryCooldown: 0,
        secondaryCooldown: 0,
        dodgeCooldown: 0,
        ultimateCharge: 0,
        shieldActive: false,
        shieldHP: 0,
        shieldVisual: null
      });
    }
  }

  update(_time: number, delta: number): void {
    for (const fighter of this.fighters) {
      if (fighter.isDead) continue;

      const state = this.abilityState.get(fighter.playerIndex)!;
      const abilities = fighter.charData.abilities;

      if (state.primaryCooldown > 0) state.primaryCooldown -= delta;
      if (state.secondaryCooldown > 0) state.secondaryCooldown -= delta;
      if (state.dodgeCooldown > 0) state.dodgeCooldown -= delta;

      if (abilities.ultimate && state.ultimateCharge < 100) {
        state.ultimateCharge += (abilities.ultimate.chargeRate.passive / 1000) * delta;
        state.ultimateCharge = Math.min(100, state.ultimateCharge);
      }

      this.handleAbilityInput(fighter, state);

      if (state.shieldActive && state.shieldVisual) {
        state.shieldVisual.setPosition(fighter.x, fighter.y);
      }
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      if (!proj.active) {
        this.projectiles.splice(i, 1);
        continue;
      }
      proj.update();
    }
  }

  private handleAbilityInput(fighter: Fighter, state: AbilityState): void {
    if (fighter.isLockedState()) return;

    const abilities = fighter.charData.abilities;

    if (fighter.inputMgr.justPressed('ability1') && state.primaryCooldown <= 0 && abilities.primary) {
      this.activatePrimary(fighter, state);
    }

    if (fighter.inputMgr.justPressed('ability2') && state.secondaryCooldown <= 0 && abilities.secondary) {
      this.activateSecondary(fighter, state);
    }

    if (fighter.inputMgr.justPressed('dodge') && state.dodgeCooldown <= 0 && abilities.dodge) {
      this.activateDodge(fighter, state);
    }

    if (fighter.inputMgr.justPressed('ultimate') && state.ultimateCharge >= 100 && abilities.ultimate) {
      this.activateUltimate(fighter, state);
    }
  }

  private activatePrimary(fighter: Fighter, state: AbilityState): void {
    const ability = fighter.charData.abilities.primary;
    state.primaryCooldown = ability.cooldown;

    fighter.state = State.CAST;
    fighter.attackLocked = true;
    fighter.body.setVelocityX(0);
    fighter.play(`${fighter.prefix}_cast`, true);

    this.scene.time.delayedCall(150, () => {
      if (!fighter.active) return;

      const dir = fighter.facingRight ? 1 : -1;
      const rageMult = fighter.isRaging ? fighter.rageDamageMultiplier : 1;
      const proj = new Projectile(this.scene, fighter.x + dir * 20, fighter.y, {
        damage: Math.floor(ability.damage * rageMult),
        speed: ability.speed,
        knockback: ability.knockback || 300,
        direction: dir,
        ownerIndex: fighter.playerIndex,
        size: ability.size || { width: 24, height: 24 }
      });

      this.ignoreOnUI(proj);
      this.projectiles.push(proj);

      for (const target of this.fighters) {
        if (target.playerIndex === fighter.playerIndex) continue;
        this.scene.physics.add.overlap(proj, target, () => {
          proj.onHitFighter(target);
        });
      }
    });

    fighter.once('animationcomplete', () => {
      fighter.attackLocked = false;
      fighter.state = State.IDLE;
    });
  }

  private activateSecondary(fighter: Fighter, state: AbilityState): void {
    const ability = fighter.charData.abilities.secondary;
    state.secondaryCooldown = ability.cooldown;

    if (ability.type === 'shield') {
      state.shieldActive = true;
      state.shieldHP = ability.absorb;

      const afterimage = this.scene.add.sprite(fighter.x, fighter.y, 'fx_afterimage');
      afterimage.setScale(0.5);
      afterimage.setDepth(80);
      afterimage.setAlpha(0.6);
      afterimage.play('fx_afterimage');
      this.ignoreOnUI(afterimage);
      afterimage.on('animationcomplete', () => {
        if (state.shieldActive) afterimage.play('fx_afterimage');
      });
      state.shieldVisual = afterimage as any;

      const originalTakeDamage = fighter.takeDamage.bind(fighter);
      fighter.takeDamage = (amount: number, kbX: number, kbY?: number) => {
        if (state.shieldActive) {
          state.shieldHP -= amount;
          if (state.shieldVisual) {
            this.scene.tweens.add({
              targets: state.shieldVisual,
              alpha: 0.8,
              duration: 50,
              yoyo: true
            });
          }
          if (state.shieldHP <= 0) {
            this.removeShield(fighter, state, originalTakeDamage);
            const leftover = Math.abs(state.shieldHP);
            if (leftover > 0) originalTakeDamage(leftover, kbX, kbY);
          }
          return;
        }
        originalTakeDamage(amount, kbX, kbY);
      };

      this.scene.time.delayedCall(ability.duration, () => {
        this.removeShield(fighter, state, originalTakeDamage);
      });
    }
  }

  private removeShield(
    fighter: Fighter,
    state: AbilityState,
    originalTakeDamage: (amount: number, kbX: number, kbY?: number) => void
  ): void {
    if (!state.shieldActive) return;
    state.shieldActive = false;
    if (state.shieldVisual) {
      state.shieldVisual.destroy();
      state.shieldVisual = null;
    }
    fighter.takeDamage = originalTakeDamage;
  }

  private activateDodge(fighter: Fighter, state: AbilityState): void {
    const ability = fighter.charData.abilities.dodge;
    state.dodgeCooldown = ability.cooldown;

    fighter.isInvulnerable = true;
    fighter.state = State.DODGE;
    fighter.attackLocked = true;
    fighter.setAlpha(0.3);
    fighter.play(`${fighter.prefix}_dodge`, true);

    // Blink flash at start position
    const flash = this.scene.add.sprite(fighter.x, fighter.y, 'fx_blink_flash');
    flash.setScale(0.5);
    flash.setDepth(85);
    flash.play('fx_blink_flash');
    this.ignoreOnUI(flash);
    flash.once('animationcomplete', () => flash.destroy());

    this.scene.time.delayedCall(ability.duration, () => {
      fighter.isInvulnerable = false;
      fighter.attackLocked = false;
      fighter.state = State.IDLE;
      fighter.setAlpha(1);
    });
  }

  private activateUltimate(fighter: Fighter, state: AbilityState): void {
    const ability = fighter.charData.abilities.ultimate;
    state.ultimateCharge = 0;

    fighter.state = State.ULT;
    fighter.attackLocked = true;
    fighter.body.setVelocityX(0);
    fighter.play(`${fighter.prefix}_ult`, true);

    this.scene.cameras.main.flash(200, 255, 100, 0, true);

    this.scene.time.delayedCall(ability.startup, () => {
      if (!fighter.active) return;

      const dir = fighter.facingRight ? 1 : -1;

      const wave = this.scene.add.sprite(fighter.x + dir * 40, fighter.y, 'fx_phantom_slash');
      wave.setScale(0.5);
      wave.setDepth(85);
      wave.setFlipX(dir < 0);
      this.scene.physics.add.existing(wave, false);
      const waveBody = wave.body as Phaser.Physics.Arcade.Body;
      waveBody.setAllowGravity(false);
      waveBody.setVelocityX(dir * 400);
      waveBody.setSize(100, 60);
      this.ignoreOnUI(wave);
      wave.play('fx_phantom_slash');

      const hitTargets = new Set<number>();
      const ultRageMult = fighter.isRaging ? fighter.rageDamageMultiplier : 1;
      const ultDamage = Math.floor(ability.damage * ultRageMult);

      for (const target of this.fighters) {
        if (target.playerIndex === fighter.playerIndex) continue;
        this.scene.physics.add.overlap(wave, target, () => {
          if (hitTargets.has(target.playerIndex)) return;
          hitTargets.add(target.playerIndex);
          target.takeDamage(ultDamage, dir * ability.knockback, -200);
          EventBus.emit(Events.HIT_LANDED, {
            attackerIndex: fighter.playerIndex,
            targetIndex: target.playerIndex,
            damage: ultDamage
          });
        });
      }

      this.scene.time.delayedCall(2000, () => {
        wave.destroy();
      });
    });

    fighter.once('animationcomplete', () => {
      fighter.attackLocked = false;
      fighter.state = State.IDLE;
    });
  }

  private ignoreOnUI(obj: Phaser.GameObjects.GameObject): void {
    const uiCam = this.scene.cameras.getCamera('ui');
    if (uiCam) uiCam.ignore(obj);
  }

  addCharge(fighterIndex: number, type: 'deal' | 'take', amount: number): void {
    const state = this.abilityState.get(fighterIndex);
    if (!state) return;
    const fighter = this.fighters.find(f => f.playerIndex === fighterIndex);
    if (!fighter) return;
    const rates = fighter.charData.abilities.ultimate?.chargeRate;
    if (!rates) return;

    if (type === 'deal') {
      state.ultimateCharge += amount * rates.dealDamage;
    } else if (type === 'take') {
      state.ultimateCharge += amount * rates.takeDamage;
    }
    state.ultimateCharge = Math.min(100, state.ultimateCharge);
  }

  getState(fighterIndex: number): AbilityState | undefined {
    return this.abilityState.get(fighterIndex);
  }
}
