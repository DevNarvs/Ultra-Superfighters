import Phaser from 'phaser';
import { SoundManager } from '../systems/SoundManager';

export class PauseScene extends Phaser.Scene {
  private menuItems: Phaser.GameObjects.Text[] = [];
  private selectedIndex = 0;

  constructor() {
    super({ key: 'PauseScene' });
  }

  create(): void {
    this.menuItems = [];
    this.selectedIndex = 0;

    // Overlay
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.6);

    // Panel
    this.add.rectangle(400, 300, 320, 280, 0x111122).setStrokeStyle(2, 0x333366);

    this.add.text(400, 195, 'PAUSED', {
      fontSize: '28px', color: '#ffcc00', fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    const items = [
      { label: 'RESUME', action: () => this.resumeGame() },
      { label: 'RESTART', action: () => this.restartMatch() },
      { label: 'SETTINGS', action: () => this.openSettings() },
      { label: 'QUIT TO MENU', action: () => this.quitToMenu() }
    ];

    const startY = 250;
    const spacing = 40;

    items.forEach((item, i) => {
      const text = this.add.text(400, startY + i * spacing, item.label, {
        fontSize: '16px', color: '#666666', fontFamily: 'monospace',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5);

      text.setData('action', item.action);
      this.menuItems.push(text);
    });

    this.updateSelection();

    // Controls
    this.add.text(400, 430, 'W/S navigate | F select | ESC resume', {
      fontSize: '9px', color: '#444444', fontFamily: 'monospace'
    }).setOrigin(0.5);

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-W', () => this.navigate(-1));
      this.input.keyboard.on('keydown-UP', () => this.navigate(-1));
      this.input.keyboard.on('keydown-S', () => this.navigate(1));
      this.input.keyboard.on('keydown-DOWN', () => this.navigate(1));
      this.input.keyboard.on('keydown-F', () => this.confirm());
      this.input.keyboard.on('keydown-ENTER', () => this.confirm());
      this.input.keyboard.on('keydown-ESC', (e: KeyboardEvent) => {
        e.preventDefault();
        this.resumeGame();
      });
    }
  }

  private navigate(dir: number): void {
    this.selectedIndex = Phaser.Math.Clamp(
      this.selectedIndex + dir, 0, this.menuItems.length - 1
    );
    this.updateSelection();
    SoundManager.getInstance().playMenuSelect();
  }

  private confirm(): void {
    const action = this.menuItems[this.selectedIndex].getData('action') as () => void;
    SoundManager.getInstance().playMenuConfirm();
    action();
  }

  private updateSelection(): void {
    this.menuItems.forEach((item, i) => {
      item.setStyle({
        color: i === this.selectedIndex ? '#ff6b35' : '#666666',
        fontSize: '16px', fontFamily: 'monospace', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 2
      });
    });
  }

  private resumeGame(): void {
    this.scene.resume('BattleScene');
    this.scene.stop();
  }

  private restartMatch(): void {
    this.scene.stop();
    const battleScene = this.scene.get('BattleScene') as any;
    const data = battleScene?.sceneData || {};
    this.scene.stop('BattleScene');
    this.scene.start('BattleScene', data);
  }

  private openSettings(): void {
    this.scene.launch('SettingsScene');
    this.scene.pause();
  }

  private quitToMenu(): void {
    SoundManager.getInstance().stopMusic();
    this.scene.stop('BattleScene');
    this.scene.stop();
    this.scene.start('MainMenuScene');
  }
}
