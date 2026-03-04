import Phaser from 'phaser';
import { Fighter } from '../entities/Fighter';
import { InputManager, AIInputManager } from '../systems/InputManager';
import { AIController } from '../systems/AIController';
import { createFighterAnimations } from '../systems/AnimationManager';
import { CombatSystem } from '../systems/CombatSystem';
import { AbilitySystem } from '../systems/AbilitySystem';
import { CameraSystem } from '../systems/CameraSystem';
import { MatchManager } from '../systems/MatchManager';
import { ArenaFactory } from '../arenas/ArenaFactory';
import { HealthBar } from '../ui/HealthBar';
import { AbilityHUD } from '../ui/AbilityHUD';
import { Announcer } from '../ui/Announcer';
import { ScoreBoard } from '../ui/ScoreBoard';
import { getCharacter } from '../data/characters';
import { TRAINING_GROUNDS } from '../data/arenas/training_grounds';
import type { Arena } from '../types';

export class BattleScene extends Phaser.Scene {
  private fighters: Fighter[] = [];
  private healthBars: HealthBar[] = [];
  private arena!: Arena;
  private combatSystem!: CombatSystem;
  private abilitySystem!: AbilitySystem;
  private cameraSystem!: CameraSystem;
  private matchManager!: MatchManager;
  private abilityHUD!: AbilityHUD;
  private announcer!: Announcer;
  private scoreBoard!: ScoreBoard;
  private killZoneY!: number;
  private aiController!: AIController;
  private debugText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BattleScene' });
  }

  create(): void {
    this.fighters = [];
    this.healthBars = [];

    createFighterAnimations(this, 'rina');
    this.createEffectAnimations();

    const arenaData = TRAINING_GROUNDS;
    this.arena = ArenaFactory.build(this, arenaData);

    this.spawnPlayers();

    this.combatSystem = new CombatSystem(this, this.fighters);
    for (const fighter of this.fighters) {
      fighter.on('fighter-attack', (attacker: Fighter, attackIndex: number) => {
        this.combatSystem.performAttack(attacker, attackIndex);
      });
    }

    this.abilitySystem = new AbilitySystem(this, this.fighters);
    this.aiController = new AIController(
      this,
      this.fighters[1],
      this.fighters[0],
      this.fighters[1].inputMgr as AIInputManager,
      this.abilitySystem,
      'opus'
    );
    this.cameraSystem = new CameraSystem(this, this.fighters, arenaData.bounds);

    this.matchManager = new MatchManager(this, this.fighters, this.arena, {
      roundsToWin: 3,
      countdownSeconds: 3,
      roundEndDelay: 2500
    });

    this.announcer = new Announcer(this);
    this.scoreBoard = new ScoreBoard(this, this.fighters.length, 3);
    this.abilityHUD = new AbilityHUD(this, this.abilitySystem, this.fighters);

    const barColors = [0xff6b35, 0x35b5ff, 0x44ff44, 0xffcc00];
    for (let i = 0; i < this.fighters.length; i++) {
      this.healthBars.push(new HealthBar(this, this.fighters[i], barColors[i % barColors.length]));
    }

    this.killZoneY = arenaData.killZone?.y || 800;

    this.debugText = this.add.text(10, 10, '', {
      fontSize: '11px', color: '#ffffff', fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(100).setVisible(false);

    // Toggle debug with backtick key
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-BACKTICK', () => {
        this.debugText.setVisible(!this.debugText.visible);
      });
    }

    this.matchManager.start();
  }

  private spawnPlayers(): void {
    const charData = getCharacter('rina_shadow_assassin');
    if (!charData) return;

    for (let i = 0; i < 2; i++) {
      const spawn = ArenaFactory.getSpawnPoint(this.arena, i);
      const input = i === 1 ? new AIInputManager(this, i) : new InputManager(this, i);
      const fighter = new Fighter(this, spawn.x, spawn.y, charData, i, input);

      if (i === 1) {
        fighter.facingRight = false;
        fighter.setFlipX(true);
      }

      ArenaFactory.addFighterCollision(this, fighter, this.arena);
      this.fighters.push(fighter);
    }
  }

  update(time: number, delta: number): void {
    for (const fighter of this.fighters) {
      fighter.update(time, delta);

      if (!fighter.isDead && fighter.y > this.killZoneY) {
        fighter.health = 0;
        fighter.die();
      }
    }

    this.aiController.update(time, delta);
    this.abilitySystem.update(time, delta);
    this.cameraSystem.update();
    this.matchManager.update(time, delta);

    for (const hb of this.healthBars) hb.update();
    this.abilityHUD.update();

    const p1 = this.fighters[0];
    const p2 = this.fighters[1];
    if (p1 && p2) {
      const s1 = this.abilitySystem.getState(0);
      const s2 = this.abilitySystem.getState(1);
      const scores = this.matchManager.getScores();
      this.debugText.setText([
        `P1: ${p1.state} | HP: ${p1.health}/${p1.maxHealth} | ULT: ${Math.floor(s1?.ultimateCharge || 0)}% | Wins: ${scores[0]}`,
        `P2 [AI Opus 4.6]: ${p2.state} | HP: ${p2.health}/${p2.maxHealth} | ULT: ${Math.floor(s2?.ultimateCharge || 0)}% | Wins: ${scores[1]}`,
        `P1: WASD move, F attack, Q fireball, E shield, Space dodge, R ult`,
        `Match: ${this.matchManager.state} | FPS: ${Math.round(this.game.loop.actualFps)}`
      ].join('\n'));
    }
  }

  private createEffectAnimations(): void {
    const anims = this.anims;
    const effects = [
      { key: 'fx_void_kunai',     frames: 4, frameRate: 12, repeat: -1 },
      { key: 'fx_kunai_impact',   frames: 5, frameRate: 14, repeat: 0 },
      { key: 'fx_afterimage',     frames: 4, frameRate: 8,  repeat: 0 },
      { key: 'fx_slash_trail',    frames: 3, frameRate: 16, repeat: 0 },
      { key: 'fx_phantom_slash',  frames: 4, frameRate: 10, repeat: 0 },
      { key: 'fx_hit_spark',      frames: 3, frameRate: 16, repeat: 0 },
      { key: 'fx_blink_flash',    frames: 2, frameRate: 10, repeat: 0 },
    ];
    for (const fx of effects) {
      if (anims.exists(fx.key)) continue;
      anims.create({
        key: fx.key,
        frames: anims.generateFrameNumbers(fx.key, { start: 0, end: fx.frames - 1 }),
        frameRate: fx.frameRate,
        repeat: fx.repeat
      });
    }
  }
}
