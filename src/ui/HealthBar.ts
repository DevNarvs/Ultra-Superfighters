import Phaser from 'phaser';
import type { Fighter } from '../entities/Fighter';

const BAR_WIDTH = 50;
const BAR_HEIGHT = 6;
const BAR_OFFSET_Y = -40;
const BG_COLOR = 0x333333;
const FILL_COLOR = 0x44ff44;
const LOW_HEALTH_COLOR = 0xff4444;
const LOW_THRESHOLD = 0.3;

export class HealthBar {
  private scene: Phaser.Scene;
  private fighter: Fighter;
  private customColor: number | null;
  private bg: Phaser.GameObjects.Rectangle;
  private fill: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, fighter: Fighter, color?: number) {
    this.scene = scene;
    this.fighter = fighter;
    this.customColor = color ?? null;

    this.bg = scene.add.rectangle(0, 0, BAR_WIDTH, BAR_HEIGHT, BG_COLOR);
    this.bg.setOrigin(0.5, 0.5).setDepth(90);

    this.fill = scene.add.rectangle(0, 0, BAR_WIDTH, BAR_HEIGHT, this.customColor || FILL_COLOR);
    this.fill.setOrigin(0, 0.5).setDepth(91);

    this.label = scene.add.text(0, 0, `P${fighter.playerIndex + 1}`, {
      fontSize: '8px',
      color: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 1).setDepth(91);
  }

  update(): void {
    const f = this.fighter;
    const x = f.x;
    const y = f.y + BAR_OFFSET_Y;

    this.bg.setPosition(x, y);
    this.fill.setPosition(x - BAR_WIDTH / 2, y);

    const pct = Math.max(0, f.health / f.maxHealth);
    this.fill.width = BAR_WIDTH * pct;

    const color = this.customColor || (pct <= LOW_THRESHOLD ? LOW_HEALTH_COLOR : FILL_COLOR);
    this.fill.setFillStyle(color);

    this.label.setPosition(x, y - BAR_HEIGHT / 2 - 2);

    const visible = !f.isDead;
    this.bg.setVisible(visible);
    this.fill.setVisible(visible);
    this.label.setVisible(visible);
  }

  destroy(): void {
    this.bg.destroy();
    this.fill.destroy();
    this.label.destroy();
  }
}
