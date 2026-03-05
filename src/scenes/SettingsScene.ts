import Phaser from 'phaser';
import { SoundManager } from '../systems/SoundManager';

export class SettingsScene extends Phaser.Scene {
  private items: { label: Phaser.GameObjects.Text; value: Phaser.GameObjects.Text; adjust: (dir: number) => void }[] = [];
  private selectedIndex = 0;

  constructor() {
    super({ key: 'SettingsScene' });
  }

  create(): void {
    this.items = [];
    this.selectedIndex = 0;

    // Semi-transparent overlay
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

    // Panel
    this.add.rectangle(400, 300, 400, 320, 0x111122).setStrokeStyle(2, 0x333366);

    this.add.text(400, 165, 'SETTINGS', {
      fontSize: '22px', color: '#ffcc00', fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    const sound = SoundManager.getInstance();
    const startY = 220;
    const spacing = 50;

    // SFX Volume
    this.addSlider('SFX VOLUME', startY, () => Math.round(sound.sfxVolume * 100) + '%', (dir) => {
      sound.sfxVolume = sound.sfxVolume + dir * 0.1;
    });

    // Music Volume
    this.addSlider('MUSIC VOLUME', startY + spacing, () => Math.round(sound.musicVolume * 100) + '%', (dir) => {
      sound.musicVolume = sound.musicVolume + dir * 0.1;
    });

    // Mute
    this.addSlider('MUTE', startY + spacing * 2, () => sound.muted ? 'ON' : 'OFF', () => {
      sound.toggleMute();
    });

    // Back option
    const backLabel = this.add.text(300, startY + spacing * 3, 'BACK', {
      fontSize: '16px', color: '#666666', fontFamily: 'monospace', fontStyle: 'bold'
    });
    const backValue = this.add.text(500, startY + spacing * 3, '', {
      fontSize: '14px', color: '#aaaaaa', fontFamily: 'monospace'
    });
    this.items.push({
      label: backLabel,
      value: backValue,
      adjust: () => this.goBack()
    });

    this.updateSelection();

    // Controls
    this.add.text(400, 440, 'W/S navigate | A/D adjust | F/ESC back', {
      fontSize: '9px', color: '#555555', fontFamily: 'monospace'
    }).setOrigin(0.5);

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-W', () => this.nav(-1));
      this.input.keyboard.on('keydown-UP', () => this.nav(-1));
      this.input.keyboard.on('keydown-S', () => this.nav(1));
      this.input.keyboard.on('keydown-DOWN', () => this.nav(1));
      this.input.keyboard.on('keydown-A', () => this.adjust(-1));
      this.input.keyboard.on('keydown-LEFT', () => this.adjust(-1));
      this.input.keyboard.on('keydown-D', () => this.adjust(1));
      this.input.keyboard.on('keydown-RIGHT', () => this.adjust(1));
      this.input.keyboard.on('keydown-F', () => this.confirmOrBack());
      this.input.keyboard.on('keydown-ENTER', () => this.confirmOrBack());
      this.input.keyboard.on('keydown-ESC', (e: KeyboardEvent) => {
        e.preventDefault();
        this.goBack();
      });
    }
  }

  private addSlider(name: string, y: number, getValue: () => string, onAdjust: (dir: number) => void): void {
    const label = this.add.text(300, y, name, {
      fontSize: '14px', color: '#666666', fontFamily: 'monospace', fontStyle: 'bold'
    });
    const value = this.add.text(500, y, getValue(), {
      fontSize: '14px', color: '#aaaaaa', fontFamily: 'monospace'
    });
    this.items.push({
      label, value,
      adjust: (dir: number) => {
        onAdjust(dir);
        value.setText(getValue());
      }
    });
  }

  private nav(dir: number): void {
    this.selectedIndex = Phaser.Math.Clamp(this.selectedIndex + dir, 0, this.items.length - 1);
    this.updateSelection();
    SoundManager.getInstance().playMenuSelect();
  }

  private adjust(dir: number): void {
    this.items[this.selectedIndex].adjust(dir);
    SoundManager.getInstance().playMenuSelect();
  }

  private confirmOrBack(): void {
    if (this.selectedIndex === this.items.length - 1) {
      this.goBack();
    } else {
      this.adjust(1);
    }
  }

  private updateSelection(): void {
    this.items.forEach((item, i) => {
      item.label.setStyle({
        color: i === this.selectedIndex ? '#ff6b35' : '#666666',
        fontSize: '14px', fontFamily: 'monospace', fontStyle: 'bold'
      });
    });
  }

  private goBack(): void {
    SoundManager.getInstance().playMenuBack();
    this.scene.resume(this.scene.manager.getScenes(true).find(
      s => s.scene.key === 'MainMenuScene' || s.scene.key === 'BattleScene'
    )?.scene.key || 'MainMenuScene');
    this.scene.stop();
  }
}
