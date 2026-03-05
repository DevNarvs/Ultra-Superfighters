import Phaser from 'phaser';
import { Fighter } from '../entities/Fighter';
import { InputManager, AIInputManager } from '../systems/InputManager';
import { AIController } from '../systems/AIController';
import { createFighterAnimations } from '../systems/AnimationManager';
import { CombatSystem } from '../systems/CombatSystem';
import { AbilitySystem } from '../systems/AbilitySystem';
import { CameraSystem } from '../systems/CameraSystem';
import { MatchManager } from '../systems/MatchManager';
import { WallBounceSystem } from '../systems/WallBounceSystem';
import { ComboTracker } from '../systems/ComboTracker';
import { KillCamSystem } from '../systems/KillCamSystem';
import { HazardSystem } from '../systems/HazardSystem';
import { ArenaFactory } from '../arenas/ArenaFactory';
import { HealthBar } from '../ui/HealthBar';
import { AbilityHUD } from '../ui/AbilityHUD';
import { Announcer } from '../ui/Announcer';
import { ScoreBoard } from '../ui/ScoreBoard';
import { ComboCounter } from '../ui/ComboCounter';
import { getCharacter } from '../data/characters';
import { TRAINING_GROUNDS } from '../data/arenas/training_grounds';
import { SoundManager } from '../systems/SoundManager';
import type { Arena } from '../types';

export class BattleScene extends Phaser.Scene {
  private fighters: Fighter[] = [];
  private healthBars: HealthBar[] = [];
  private arena!: Arena;
  private combatSystem!: CombatSystem;
  private abilitySystem!: AbilitySystem;
  private cameraSystem!: CameraSystem;
  private matchManager!: MatchManager;
  private wallBounceSystem!: WallBounceSystem;
  private comboTracker!: ComboTracker;
  private killCamSystem!: KillCamSystem;
  private hazardSystem!: HazardSystem | null;
  private abilityHUD!: AbilityHUD;
  private announcer!: Announcer;
  private scoreBoard!: ScoreBoard;
  private comboCounter!: ComboCounter;
  private killZoneY!: number;
  private aiController: AIController | null = null;
  private debugText!: Phaser.GameObjects.Text;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;
  private mode: 'ai' | 'local' = 'ai';
  private sceneData: any = {};

  constructor() {
    super({ key: 'BattleScene' });
  }

  create(data: { p1Character?: string; p2Character?: string; mode?: 'ai' | 'local'; aiDifficulty?: string }): void {
    this.fighters = [];
    this.healthBars = [];
    this.hazardSystem = null;
    this.aiController = null;
    this.mode = data?.mode || 'ai';
    this.sceneData = data;

    // Determine characters from scene data or defaults
    const p1CharId = data?.p1Character || 'rina_shadow_assassin';
    const p2CharId = data?.p2Character || 'rina_shadow_assassin';

    const p1Char = getCharacter(p1CharId);
    const p2Char = getCharacter(p2CharId);
    if (p1Char) createFighterAnimations(this, p1Char.texture);
    if (p2Char && p2Char.texture !== p1Char?.texture) {
      createFighterAnimations(this, p2Char.texture);
    }
    this.createEffectAnimations();

    const arenaData = TRAINING_GROUNDS;
    this.arena = ArenaFactory.build(this, arenaData);

    this.spawnPlayers(p1CharId, p2CharId, this.mode);

    // Core systems
    this.combatSystem = new CombatSystem(this, this.fighters);
    for (const fighter of this.fighters) {
      fighter.on('fighter-attack', (attacker: Fighter, attackIndex: number) => {
        this.combatSystem.performAttack(attacker, attackIndex);
      });
    }

    this.abilitySystem = new AbilitySystem(this, this.fighters);

    // Only create AI controller in AI mode
    if (this.mode === 'ai') {
      const aiDifficulty = (data?.aiDifficulty || 'opus') as any;
      this.aiController = new AIController(
        this,
        this.fighters[1],
        this.fighters[0],
        this.fighters[1].inputMgr as AIInputManager,
        this.abilitySystem,
        aiDifficulty
      );
    }
    this.cameraSystem = new CameraSystem(this, this.fighters, arenaData.bounds);

    this.matchManager = new MatchManager(this, this.fighters, this.arena, {
      roundsToWin: 3,
      countdownSeconds: 3,
      roundEndDelay: 2500
    });

    // New systems
    this.wallBounceSystem = new WallBounceSystem(this, this.fighters);
    this.comboTracker = new ComboTracker(this, this.fighters);
    this.killCamSystem = new KillCamSystem(this);

    // Kill cam on KO
    for (const fighter of this.fighters) {
      fighter.on('fighter-ko', (koFighter: Fighter) => {
        this.killCamSystem.trigger(koFighter);
      });
    }

    // Stage hazards
    if (arenaData.hazards && arenaData.hazards.length > 0) {
      this.hazardSystem = new HazardSystem(this, this.fighters, arenaData.hazards);
    }

    // UI
    this.announcer = new Announcer(this);
    this.scoreBoard = new ScoreBoard(this, this.fighters.length, 3);
    this.abilityHUD = new AbilityHUD(this, this.abilitySystem, this.fighters);
    this.comboCounter = new ComboCounter(this, this.fighters.length);

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

      // F5 goes back to character select
      this.input.keyboard.on('keydown-F5', (event: KeyboardEvent) => {
        event.preventDefault();
        SoundManager.getInstance().stopMusic();
        this.scene.start('CharacterSelectScene');
      });

      // ESC opens pause menu
      this.input.keyboard.on('keydown-ESC', (event: KeyboardEvent) => {
        event.preventDefault();
        if (!this.scene.isPaused()) {
          this.scene.pause();
          this.scene.launch('PauseScene');
        }
      });

      // M toggles mute
      this.input.keyboard.on('keydown-M', () => {
        SoundManager.getInstance().toggleMute();
      });
    }

    // Clean up global listeners when scene shuts down
    this.events.on('shutdown', () => {
      this.announcer.destroy();
      this.scoreBoard.destroy();
      this.comboTracker.destroy();
      this.comboCounter.destroy();
      if (this.hazardSystem) this.hazardSystem.destroy();
      for (const hb of this.healthBars) hb.destroy();
      // Restore timescale in case kill cam was active
      this.time.timeScale = 1;
      this.physics.world.timeScale = 1;
    });

    // === Dedicated UI Camera (immune to zoom / shake / scroll) ===
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'ui');
    this.uiCamera.setScroll(0, 0);

    // Collect screen-fixed HUD objects
    const uiObjects: Phaser.GameObjects.GameObject[] = [this.debugText];
    for (const hb of this.healthBars) uiObjects.push(...hb.getUIObjects());
    uiObjects.push(...this.abilityHUD.getUIObjects());
    uiObjects.push(...this.scoreBoard.getUIObjects());
    uiObjects.push(...this.announcer.getUIObjects());
    uiObjects.push(...this.comboCounter.getUIObjects());

    // Main camera skips HUD (so they don't shake / zoom)
    this.cameras.main.ignore(uiObjects);

    // UI camera skips all world objects (so they aren't duplicated)
    const worldObjects: Phaser.GameObjects.GameObject[] = [];
    for (const f of this.fighters) worldObjects.push(f);
    for (const hb of this.healthBars) worldObjects.push(...hb.getWorldObjects());
    this.arena.groundGroup.getChildren().forEach(c => worldObjects.push(c));
    this.arena.platformGroup.getChildren().forEach(c => worldObjects.push(c));
    this.uiCamera.ignore(worldObjects);

    // Start battle music
    SoundManager.getInstance().startBattleMusic();

    this.matchManager.start();
  }

  private spawnPlayers(p1CharId: string, p2CharId: string, mode: 'ai' | 'local'): void {
    const charIds = [p1CharId, p2CharId];

    for (let i = 0; i < 2; i++) {
      const charData = getCharacter(charIds[i]);
      if (!charData) continue;

      const spawn = ArenaFactory.getSpawnPoint(this.arena, i);
      // In local mode, both players use real InputManager; in AI mode, P2 uses AIInputManager
      const input = (i === 1 && mode === 'ai')
        ? new AIInputManager(this, i)
        : new InputManager(this, i);
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

    if (this.aiController) this.aiController.update(time, delta);
    this.abilitySystem.update(time, delta);
    this.cameraSystem.update();
    this.matchManager.update(time, delta);
    this.comboTracker.update(time, delta);
    if (this.hazardSystem) this.hazardSystem.update(time, delta);

    for (const hb of this.healthBars) hb.update();
    this.abilityHUD.update();

    const p1 = this.fighters[0];
    const p2 = this.fighters[1];
    if (p1 && p2) {
      const s1 = this.abilitySystem.getState(0);
      const s2 = this.abilitySystem.getState(1);
      const scores = this.matchManager.getScores();
      this.debugText.setText([
        `P1: ${p1.state} | HP: ${p1.health}/${p1.maxHealth}${p1.isRaging ? ' RAGE!' : ''} | ULT: ${Math.floor(s1?.ultimateCharge || 0)}% | Wins: ${scores[0]}`,
        `P2 [${this.mode === 'ai' ? 'AI' : 'P2'}]: ${p2.state} | HP: ${p2.health}/${p2.maxHealth}${p2.isRaging ? ' RAGE!' : ''} | ULT: ${Math.floor(s2?.ultimateCharge || 0)}% | Wins: ${scores[1]}`,
        `P1: WASD+F+QER+Space | ${this.mode === 'local' ? 'P2: Arrows+Numpad' : 'AI mode'}`,
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
      // Karasu VFX
      { key: 'fx_karasu_black_flame',   frames: 4, frameRate: 12, repeat: -1 },
      { key: 'fx_karasu_flame_impact',  frames: 5, frameRate: 14, repeat: 0 },
      { key: 'fx_karasu_crow_sub',      frames: 4, frameRate: 6,  repeat: 0 },
      { key: 'fx_karasu_phantom_slash', frames: 3, frameRate: 10, repeat: 0 },
      { key: 'fx_karasu_susanoo',       frames: 4, frameRate: 6,  repeat: 0 },
      { key: 'fx_karasu_hellfire',      frames: 4, frameRate: 8,  repeat: 0 },
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
