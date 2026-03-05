import Phaser from 'phaser';
import { SoundManager } from '../systems/SoundManager';

export class MainMenuScene extends Phaser.Scene {
  private menuItems: Phaser.GameObjects.Text[] = [];
  private selectedIndex = 0;
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    this.menuItems = [];
    this.selectedIndex = 0;
    this.cameras.main.setBackgroundColor('#0a0a1a');

    // Initialize audio context on first interaction
    const sound = SoundManager.getInstance();
    sound.startMenuMusic();

    // Title
    this.titleText = this.add.text(400, 120, 'ULTRA\nSUPERFIGHTERS', {
      fontSize: '42px',
      color: '#ff6b35',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5);

    // Pulsing title glow
    this.tweens.add({
      targets: this.titleText,
      alpha: 0.8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.subtitleText = this.add.text(400, 210, 'BATTLE OF THE BATTLEMANCERS', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Decorative line
    const line = this.add.rectangle(400, 240, 300, 2, 0x333355);
    line.setOrigin(0.5);

    // Menu items
    const items = [
      { label: 'PLAY VS AI', action: () => this.startGame('ai') },
      { label: 'LOCAL 2P', action: () => this.startGame('local') },
      { label: 'SETTINGS', action: () => this.openSettings() }
    ];

    const startY = 290;
    const spacing = 50;

    items.forEach((item, i) => {
      const text = this.add.text(400, startY + i * spacing, item.label, {
        fontSize: '22px',
        color: '#666666',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      text.setData('action', item.action);
      this.menuItems.push(text);
    });

    this.updateSelection();

    // Controls hint
    this.add.text(400, 540, 'W/S navigate  |  F select', {
      fontSize: '10px',
      color: '#444444',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(400, 560, 'M toggle mute', {
      fontSize: '9px',
      color: '#333333',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Version
    this.add.text(790, 590, 'v0.5', {
      fontSize: '8px',
      color: '#333333',
      fontFamily: 'monospace'
    }).setOrigin(1, 1);

    // Input
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-W', () => this.navigate(-1));
      this.input.keyboard.on('keydown-UP', () => this.navigate(-1));
      this.input.keyboard.on('keydown-S', () => this.navigate(1));
      this.input.keyboard.on('keydown-DOWN', () => this.navigate(1));
      this.input.keyboard.on('keydown-F', () => this.confirm());
      this.input.keyboard.on('keydown-ENTER', () => this.confirm());
      this.input.keyboard.on('keydown-M', () => {
        SoundManager.getInstance().toggleMute();
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
    const item = this.menuItems[this.selectedIndex];
    const action = item.getData('action') as () => void;
    SoundManager.getInstance().playMenuConfirm();

    // Flash selected item
    this.tweens.add({
      targets: item,
      scaleX: 1.2, scaleY: 1.2,
      duration: 100,
      yoyo: true,
      onComplete: () => action()
    });
  }

  private updateSelection(): void {
    this.menuItems.forEach((item, i) => {
      if (i === this.selectedIndex) {
        item.setStyle({ color: '#ff6b35', fontSize: '22px', fontFamily: 'monospace', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3 });
      } else {
        item.setStyle({ color: '#666666', fontSize: '22px', fontFamily: 'monospace', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3 });
      }
    });
  }

  private startGame(mode: 'ai' | 'local'): void {
    SoundManager.getInstance().stopMusic();
    this.scene.start('CharacterSelectScene', { mode });
  }

  private openSettings(): void {
    this.scene.launch('SettingsScene');
    this.scene.pause();
  }
}
