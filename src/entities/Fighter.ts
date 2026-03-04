import Phaser from 'phaser';
import type { CharacterData } from '../types';
import { InputManager } from '../systems/InputManager';

export enum State {
  IDLE = 'idle',
  RUN = 'run',
  JUMP = 'jump',
  FALL = 'fall',
  ATTACK1 = 'attack1',
  ATTACK2 = 'attack2',
  ATTACK3 = 'attack3',
  CAST = 'cast',
  HIT = 'hit',
  DODGE = 'dodge',
  ULT = 'ult',
  DEATH = 'death'
}

export class Fighter extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  public charData: CharacterData;
  public playerIndex: number;
  public inputMgr: InputManager;
  public maxHealth: number;
  public health: number;
  public moveSpeed: number;
  public jumpForce: number;
  public state: State;
  public facingRight: boolean;
  public isOnGround: boolean;
  public canDropThrough: boolean;
  public comboStep: number;
  public comboTimer: number;
  public attackLocked: boolean;
  public isInvulnerable: boolean;
  public isDead: boolean;
  public isWallBouncing: boolean;
  public isRaging: boolean;
  public rageDamageMultiplier: number = 1.5;

  private rageThreshold: number = 0.25;
  private rageAura: Phaser.GameObjects.Arc | null = null;
  private dropThroughTimer: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    characterData: CharacterData,
    playerIndex: number,
    inputManager: InputManager
  ) {
    super(scene, x, y, characterData.texture);

    this.charData = characterData;
    this.playerIndex = playerIndex;
    this.inputMgr = inputManager;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.5);
    this.body.setSize(48, 96);
    this.body.setOffset(40, 28);
    this.body.setMaxVelocityY(600);
    this.body.setCollideWorldBounds(true);
    this.body.onWorldBounds = true;

    this.maxHealth = characterData.health;
    this.health = this.maxHealth;
    this.moveSpeed = characterData.moveSpeed;
    this.jumpForce = characterData.jumpForce;

    this.state = State.IDLE;
    this.facingRight = true;
    this.isOnGround = false;
    this.canDropThrough = false;
    this.dropThroughTimer = 0;

    this.comboStep = 0;
    this.comboTimer = 0;
    this.attackLocked = false;
    this.isInvulnerable = false;
    this.isDead = false;
    this.isWallBouncing = false;
    this.isRaging = false;

    this.play(`${characterData.texture}_idle`);
  }

  get prefix(): string {
    return this.charData.texture;
  }

  update(time: number, delta: number): void {
    if (this.isDead) return;

    this.updateRageState();
    this.isOnGround = this.body.blocked.down || this.body.touching.down;

    if (this.dropThroughTimer > 0) {
      this.dropThroughTimer -= delta;
      if (this.dropThroughTimer <= 0) {
        this.canDropThrough = false;
        this.body.checkCollision.down = true;
      }
    }

    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.comboStep = 0;
      }
    }

    if (this.isLockedState()) return;

    this.handleMovement();
    this.handleJump();
    this.handleAttack();
    this.updateAnimation();
  }

  isLockedState(): boolean {
    return [State.ATTACK1, State.ATTACK2, State.ATTACK3, State.CAST, State.HIT, State.DODGE, State.ULT, State.DEATH]
      .includes(this.state);
  }

  private handleMovement(): void {
    const h = this.inputMgr.getHorizontal();

    if (h !== 0) {
      this.body.setVelocityX(h * this.moveSpeed);
      this.facingRight = h > 0;
      this.setFlipX(!this.facingRight);
      if (this.isOnGround) this.state = State.RUN;
    } else {
      this.body.setVelocityX(0);
      if (this.isOnGround) this.state = State.IDLE;
    }

    if (!this.isOnGround) {
      this.state = this.body.velocity.y < 0 ? State.JUMP : State.FALL;
    }
  }

  private handleJump(): void {
    if (this.inputMgr.justPressed('up') && this.isOnGround) {
      this.body.setVelocityY(this.jumpForce);
      this.state = State.JUMP;
      this.isOnGround = false;
    }

    if (this.inputMgr.justPressed('down') && this.isOnGround) {
      this.canDropThrough = true;
      this.body.checkCollision.down = false;
      this.dropThroughTimer = 200;
    }
  }

  private handleAttack(): void {
    if (!this.inputMgr.justPressed('attack')) return;
    if (!this.isOnGround) return;

    const attacks = this.charData.attacks;
    const nextStep = this.comboStep;
    if (nextStep >= attacks.length) return;

    const attack = attacks[nextStep];
    const stateMap = [State.ATTACK1, State.ATTACK2, State.ATTACK3];
    const animMap = ['attack1', 'attack2', 'attack3'];

    this.state = stateMap[nextStep];
    this.attackLocked = true;

    // Lunge forward during combo to stay in range
    const lungeSpeed = nextStep === 2 ? 120 : 80;
    const dir = this.facingRight ? 1 : -1;
    this.body.setVelocityX(dir * lungeSpeed);

    this.play(`${this.prefix}_${animMap[nextStep]}`, true);
    this.emit('fighter-attack', this, nextStep);

    this.once('animationcomplete', () => {
      this.attackLocked = false;
      this.state = State.IDLE;

      if (attack.comboWindow > 0 && nextStep < attacks.length - 1) {
        this.comboStep = nextStep + 1;
        this.comboTimer = attack.comboWindow;
      } else {
        this.comboStep = 0;
        this.comboTimer = 0;
      }
    });
  }

  private updateAnimation(): void {
    const anim = this.anims.currentAnim;
    const prefix = this.prefix;

    switch (this.state) {
      case State.IDLE:
        if (!anim || anim.key !== `${prefix}_idle`) this.play(`${prefix}_idle`, true);
        break;
      case State.RUN:
        if (!anim || anim.key !== `${prefix}_run`) this.play(`${prefix}_run`, true);
        break;
      case State.JUMP:
      case State.FALL:
        if (!anim || anim.key !== `${prefix}_jump`) this.play(`${prefix}_jump`, true);
        break;
    }
  }

  private updateRageState(): void {
    const shouldRage = this.health > 0 && this.health <= this.maxHealth * this.rageThreshold;

    if (shouldRage && !this.isRaging) {
      this.isRaging = true;
      this.setTint(0xff4444);
      // Pulsing red aura behind fighter
      this.rageAura = this.scene.add.circle(this.x, this.y, 40, 0xff0000, 0.15);
      this.rageAura.setDepth(this.depth - 1);
      const uiCam = this.scene.cameras.getCamera('ui');
      if (uiCam) uiCam.ignore(this.rageAura);
      this.scene.tweens.add({
        targets: this.rageAura,
        scaleX: 1.3, scaleY: 1.3,
        alpha: 0.05,
        duration: 600,
        yoyo: true,
        repeat: -1
      });
    } else if (!shouldRage && this.isRaging) {
      this.isRaging = false;
      this.clearTint();
      if (this.rageAura) { this.rageAura.destroy(); this.rageAura = null; }
    }

    // Keep aura positioned on fighter
    if (this.rageAura) this.rageAura.setPosition(this.x, this.y);
  }

  takeDamage(amount: number, knockbackX: number, knockbackY?: number): void {
    if (this.isInvulnerable || this.isDead) return;

    this.health -= amount;

    if (this.health <= 0) {
      this.health = 0;
      this.die();
      return;
    }

    this.body.setVelocity(knockbackX, knockbackY ?? -150);

    this.state = State.HIT;
    this.attackLocked = true;
    this.comboStep = 0;
    this.comboTimer = 0;
    this.play(`${this.prefix}_hit`, true);

    this.isInvulnerable = true;
    this.setAlpha(0.6);

    this.once('animationcomplete', () => {
      this.attackLocked = false;
      this.state = State.IDLE;
    });

    this.scene.time.delayedCall(300, () => {
      this.isInvulnerable = false;
      this.setAlpha(1);
    });
  }

  die(): void {
    this.isDead = true;
    this.state = State.DEATH;
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.play(`${this.prefix}_death`, true);
    this.emit('fighter-ko', this);
  }

  reset(x: number, y: number): void {
    this.setPosition(x, y);
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(true);
    this.body.checkCollision.down = true;
    this.health = this.maxHealth;
    this.isDead = false;
    this.isInvulnerable = false;
    this.attackLocked = false;
    this.comboStep = 0;
    this.comboTimer = 0;
    this.isWallBouncing = false;
    this.isRaging = false;
    this.clearTint();
    if (this.rageAura) { this.rageAura.destroy(); this.rageAura = null; }
    this.state = State.IDLE;
    this.setAlpha(1);
    this.setActive(true);
    this.setVisible(true);
    this.play(`${this.prefix}_idle`, true);
  }
}
