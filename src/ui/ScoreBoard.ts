import Phaser from 'phaser';
import { EventBus, Events } from '../systems/EventBus';

interface ScoreBoardElement {
  label: Phaser.GameObjects.Text;
  playerIndex: number;
}

interface RoundStartData { round: number; }
interface RoundEndData { scores: Record<number, number>; }

export class ScoreBoard {
  private scene: Phaser.Scene;
  private roundsToWin: number;
  private elements: ScoreBoardElement[];
  private roundLabel: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, playerCount: number, roundsToWin: number) {
    this.scene = scene;
    this.roundsToWin = roundsToWin;
    this.elements = [];

    const colors = ['#ff6b35', '#35b5ff', '#44ff44', '#ffcc00'];
    const width = scene.scale.width;

    // Position scores below each health bar
    const scoreXs = [160, 640];
    for (let i = 0; i < playerCount; i++) {
      const x = scoreXs[i] || width / 2;
      const y = 44;

      const label = scene.add.text(x, y, `0/${roundsToWin}`, {
        fontSize: '10px',
        color: colors[i],
        fontFamily: 'monospace',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setScrollFactor(0).setDepth(150);

      this.elements.push({ label, playerIndex: i });
    }

    this.roundLabel = scene.add.text(width / 2, 16, 'ROUND 1', {
      fontSize: '10px',
      color: '#666666',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5).setScrollFactor(0).setDepth(150);

    EventBus.on(Events.ROUND_END, this.onRoundEnd, this);
    EventBus.on(Events.ROUND_START, this.onRoundStart, this);
  }

  private onRoundStart(data: RoundStartData): void {
    this.roundLabel.setText(`ROUND ${data.round}`);
  }

  private onRoundEnd(data: RoundEndData): void {
    for (const el of this.elements) {
      const wins = data.scores[el.playerIndex] || 0;
      el.label.setText(`${wins}/${this.roundsToWin}`);
    }
  }

  getUIObjects(): Phaser.GameObjects.GameObject[] {
    return [...this.elements.map(e => e.label), this.roundLabel];
  }

  destroy(): void {
    EventBus.off(Events.ROUND_END, this.onRoundEnd, this);
    EventBus.off(Events.ROUND_START, this.onRoundStart, this);
    for (const el of this.elements) {
      el.label.destroy();
    }
    this.roundLabel.destroy();
  }
}
