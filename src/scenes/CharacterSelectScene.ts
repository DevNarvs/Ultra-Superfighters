import Phaser from 'phaser';
import { getAllCharacters } from '../data/characters';
import { createFighterAnimations } from '../systems/AnimationManager';
import { SoundManager } from '../systems/SoundManager';
import type { CharacterData } from '../types';

export class CharacterSelectScene extends Phaser.Scene {
  private characters: CharacterData[] = [];
  private p1Index = 0;
  private p1Confirmed = false;
  private p2Index = 1;
  private p2Confirmed = false;
  private mode: 'ai' | 'local' = 'ai';
  private aiDifficulty: string = 'opus';

  private p1Cursor!: Phaser.GameObjects.Rectangle;
  private p2Cursor!: Phaser.GameObjects.Rectangle;
  private p1Preview!: Phaser.GameObjects.Sprite;
  private p2Preview!: Phaser.GameObjects.Sprite;
  private p1NameText!: Phaser.GameObjects.Text;
  private p2NameText!: Phaser.GameObjects.Text;
  private p1StatsText!: Phaser.GameObjects.Text;
  private p2StatsText!: Phaser.GameObjects.Text;
  private p1ReadyText!: Phaser.GameObjects.Text;
  private p2ReadyText!: Phaser.GameObjects.Text;
  private p2Label!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private cardPositions: number[] = [];

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create(data: { mode?: 'ai' | 'local' }): void {
    this.p1Confirmed = false;
    this.p2Confirmed = false;
    this.mode = data?.mode || 'ai';

    this.characters = getAllCharacters();
    this.p1Index = 0;
    this.p2Index = Math.min(1, this.characters.length - 1);

    // Create animations for all characters
    for (const char of this.characters) {
      createFighterAnimations(this, char.texture);
    }

    // Background
    this.cameras.main.setBackgroundColor('#0d0d1a');

    // Title
    this.add.text(400, 35, 'SELECT YOUR FIGHTER', {
      fontSize: '24px', color: '#ffcc00', fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    // Character cards
    const cardWidth = 140;
    const startX = 400 - ((this.characters.length - 1) * cardWidth) / 2;
    this.cardPositions = [];

    for (let i = 0; i < this.characters.length; i++) {
      const char = this.characters[i];
      const x = startX + i * cardWidth;
      this.cardPositions.push(x);

      // Card background
      this.add.rectangle(x, 180, 120, 140, 0x1a1a33)
        .setStrokeStyle(2, 0x333366);

      // Preview sprite (idle animation)
      const preview = this.add.sprite(x, 168, char.texture);
      preview.setScale(0.5);
      preview.play(`${char.texture}_idle`);

      // Name
      const shortName = char.name.split('—')[0].trim();
      this.add.text(x, 235, shortName, {
        fontSize: '9px', color: '#ffffff', fontFamily: 'monospace',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5);

      // Element tag
      const elemColors: Record<string, string> = {
        shadow: '#aa66ff', fire: '#ff6633', death: '#00ffaa',
        solar: '#ffd700', hellfire: '#cc0000'
      };
      this.add.text(x, 248, char.element.toUpperCase(), {
        fontSize: '7px', color: elemColors[char.element] || '#aaaaaa', fontFamily: 'monospace'
      }).setOrigin(0.5);
    }

    // P1 cursor (orange border)
    this.p1Cursor = this.add.rectangle(this.cardPositions[0], 180, 128, 148, 0x000000, 0)
      .setStrokeStyle(3, 0xff6b35);

    // P2 cursor (blue border) - visible only in local mode
    this.p2Cursor = this.add.rectangle(this.cardPositions[this.p2Index], 180, 128, 148, 0x000000, 0)
      .setStrokeStyle(3, 0x35b5ff);
    this.p2Cursor.setVisible(this.mode === 'local');

    // VS text
    this.add.text(400, 340, 'VS', {
      fontSize: '36px', color: '#555555', fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    // P1 large preview (left side)
    const p1Char = this.characters[this.p1Index];
    this.p1Preview = this.add.sprite(160, 410, p1Char.texture).setScale(1.1);
    this.p1Preview.play(`${p1Char.texture}_idle`);

    this.add.text(160, 300, 'P1', {
      fontSize: '16px', color: '#ff6b35', fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    this.p1NameText = this.add.text(160, 480, p1Char.name, {
      fontSize: '9px', color: '#ff6b35', fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5);

    this.p1StatsText = this.add.text(160, 498, this.getStatsString(p1Char), {
      fontSize: '8px', color: '#cccccc', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 1
    }).setOrigin(0.5);

    this.p1ReadyText = this.add.text(160, 520, '', {
      fontSize: '14px', color: '#44ff44', fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // P2 large preview (right side)
    const p2Char = this.characters[this.p2Index];
    this.p2Preview = this.add.sprite(640, 410, p2Char.texture).setScale(1.1).setFlipX(true);
    this.p2Preview.play(`${p2Char.texture}_idle`);

    this.p2Label = this.add.text(640, 300, this.mode === 'local' ? 'P2' : 'P2 (AI)', {
      fontSize: '16px', color: '#35b5ff', fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    this.p2NameText = this.add.text(640, 480, p2Char.name, {
      fontSize: '9px', color: '#35b5ff', fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5);

    this.p2StatsText = this.add.text(640, 498, this.getStatsString(p2Char), {
      fontSize: '8px', color: '#cccccc', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 1
    }).setOrigin(0.5);

    this.p2ReadyText = this.add.text(640, 520, '', {
      fontSize: '14px', color: '#44ff44', fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Instructions
    if (this.mode === 'local') {
      this.instructionText = this.add.text(400, 565, 'P1: A/D + F  |  P2: Arrows + Numpad1', {
        fontSize: '9px', color: '#555555', fontFamily: 'monospace'
      }).setOrigin(0.5);
    } else {
      this.instructionText = this.add.text(400, 565, 'A/D select  |  F confirm  |  AI auto-picks P2', {
        fontSize: '9px', color: '#555555', fontFamily: 'monospace'
      }).setOrigin(0.5);
    }

    // ESC to go back
    this.add.text(400, 582, 'ESC back to menu', {
      fontSize: '8px', color: '#333333', fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Input handlers — P1
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-A', () => this.moveP1Cursor(-1));
      this.input.keyboard.on('keydown-D', () => this.moveP1Cursor(1));
      this.input.keyboard.on('keydown-F', () => this.confirmP1());

      // P2 controls (local mode) — arrow keys + numpad
      this.input.keyboard.on('keydown-LEFT', () => this.moveP2Cursor(-1));
      this.input.keyboard.on('keydown-RIGHT', () => this.moveP2Cursor(1));
      this.input.keyboard.on('keydown-NUMPAD_ONE', () => this.confirmP2());

      // ESC back to menu
      this.input.keyboard.on('keydown-ESC', (e: KeyboardEvent) => {
        e.preventDefault();
        SoundManager.getInstance().playMenuBack();
        this.scene.start('MainMenuScene');
      });
    }

    // Auto-confirm P2 in AI mode
    if (this.mode === 'ai') {
      this.time.delayedCall(800, () => {
        this.p2Confirmed = true;
        this.p2ReadyText.setText('READY!');
        this.checkBothReady();
      });
    }
  }

  private getStatsString(char: CharacterData): string {
    return `HP:${char.health}  SPD:${char.moveSpeed}  ATK:${char.attacks[0].damage}-${char.attacks[2].damage}`;
  }

  private moveP1Cursor(dir: number): void {
    if (this.p1Confirmed) return;
    this.p1Index = Phaser.Math.Clamp(this.p1Index + dir, 0, this.characters.length - 1);
    this.updateP1Display();
    SoundManager.getInstance().playMenuSelect();
  }

  private moveP2Cursor(dir: number): void {
    if (this.mode !== 'local' || this.p2Confirmed) return;
    this.p2Index = Phaser.Math.Clamp(this.p2Index + dir, 0, this.characters.length - 1);
    this.updateP2Display();
    SoundManager.getInstance().playMenuSelect();
  }

  private updateP1Display(): void {
    const char = this.characters[this.p1Index];
    this.p1Cursor.setPosition(this.cardPositions[this.p1Index], 180);
    this.p1Preview.setTexture(char.texture);
    this.p1Preview.play(`${char.texture}_idle`);
    this.p1NameText.setText(char.name);
    this.p1StatsText.setText(this.getStatsString(char));
  }

  private updateP2Display(): void {
    const char = this.characters[this.p2Index];
    this.p2Cursor.setPosition(this.cardPositions[this.p2Index], 180);
    this.p2Preview.setTexture(char.texture);
    this.p2Preview.play(`${char.texture}_idle`);
    this.p2NameText.setText(char.name);
    this.p2StatsText.setText(this.getStatsString(char));
  }

  private confirmP1(): void {
    if (this.p1Confirmed) return;
    this.p1Confirmed = true;
    this.p1ReadyText.setText('READY!');
    SoundManager.getInstance().playMenuConfirm();

    // Flash effect on confirm
    this.p1Cursor.setStrokeStyle(4, 0x44ff44);
    this.tweens.add({
      targets: this.p1Preview,
      scaleX: 1.2, scaleY: 1.2,
      duration: 150,
      yoyo: true
    });

    this.checkBothReady();
  }

  private confirmP2(): void {
    if (this.mode !== 'local' || this.p2Confirmed) return;
    this.p2Confirmed = true;
    this.p2ReadyText.setText('READY!');
    SoundManager.getInstance().playMenuConfirm();

    this.p2Cursor.setStrokeStyle(4, 0x44ff44);
    this.tweens.add({
      targets: this.p2Preview,
      scaleX: 1.2, scaleY: 1.2,
      duration: 150,
      yoyo: true
    });

    this.checkBothReady();
  }

  private checkBothReady(): void {
    if (this.p1Confirmed && this.p2Confirmed) {
      this.time.delayedCall(600, () => {
        this.scene.start('BattleScene', {
          p1Character: this.characters[this.p1Index].id,
          p2Character: this.characters[this.p2Index].id,
          mode: this.mode,
          aiDifficulty: this.aiDifficulty
        });
      });
    }
  }
}
