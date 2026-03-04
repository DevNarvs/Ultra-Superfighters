import Phaser from 'phaser';
import { getAllCharacters } from '../data/characters';
import { createFighterAnimations } from '../systems/AnimationManager';
import type { CharacterData } from '../types';

export class CharacterSelectScene extends Phaser.Scene {
  private characters: CharacterData[] = [];
  private p1Index = 0;
  private p1Confirmed = false;
  private p2Index = 1;
  private p2Confirmed = false;

  private p1Cursor!: Phaser.GameObjects.Rectangle;
  private p1Preview!: Phaser.GameObjects.Sprite;
  private p2Preview!: Phaser.GameObjects.Sprite;
  private p1NameText!: Phaser.GameObjects.Text;
  private p2NameText!: Phaser.GameObjects.Text;
  private p1StatsText!: Phaser.GameObjects.Text;
  private p2StatsText!: Phaser.GameObjects.Text;
  private p1ReadyText!: Phaser.GameObjects.Text;
  private p2ReadyText!: Phaser.GameObjects.Text;
  private cardPositions: number[] = [];

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create(): void {
    this.p1Confirmed = false;
    this.p2Confirmed = false;

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
    const cardWidth = 180;
    const startX = 400 - ((this.characters.length - 1) * cardWidth) / 2;
    this.cardPositions = [];

    for (let i = 0; i < this.characters.length; i++) {
      const char = this.characters[i];
      const x = startX + i * cardWidth;
      this.cardPositions.push(x);

      // Card background
      this.add.rectangle(x, 180, 150, 160, 0x1a1a33)
        .setStrokeStyle(2, 0x333366);

      // Preview sprite (idle animation)
      const preview = this.add.sprite(x, 165, char.texture);
      preview.setScale(0.6);
      preview.play(`${char.texture}_idle`);

      // Name
      const shortName = char.name.split('—')[0].trim();
      this.add.text(x, 245, shortName, {
        fontSize: '11px', color: '#ffffff', fontFamily: 'monospace',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5);

      // Element tag
      const elemColors: Record<string, string> = { shadow: '#aa66ff', fire: '#ff6633' };
      this.add.text(x, 260, char.element.toUpperCase(), {
        fontSize: '8px', color: elemColors[char.element] || '#aaaaaa', fontFamily: 'monospace'
      }).setOrigin(0.5);
    }

    // P1 cursor (orange border)
    this.p1Cursor = this.add.rectangle(this.cardPositions[0], 180, 158, 168, 0x000000, 0)
      .setStrokeStyle(3, 0xff6b35);

    // VS text
    this.add.text(400, 360, 'VS', {
      fontSize: '36px', color: '#555555', fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    // P1 large preview (left side)
    const p1Char = this.characters[this.p1Index];
    this.p1Preview = this.add.sprite(160, 430, p1Char.texture).setScale(1.2);
    this.p1Preview.play(`${p1Char.texture}_idle`);

    this.add.text(160, 310, 'P1', {
      fontSize: '16px', color: '#ff6b35', fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    this.p1NameText = this.add.text(160, 510, p1Char.name, {
      fontSize: '10px', color: '#ff6b35', fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5);

    this.p1StatsText = this.add.text(160, 530, this.getStatsString(p1Char), {
      fontSize: '9px', color: '#cccccc', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 1
    }).setOrigin(0.5);

    this.p1ReadyText = this.add.text(160, 555, '', {
      fontSize: '14px', color: '#44ff44', fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // P2 large preview (right side)
    const p2Char = this.characters[this.p2Index];
    this.p2Preview = this.add.sprite(640, 430, p2Char.texture).setScale(1.2).setFlipX(true);
    this.p2Preview.play(`${p2Char.texture}_idle`);

    this.add.text(640, 310, 'P2 (AI)', {
      fontSize: '16px', color: '#35b5ff', fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    this.p2NameText = this.add.text(640, 510, p2Char.name, {
      fontSize: '10px', color: '#35b5ff', fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5);

    this.p2StatsText = this.add.text(640, 530, this.getStatsString(p2Char), {
      fontSize: '9px', color: '#cccccc', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 1
    }).setOrigin(0.5);

    this.p2ReadyText = this.add.text(640, 555, '', {
      fontSize: '14px', color: '#44ff44', fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Instructions
    this.add.text(400, 585, 'A/D select  |  F confirm  |  AI auto-picks P2', {
      fontSize: '9px', color: '#555555', fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Input handlers
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-A', () => this.moveCursor(-1));
      this.input.keyboard.on('keydown-D', () => this.moveCursor(1));
      this.input.keyboard.on('keydown-F', () => this.confirmP1());
    }

    // Auto-confirm P2 after short delay
    this.time.delayedCall(800, () => {
      this.p2Confirmed = true;
      this.p2ReadyText.setText('READY!');
      this.checkBothReady();
    });
  }

  private getStatsString(char: CharacterData): string {
    return `HP:${char.health}  SPD:${char.moveSpeed}  ATK:${char.attacks[0].damage}-${char.attacks[2].damage}`;
  }

  private moveCursor(dir: number): void {
    if (this.p1Confirmed) return;
    this.p1Index = Phaser.Math.Clamp(this.p1Index + dir, 0, this.characters.length - 1);
    this.updateP1Display();
  }

  private updateP1Display(): void {
    const char = this.characters[this.p1Index];
    this.p1Cursor.setPosition(this.cardPositions[this.p1Index], 180);
    this.p1Preview.setTexture(char.texture);
    this.p1Preview.play(`${char.texture}_idle`);
    this.p1NameText.setText(char.name);
    this.p1StatsText.setText(this.getStatsString(char));
  }

  private confirmP1(): void {
    if (this.p1Confirmed) return;
    this.p1Confirmed = true;
    this.p1ReadyText.setText('READY!');

    // Flash effect on confirm
    this.p1Cursor.setStrokeStyle(4, 0x44ff44);
    this.tweens.add({
      targets: this.p1Preview,
      scaleX: 1.3, scaleY: 1.3,
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
          p2Character: this.characters[this.p2Index].id
        });
      });
    }
  }
}
