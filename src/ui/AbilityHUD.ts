import Phaser from 'phaser';
import type { AbilitySystem } from '../systems/AbilitySystem';
import type { Fighter } from '../entities/Fighter';

const SLOT_W = 44;
const SLOT_H = 8;
const ULT_W = 80;
const ULT_H = 10;
const GAP = 4;

interface AbilitySlot {
  border: Phaser.GameObjects.Rectangle;
  bg: Phaser.GameObjects.Rectangle;
  fill: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  maxWidth: number;
}

interface PlayerHUD {
  playerIndex: number;
  primary: AbilitySlot;
  secondary: AbilitySlot;
  dodge: AbilitySlot;
  ult: AbilitySlot;
}

export class AbilityHUD {
  private scene: Phaser.Scene;
  private abilitySystem: AbilitySystem;
  private fighters: Fighter[];
  private huds: PlayerHUD[];

  constructor(scene: Phaser.Scene, abilitySystem: AbilitySystem, fighters: Fighter[]) {
    this.scene = scene;
    this.abilitySystem = abilitySystem;
    this.fighters = fighters;
    this.huds = [];
    this.createHUD();
  }

  private createSlot(x: number, y: number, w: number, h: number, label: string, color: number): AbilitySlot {
    const border = this.scene.add.rectangle(x - 1, y - 1, w + 2, h + 2, 0x111111)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(140);
    const bg = this.scene.add.rectangle(x, y, w, h, 0x1a1a1a)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(141);
    const fill = this.scene.add.rectangle(x, y, w, h, color)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(142);
    const labelText = this.scene.add.text(x + w / 2, y - 2, label, {
      fontSize: '7px',
      color: '#cccccc',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(143);

    return { border, bg, fill, label: labelText, maxWidth: w };
  }

  private createHUD(): void {
    for (let i = 0; i < this.fighters.length; i++) {
      const baseX = i === 0 ? 20 : 555;
      const y = 575;

      const primary = this.createSlot(baseX, y, SLOT_W, SLOT_H, 'Q', 0x44aaff);
      const secondary = this.createSlot(baseX + SLOT_W + GAP, y, SLOT_W, SLOT_H, 'E', 0x44ff88);
      const dodge = this.createSlot(baseX + (SLOT_W + GAP) * 2, y, SLOT_W, SLOT_H, 'SPC', 0xaa88ff);
      const ultX = baseX + (SLOT_W + GAP) * 3 + 6;
      const ult = this.createSlot(ultX, y - 1, ULT_W, ULT_H, 'ULT', 0xffcc00);

      this.huds.push({ playerIndex: i, primary, secondary, dodge, ult });
    }
  }

  update(): void {
    for (const hud of this.huds) {
      const state = this.abilitySystem.getState(hud.playerIndex);
      if (!state) continue;

      const abilities = this.fighters[hud.playerIndex].charData.abilities;

      this.updateSlot(hud.primary, state.primaryCooldown, abilities.primary.cooldown, 0x44aaff);
      this.updateSlot(hud.secondary, state.secondaryCooldown, abilities.secondary.cooldown, 0x44ff88);
      this.updateSlot(hud.dodge, state.dodgeCooldown, abilities.dodge.cooldown, 0xaa88ff);

      // Ultimate charge
      const ultPct = Math.min(100, state.ultimateCharge) / 100;
      hud.ult.fill.width = ULT_W * ultPct;
      if (ultPct >= 1) {
        hud.ult.fill.setFillStyle(0xffcc00);
        hud.ult.label.setStyle({ color: '#ffcc00' });
      } else {
        hud.ult.fill.setFillStyle(0x666633);
        hud.ult.label.setStyle({ color: '#aaaaaa' });
      }
    }
  }

  getUIObjects(): Phaser.GameObjects.GameObject[] {
    const objs: Phaser.GameObjects.GameObject[] = [];
    for (const hud of this.huds) {
      for (const slot of [hud.primary, hud.secondary, hud.dodge, hud.ult]) {
        objs.push(slot.border, slot.bg, slot.fill, slot.label);
      }
    }
    return objs;
  }

  private updateSlot(slot: AbilitySlot, remaining: number, maxCooldown: number, readyColor: number): void {
    if (remaining > 0) {
      const pct = 1 - (remaining / maxCooldown);
      slot.fill.width = slot.maxWidth * pct;
      slot.fill.setFillStyle(0x444444);
      slot.label.setStyle({ color: '#666666' });
    } else {
      slot.fill.width = slot.maxWidth;
      slot.fill.setFillStyle(readyColor);
      slot.label.setStyle({ color: '#ffffff' });
    }
  }
}
