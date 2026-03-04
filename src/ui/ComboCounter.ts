import Phaser from 'phaser';
import { EventBus, Events } from '../systems/EventBus';

interface ComboDisplay {
  text: Phaser.GameObjects.Text;
  tween: Phaser.Tweens.Tween | null;
}

const COMBO_LABELS: [number, string][] = [
  [10, 'UNSTOPPABLE!'],
  [8, 'SAVAGE!'],
  [5, 'BRUTAL!'],
  [3, 'TRIPLE!'],
  [2, ''],
];

const COMBO_COLORS: [number, string][] = [
  [10, '#ff00ff'],
  [8, '#ff4444'],
  [5, '#ff8800'],
  [3, '#ffcc00'],
  [2, '#ffffff'],
];

export class ComboCounter {
  private scene: Phaser.Scene;
  private displays: Map<number, ComboDisplay>;

  constructor(scene: Phaser.Scene, playerCount: number) {
    this.scene = scene;
    this.displays = new Map();

    // Pre-create text objects for camera registration
    const positions = [160, 640];
    for (let i = 0; i < playerCount; i++) {
      const text = scene.add.text(positions[i] || 400, 80, '', {
        fontSize: '24px', color: '#ffffff', fontFamily: 'monospace',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
      }).setOrigin(0.5).setScrollFactor(0).setDepth(180).setAlpha(0);
      this.displays.set(i, { text, tween: null });
    }

    EventBus.on(Events.COMBO_HIT, this.onComboHit, this);
    EventBus.on(Events.COMBO_RESET, this.onComboReset, this);
  }

  private onComboHit(data: { attackerIndex: number; comboCount: number; totalDamage: number }): void {
    const { attackerIndex, comboCount, totalDamage } = data;
    const display = this.displays.get(attackerIndex);
    if (!display) return;

    // Find label
    let label = `${comboCount} HIT!`;
    for (const [threshold, lbl] of COMBO_LABELS) {
      if (comboCount >= threshold) {
        label = lbl ? `${comboCount} HIT ${lbl}` : `${comboCount} HIT!`;
        break;
      }
    }

    // Find color
    let color = '#ffffff';
    for (const [threshold, clr] of COMBO_COLORS) {
      if (comboCount >= threshold) { color = clr; break; }
    }

    const fontSize = Math.min(16 + comboCount * 2, 36);

    display.text.setText(`${label}\n${totalDamage} DMG`);
    display.text.setStyle({
      fontSize: `${fontSize}px`, color, fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    });
    display.text.setAlpha(1).setScale(1.3);

    if (display.tween) display.tween.stop();
    display.tween = this.scene.tweens.add({
      targets: display.text,
      scaleX: 1, scaleY: 1,
      duration: 150, ease: 'Back.easeOut'
    });
  }

  private onComboReset(_data: { targetIndex: number }): void {
    // Fade out all combo displays
    for (const [, display] of this.displays) {
      if (display.text.alpha > 0) {
        if (display.tween) display.tween.stop();
        this.scene.tweens.add({
          targets: display.text,
          alpha: 0,
          duration: 400,
          ease: 'Power2'
        });
      }
    }
  }

  getUIObjects(): Phaser.GameObjects.GameObject[] {
    const objs: Phaser.GameObjects.GameObject[] = [];
    for (const [, d] of this.displays) objs.push(d.text);
    return objs;
  }

  destroy(): void {
    EventBus.off(Events.COMBO_HIT, this.onComboHit, this);
    EventBus.off(Events.COMBO_RESET, this.onComboReset, this);
    for (const [, d] of this.displays) d.text.destroy();
  }
}
