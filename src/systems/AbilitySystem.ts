import Phaser from 'phaser';
import { Projectile } from '../entities/Projectile';
import { Fighter, State } from '../entities/Fighter';
import { EventBus, Events } from './EventBus';
import { getKarasuVFX, getProjectileVFX } from './CharacterVFX';
import type { AbilityVFX } from './CharacterVFX';
import type { AbilityState } from '../types';

function getAbilityVFX(characterId: string): AbilityVFX | null {
  if (characterId === 'karasu_crimson_phantom') return getKarasuVFX();
  return null;
}

export class AbilitySystem {
  private scene: Phaser.Scene;
  private fighters: Fighter[];
  private projectiles: Projectile[];
  private abilityState: Map<number, AbilityState>;
  private abilityVFX: Map<number, AbilityVFX | null>;

  constructor(scene: Phaser.Scene, fighters: Fighter[]) {
    this.scene = scene;
    this.fighters = fighters;
    this.projectiles = [];
    this.abilityState = new Map();
    this.abilityVFX = new Map();

    for (const fighter of fighters) {
      this.abilityVFX.set(fighter.playerIndex, getAbilityVFX(fighter.charData.id));
      this.abilityState.set(fighter.playerIndex, {
        primaryCooldown: 0,
        secondaryCooldown: 0,
        dodgeCooldown: 0,
        ultimateCharge: 100,
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
        const vfx = this.abilityVFX.get(fighter.playerIndex);
        if (vfx?.onShieldUpdate) {
          vfx.onShieldUpdate(state.shieldVisual as any, fighter);
        } else {
          state.shieldVisual.setPosition(fighter.x, fighter.y);
        }
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
    EventBus.emit(Events.ABILITY_USED, { type: 'projectile', fighterIndex: fighter.playerIndex });

    fighter.state = State.CAST;
    fighter.attackLocked = true;
    fighter.body.setVelocityX(0);
    fighter.play(`${fighter.prefix}_cast`, true);

    this.scene.time.delayedCall(150, () => {
      if (!fighter.active) return;

      const dir = fighter.facingRight ? 1 : -1;
      const rageMult = fighter.isRaging ? fighter.rageDamageMultiplier : 1;
      const vfx = this.abilityVFX.get(fighter.playerIndex);
      const projVFX = getProjectileVFX(fighter.charData.id);

      if (vfx?.onProjectileFire) {
        vfx.onProjectileFire(this.scene, fighter, dir);
      }

      const proj = new Projectile(this.scene, fighter.x + dir * 20, fighter.y, {
        damage: Math.floor(ability.damage * rageMult),
        speed: ability.speed,
        knockback: ability.knockback || 300,
        direction: dir,
        ownerIndex: fighter.playerIndex,
        size: ability.size || { width: 24, height: 24 },
        vfx: projVFX
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

    EventBus.emit(Events.ABILITY_USED, { type: ability.type, fighterIndex: fighter.playerIndex });

    if (ability.type === 'dash') {
      this.activateDash(fighter, ability);
      return;
    }

    if (ability.type === 'aoe') {
      this.activateAoe(fighter, ability);
      return;
    }

    if (ability.type === 'shield') {
      state.shieldActive = true;
      state.shieldHP = ability.absorb;

      const vfx = this.abilityVFX.get(fighter.playerIndex);

      if (vfx?.onShieldActivate) {
        state.shieldVisual = vfx.onShieldActivate(this.scene, fighter) as any;
      } else {
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
      }

      const originalTakeDamage = fighter.takeDamage.bind(fighter);
      fighter.takeDamage = (amount: number, kbX: number, kbY?: number) => {
        if (state.shieldActive) {
          state.shieldHP -= amount;
          if (state.shieldVisual) {
            if (vfx?.onShieldHit) {
              vfx.onShieldHit(this.scene, state.shieldVisual);
            } else {
              this.scene.tweens.add({
                targets: state.shieldVisual,
                alpha: 0.8,
                duration: 50,
                yoyo: true
              });
            }
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
    const vfx = this.abilityVFX.get(fighter.playerIndex);
    if (state.shieldVisual) {
      if (vfx?.onShieldRemove) {
        vfx.onShieldRemove(this.scene, state.shieldVisual as any);
      } else {
        state.shieldVisual.destroy();
      }
      state.shieldVisual = null;
    }
    fighter.takeDamage = originalTakeDamage;
  }

  private activateDash(fighter: Fighter, ability: import('../types').DashAbility): void {
    const dir = fighter.facingRight ? 1 : -1;
    const rageMult = fighter.isRaging ? fighter.rageDamageMultiplier : 1;
    const damage = Math.floor(ability.damage * rageMult);

    fighter.state = State.CAST;
    fighter.attackLocked = true;
    fighter.isInvulnerable = true;
    fighter.play(`${fighter.prefix}_cast`, true);

    // Brief startup then dash
    this.scene.time.delayedCall(100, () => {
      if (!fighter.active) return;

      fighter.body.setVelocityX(dir * 600);
      fighter.body.setVelocityY(-50);
      fighter.setAlpha(0.5);

      // VFX: trail behind the dash
      const vfx = this.abilityVFX.get(fighter.playerIndex);
      if (vfx?.onDash) {
        vfx.onDash(this.scene, fighter, dir);
      } else if (vfx?.onDodge) {
        vfx.onDodge(this.scene, fighter);
      } else {
        const flash = this.scene.add.sprite(fighter.x, fighter.y, 'fx_blink_flash');
        flash.setScale(0.5);
        flash.setDepth(85);
        flash.play('fx_blink_flash');
        this.ignoreOnUI(flash);
        flash.once('animationcomplete', () => flash.destroy());
      }

      // Trail particles during dash
      const trailTimer = this.scene.time.addEvent({
        delay: 40,
        repeat: 6,
        callback: () => {
          if (!fighter.active) return;
          const afterimage = this.scene.add.sprite(fighter.x, fighter.y, fighter.charData.texture);
          afterimage.setScale(fighter.scaleX, fighter.scaleY);
          afterimage.setFlipX(fighter.flipX);
          afterimage.setAlpha(0.3);
          afterimage.setDepth(fighter.depth - 1);
          afterimage.setTint(0xff2200);
          this.ignoreOnUI(afterimage);
          this.scene.tweens.add({
            targets: afterimage,
            alpha: 0,
            duration: 250,
            onComplete: () => afterimage.destroy()
          });
        }
      });

      // Check hits during dash
      const hitTargets = new Set<number>();
      const dashCheck = this.scene.time.addEvent({
        delay: 30,
        repeat: 8,
        callback: () => {
          for (const target of this.fighters) {
            if (target.playerIndex === fighter.playerIndex) continue;
            if (target.isDead || target.isInvulnerable) continue;
            if (hitTargets.has(target.playerIndex)) continue;

            const dx = Math.abs(fighter.x - target.x);
            const dy = Math.abs(fighter.y - target.y);
            if (dx < 40 && dy < 50) {
              hitTargets.add(target.playerIndex);
              target.takeDamage(damage, dir * ability.knockback, -150);
              EventBus.emit(Events.HIT_LANDED, {
                attackerIndex: fighter.playerIndex,
                targetIndex: target.playerIndex,
                damage
              });
            }
          }
        }
      });

      // End dash
      this.scene.time.delayedCall(280, () => {
        fighter.body.setVelocityX(0);
        fighter.isInvulnerable = false;
        fighter.attackLocked = false;
        fighter.setAlpha(1);
        fighter.state = State.IDLE;
        trailTimer.remove();
        dashCheck.remove();
      });
    });
  }

  private activateAoe(fighter: Fighter, ability: import('../types').AoeAbility): void {
    const rageMult = fighter.isRaging ? fighter.rageDamageMultiplier : 1;
    const damage = Math.floor(ability.damage * rageMult);

    fighter.state = State.CAST;
    fighter.attackLocked = true;
    fighter.body.setVelocityX(0);
    fighter.play(`${fighter.prefix}_cast`, true);

    this.scene.time.delayedCall(200, () => {
      if (!fighter.active) return;

      // AoE circle visual
      const aoe = this.scene.add.circle(fighter.x, fighter.y, 10, 0xff4400, 0.4);
      aoe.setDepth(80);
      this.ignoreOnUI(aoe);
      this.scene.tweens.add({
        targets: aoe,
        scaleX: ability.radius / 10,
        scaleY: ability.radius / 10,
        alpha: 0,
        duration: 400,
        onComplete: () => aoe.destroy()
      });

      // Hit check
      for (const target of this.fighters) {
        if (target.playerIndex === fighter.playerIndex) continue;
        if (target.isDead || target.isInvulnerable) continue;

        const dx = fighter.x - target.x;
        const dy = fighter.y - target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ability.radius) {
          const kbDir = dx < 0 ? 1 : -1;
          target.takeDamage(damage, kbDir * ability.knockback, -150);
          EventBus.emit(Events.HIT_LANDED, {
            attackerIndex: fighter.playerIndex,
            targetIndex: target.playerIndex,
            damage
          });
        }
      }
    });

    fighter.once('animationcomplete', () => {
      fighter.attackLocked = false;
      fighter.state = State.IDLE;
    });
  }

  private activateDodge(fighter: Fighter, state: AbilityState): void {
    const ability = fighter.charData.abilities.dodge;
    state.dodgeCooldown = ability.cooldown;
    EventBus.emit(Events.ABILITY_USED, { type: 'dodge', fighterIndex: fighter.playerIndex });

    fighter.isInvulnerable = true;
    fighter.state = State.DODGE;
    fighter.attackLocked = true;
    fighter.setAlpha(0.3);
    fighter.play(`${fighter.prefix}_dodge`, true);

    const vfx = this.abilityVFX.get(fighter.playerIndex);
    if (vfx?.onDodge) {
      vfx.onDodge(this.scene, fighter);
    } else {
      // Default blink flash at start position
      const flash = this.scene.add.sprite(fighter.x, fighter.y, 'fx_blink_flash');
      flash.setScale(0.5);
      flash.setDepth(85);
      flash.play('fx_blink_flash');
      this.ignoreOnUI(flash);
      flash.once('animationcomplete', () => flash.destroy());
    }

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
    EventBus.emit(Events.ABILITY_USED, { type: 'ultimate', fighterIndex: fighter.playerIndex });

    fighter.state = State.ULT;
    fighter.attackLocked = true;
    fighter.body.setVelocityX(0);
    fighter.play(`${fighter.prefix}_ult`, true);

    const vfx = this.abilityVFX.get(fighter.playerIndex);

    if (vfx?.onUltimateStart) {
      vfx.onUltimateStart(this.scene, fighter);
    } else {
      this.scene.cameras.main.flash(200, 255, 100, 0, true);
    }

    this.scene.time.delayedCall(ability.startup, () => {
      if (!fighter.active) return;

      const dir = fighter.facingRight ? 1 : -1;
      let wave: Phaser.GameObjects.GameObject;

      if (vfx?.onUltimateWave) {
        const customWave = vfx.onUltimateWave(this.scene, fighter, dir);
        if (!customWave) return;
        wave = customWave;
      } else {
        const defaultWave = this.scene.add.sprite(fighter.x + dir * 40, fighter.y, 'fx_phantom_slash');
        defaultWave.setScale(0.5);
        defaultWave.setDepth(85);
        defaultWave.setFlipX(dir < 0);
        this.scene.physics.add.existing(defaultWave, false);
        const waveBody = defaultWave.body as Phaser.Physics.Arcade.Body;
        waveBody.setAllowGravity(false);
        waveBody.setVelocityX(dir * 400);
        waveBody.setSize(100, 60);
        this.ignoreOnUI(defaultWave);
        defaultWave.play('fx_phantom_slash');
        wave = defaultWave;

        this.scene.time.delayedCall(2000, () => {
          defaultWave.destroy();
        });
      }

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
