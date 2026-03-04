import Phaser from 'phaser';
import { Fighter, State } from '../entities/Fighter';
import type { AIInputManager } from './InputManager';
import type { AbilitySystem } from './AbilitySystem';

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'opus';

interface AIConfig {
  reactionTime: number;
  aggressiveness: number;
  comboChance: number;
  abilityChance: number;
  dodgeChance: number;
  optimalSpacing: boolean;
  punishWhiffs: boolean;
  antiAir: boolean;
}

const DIFFICULTY_CONFIGS: Record<AIDifficulty, AIConfig> = {
  easy: {
    reactionTime: 800,
    aggressiveness: 0.3,
    comboChance: 0,
    abilityChance: 0.15,
    dodgeChance: 0,
    optimalSpacing: false,
    punishWhiffs: false,
    antiAir: false
  },
  medium: {
    reactionTime: 400,
    aggressiveness: 0.55,
    comboChance: 0.5,
    abilityChance: 0.4,
    dodgeChance: 0.25,
    optimalSpacing: false,
    punishWhiffs: false,
    antiAir: false
  },
  hard: {
    reactionTime: 200,
    aggressiveness: 0.75,
    comboChance: 0.85,
    abilityChance: 0.7,
    dodgeChance: 0.6,
    optimalSpacing: true,
    punishWhiffs: false,
    antiAir: true
  },
  opus: {
    reactionTime: 50,
    aggressiveness: 0.95,
    comboChance: 1.0,
    abilityChance: 0.95,
    dodgeChance: 0.95,
    optimalSpacing: true,
    punishWhiffs: true,
    antiAir: true
  }
};

export class AIController {
  private scene: Phaser.Scene;
  private fighter: Fighter;
  private opponent: Fighter;
  private input: AIInputManager;
  private abilitySystem: AbilitySystem;
  private config: AIConfig;
  private actionTimer: number;

  constructor(
    scene: Phaser.Scene,
    fighter: Fighter,
    opponent: Fighter,
    input: AIInputManager,
    abilitySystem: AbilitySystem,
    difficulty: AIDifficulty
  ) {
    this.scene = scene;
    this.fighter = fighter;
    this.opponent = opponent;
    this.input = input;
    this.abilitySystem = abilitySystem;
    this.config = DIFFICULTY_CONFIGS[difficulty];
    this.actionTimer = this.config.reactionTime;
  }

  update(_time: number, delta: number): void {
    this.input.clearAll();

    if (this.fighter.isDead || this.opponent.isDead) return;
    if (this.fighter.isLockedState()) return;

    const dist = Math.abs(this.fighter.x - this.opponent.x);
    const toOpponent = this.opponent.x > this.fighter.x ? 1 : -1;
    const attackRange = this.fighter.charData.attacks[0].range + 20;

    // Combo continuation — bypasses reaction timer
    if (this.fighter.comboTimer > 0 && this.fighter.comboStep > 0) {
      if (Math.random() < this.config.comboChance) {
        this.faceOpponent(toOpponent);
        this.input.setJustPressed('attack', true);
        return;
      }
    }

    // Movement (every frame, no reaction delay)
    this.handleMovement(dist, toOpponent, attackRange);

    // Actions (gated by reaction timer)
    this.actionTimer -= delta;
    if (this.actionTimer <= 0) {
      this.actionTimer = this.config.reactionTime * (0.8 + Math.random() * 0.4);
      this.handleActions(dist, toOpponent, attackRange);
    }
  }

  private faceOpponent(toOpponent: number): void {
    if (toOpponent > 0) this.input.setDown('right', true);
    else this.input.setDown('left', true);
  }

  private handleMovement(dist: number, toOpponent: number, attackRange: number): void {
    // Stage edge detection — don't walk off
    const edgeMargin = 40;
    const nearLeftEdge = this.fighter.x < edgeMargin;
    const nearRightEdge = this.fighter.x > 960;
    if (nearLeftEdge && toOpponent < 0) return;
    if (nearRightEdge && toOpponent > 0) return;
    // If near edge, move away from it
    if (nearLeftEdge) { this.input.setDown('right', true); return; }
    if (nearRightEdge) { this.input.setDown('left', true); return; }

    if (this.config.optimalSpacing) {
      const idealRange = attackRange + 5;
      const threshold = 15;

      if (this.config.punishWhiffs && this.isOpponentVulnerable()) {
        // Rush in to punish
        this.faceOpponent(toOpponent);
      } else if (dist > idealRange + threshold) {
        this.faceOpponent(toOpponent);
      } else if (dist < idealRange - threshold) {
        // Too close, back off
        if (toOpponent > 0) this.input.setDown('left', true);
        else this.input.setDown('right', true);
      }
      // At ideal range: stop and wait for opening
    } else {
      // Easy/Medium: basic approach
      if (dist > attackRange + 10) {
        if (Math.random() < this.config.aggressiveness) {
          this.faceOpponent(toOpponent);
        }
      }
    }
  }

  private handleActions(dist: number, toOpponent: number, attackRange: number): void {
    const state = this.abilitySystem.getState(this.fighter.playerIndex);
    if (!state) return;

    // Priority 1: Dodge incoming attacks
    if (this.shouldDodge(dist, state.dodgeCooldown)) {
      this.input.setJustPressed('dodge', true);
      return;
    }

    // Priority 2: Ultimate when charged and opponent nearby
    if (state.ultimateCharge >= 100 && dist < 200) {
      this.faceOpponent(toOpponent);
      this.input.setJustPressed('ultimate', true);
      return;
    }

    // Priority 3: Punish opponent vulnerability (Opus)
    if (this.config.punishWhiffs && this.isOpponentVulnerable() && dist <= attackRange + 30) {
      this.faceOpponent(toOpponent);
      this.input.setJustPressed('attack', true);
      return;
    }

    // Priority 4: Attack if in range
    if (dist <= attackRange + 10) {
      if (Math.random() < this.config.aggressiveness) {
        this.faceOpponent(toOpponent);
        this.input.setJustPressed('attack', true);
        return;
      }
    }

    // Priority 5: Shield when low HP or about to be hit
    if (state.secondaryCooldown <= 0 && !state.shieldActive) {
      const shouldShield =
        (this.fighter.health < this.fighter.maxHealth * 0.35) ||
        (this.isOpponentAttacking() && dist < 80);
      if (shouldShield && Math.random() < this.config.abilityChance) {
        this.input.setJustPressed('ability2', true);
        return;
      }
    }

    // Priority 6: Projectile at range
    if (dist > 120 && state.primaryCooldown <= 0) {
      if (Math.random() < this.config.abilityChance) {
        this.faceOpponent(toOpponent);
        this.input.setJustPressed('ability1', true);
        return;
      }
    }

    // Priority 7: Anti-air or random jump
    if (this.config.antiAir && !this.opponent.isOnGround && dist < 100) {
      this.input.setJustPressed('up', true);
    } else if (Math.random() < 0.05) {
      this.input.setJustPressed('up', true);
    }
  }

  private shouldDodge(dist: number, dodgeCooldown: number): boolean {
    if (this.config.dodgeChance === 0) return false;
    if (dodgeCooldown > 0) return false;
    if (this.isOpponentAttacking() && dist < 80) {
      return Math.random() < this.config.dodgeChance;
    }
    return false;
  }

  private isOpponentAttacking(): boolean {
    return [State.ATTACK1, State.ATTACK2, State.ATTACK3, State.CAST, State.ULT]
      .includes(this.opponent.state);
  }

  private isOpponentVulnerable(): boolean {
    return this.opponent.isLockedState() && this.opponent.state !== State.DODGE;
  }
}
