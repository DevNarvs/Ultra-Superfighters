import Phaser from 'phaser';
import type { AbilitySystem } from '../systems/AbilitySystem';
import type { Fighter } from '../entities/Fighter';

interface HUDElement {
  playerIndex: number;
  label: Phaser.GameObjects.Text;
  qText: Phaser.GameObjects.Text;
  eText: Phaser.GameObjects.Text;
  dodgeText: Phaser.GameObjects.Text;
  ultBg: Phaser.GameObjects.Rectangle;
  ultFill: Phaser.GameObjects.Rectangle;
  ultLabel: Phaser.GameObjects.Text;
}

export class AbilityHUD {
  private scene: Phaser.Scene;
  private abilitySystem: AbilitySystem;
  private fighters: Fighter[];
  private elements: HUDElement[];

  constructor(scene: Phaser.Scene, abilitySystem: AbilitySystem, fighters: Fighter[]) {
    this.scene = scene;
    this.abilitySystem = abilitySystem;
    this.fighters = fighters;
    this.elements = [];
    this.createHUD();
  }

  private createHUD(): void {
    const colors = ['#ff6b35', '#35b5ff'];

    for (let i = 0; i < this.fighters.length; i++) {
      const x = i === 0 ? 10 : 550;
      const y = 560;
      const color = colors[i];

      const label = this.scene.add.text(x, y, `P${i + 1}`, {
        fontSize: '11px', color, fontFamily: 'monospace', fontStyle: 'bold'
      }).setScrollFactor(0).setDepth(100);

      const qText = this.scene.add.text(x + 30, y, '[Q] Fireball', {
        fontSize: '9px', color: '#aaaaaa', fontFamily: 'monospace'
      }).setScrollFactor(0).setDepth(100);

      const eText = this.scene.add.text(x + 120, y, '[E] Shield', {
        fontSize: '9px', color: '#aaaaaa', fontFamily: 'monospace'
      }).setScrollFactor(0).setDepth(100);

      const dodgeText = this.scene.add.text(x + 30, y + 14, '[Spc] Dodge', {
        fontSize: '9px', color: '#aaaaaa', fontFamily: 'monospace'
      }).setScrollFactor(0).setDepth(100);

      const ultBg = this.scene.add.rectangle(x + 130, y + 18, 100, 8, 0x333333);
      ultBg.setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

      const ultFill = this.scene.add.rectangle(x + 130, y + 18, 0, 8, 0xffcc00);
      ultFill.setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);

      const ultLabel = this.scene.add.text(x + 130, y + 7, '[R] ULT', {
        fontSize: '9px', color: '#aaaaaa', fontFamily: 'monospace'
      }).setScrollFactor(0).setDepth(100);

      this.elements.push({ playerIndex: i, label, qText, eText, dodgeText, ultBg, ultFill, ultLabel });
    }
  }

  update(): void {
    for (const el of this.elements) {
      const state = this.abilitySystem.getState(el.playerIndex);
      if (!state) continue;

      const fighter = this.fighters[el.playerIndex];
      const abilities = fighter.charData.abilities;

      if (state.primaryCooldown > 0) {
        const secs = (state.primaryCooldown / 1000).toFixed(1);
        el.qText.setStyle({ color: '#666666' });
        el.qText.setText(`[Q] ${abilities.primary.name} ${secs}s`);
      } else {
        el.qText.setStyle({ color: '#44ff44' });
        el.qText.setText(`[Q] ${abilities.primary.name} RDY`);
      }

      if (state.secondaryCooldown > 0) {
        const secs = (state.secondaryCooldown / 1000).toFixed(1);
        el.eText.setStyle({ color: '#666666' });
        el.eText.setText(`[E] ${abilities.secondary.name} ${secs}s`);
      } else {
        el.eText.setStyle({ color: '#44ff44' });
        el.eText.setText(`[E] ${abilities.secondary.name} RDY`);
      }

      if (state.dodgeCooldown > 0) {
        const secs = (state.dodgeCooldown / 1000).toFixed(1);
        el.dodgeText.setStyle({ color: '#666666' });
        el.dodgeText.setText(`[Spc] Dodge ${secs}s`);
      } else {
        el.dodgeText.setStyle({ color: '#44ff44' });
        el.dodgeText.setText(`[Spc] Dodge RDY`);
      }

      const pct = Math.min(100, state.ultimateCharge);
      el.ultFill.width = pct;
      el.ultFill.setFillStyle(pct >= 100 ? 0xffcc00 : 0x888844);

      if (pct >= 100) {
        el.ultLabel.setStyle({ color: '#ffcc00' });
        el.ultLabel.setText('[R] ULT READY!');
      } else {
        el.ultLabel.setStyle({ color: '#aaaaaa' });
        el.ultLabel.setText(`[R] ULT ${Math.floor(pct)}%`);
      }
    }
  }
}
