import Phaser from 'phaser';
import type { Fighter } from '../entities/Fighter';

const BAR_WIDTH = 280;
const BAR_HEIGHT = 14;

export class HealthBar {
  private scene: Phaser.Scene;
  private fighter: Fighter;
  private isP2: boolean;
  private color: number;

  private border: Phaser.GameObjects.Rectangle;
  private bg: Phaser.GameObjects.Rectangle;
  private damageFill: Phaser.GameObjects.Rectangle;
  private fill: Phaser.GameObjects.Rectangle;
  private nameLabel: Phaser.GameObjects.Text;
  private hpText: Phaser.GameObjects.Text;
  private tag: Phaser.GameObjects.Text;
  private lastHealth: number;

  constructor(scene: Phaser.Scene, fighter: Fighter, color: number) {
    this.scene = scene;
    this.fighter = fighter;
    this.isP2 = fighter.playerIndex === 1;
    this.color = color;
    this.lastHealth = fighter.health;

    const barX = this.isP2 ? 500 : 20;
    const barY = 24;

    // Border
    this.border = scene.add.rectangle(
      barX - 2, barY - 2, BAR_WIDTH + 4, BAR_HEIGHT + 4, 0x111111
    ).setOrigin(0, 0).setScrollFactor(0).setDepth(140);

    // Background
    this.bg = scene.add.rectangle(barX, barY, BAR_WIDTH, BAR_HEIGHT, 0x1a1a1a)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(141);

    // Damage trail (red, shows where health was before hit)
    this.damageFill = scene.add.rectangle(barX, barY, BAR_WIDTH, BAR_HEIGHT, 0xcc3333)
      .setOrigin(this.isP2 ? 1 : 0, 0).setScrollFactor(0).setDepth(142);
    if (this.isP2) this.damageFill.setPosition(barX + BAR_WIDTH, barY);

    // Health fill
    this.fill = scene.add.rectangle(barX, barY, BAR_WIDTH, BAR_HEIGHT, color)
      .setOrigin(this.isP2 ? 1 : 0, 0).setScrollFactor(0).setDepth(143);
    if (this.isP2) this.fill.setPosition(barX + BAR_WIDTH, barY);

    // Player name
    const colorHex = '#' + color.toString(16).padStart(6, '0');
    const nameX = this.isP2 ? barX + BAR_WIDTH : barX;
    this.nameLabel = scene.add.text(nameX, barY - 14, this.isP2 ? 'P2' : 'P1', {
      fontSize: '11px',
      color: colorHex,
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(this.isP2 ? 1 : 0, 0).setScrollFactor(0).setDepth(144);

    // HP text inside bar
    const hpX = this.isP2 ? barX + BAR_WIDTH - 4 : barX + 4;
    this.hpText = scene.add.text(hpX, barY + BAR_HEIGHT / 2, `${fighter.health}/${fighter.maxHealth}`, {
      fontSize: '9px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(this.isP2 ? 1 : 0, 0.5).setScrollFactor(0).setDepth(144);

    // Small floating tag above fighter
    this.tag = scene.add.text(0, 0, `P${fighter.playerIndex + 1}`, {
      fontSize: '7px',
      color: colorHex,
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 1).setDepth(91);
  }

  update(): void {
    const f = this.fighter;
    const pct = Math.max(0, f.health / f.maxHealth);

    // Health fill
    this.fill.width = BAR_WIDTH * pct;

    // Damage trail animation
    if (f.health < this.lastHealth) {
      const prevPct = Math.max(0, this.lastHealth / f.maxHealth);
      this.damageFill.width = BAR_WIDTH * prevPct;
      this.scene.tweens.killTweensOf(this.damageFill);
      this.scene.tweens.add({
        targets: this.damageFill,
        width: BAR_WIDTH * pct,
        delay: 200,
        duration: 400,
        ease: 'Power2'
      });
    }
    this.lastHealth = f.health;

    // Low health flash
    if (pct <= 0.25) {
      this.fill.setFillStyle(0xff4444);
    } else {
      this.fill.setFillStyle(this.color);
    }

    this.hpText.setText(`${Math.max(0, Math.ceil(f.health))}/${f.maxHealth}`);

    // Floating tag
    this.tag.setPosition(f.x, f.y - 35);
    this.tag.setVisible(!f.isDead);
  }

  destroy(): void {
    this.border.destroy();
    this.bg.destroy();
    this.fill.destroy();
    this.damageFill.destroy();
    this.nameLabel.destroy();
    this.hpText.destroy();
    this.tag.destroy();
  }
}
