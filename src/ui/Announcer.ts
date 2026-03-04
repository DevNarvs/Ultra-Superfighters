import Phaser from 'phaser';
import { EventBus, Events } from '../systems/EventBus';

interface RoundStartData { round: number; }
interface CountdownData { count: number; }
interface RoundEndData { round: number; winner: number | null; scores: Record<number, number>; }
interface MatchEndData { winner: number; scores: Record<number, number>; }

export class Announcer {
  private scene: Phaser.Scene;
  private mainText: Phaser.GameObjects.Text;
  private subText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.mainText = scene.add.text(
      scene.scale.width / 2,
      scene.scale.height / 2 - 40,
      '',
      {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    this.subText = scene.add.text(
      scene.scale.width / 2,
      scene.scale.height / 2 + 20,
      '',
      {
        fontSize: '20px',
        color: '#cccccc',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    EventBus.on(Events.ROUND_START, this.onRoundStart, this);
    EventBus.on(Events.COUNTDOWN_TICK, this.onCountdownTick, this);
    EventBus.on(Events.FIGHT, this.onFight, this);
    EventBus.on(Events.ROUND_END, this.onRoundEnd, this);
    EventBus.on(Events.MATCH_END, this.onMatchEnd, this);
  }

  private show(text: string, subtext = '', duration = 1500, color = '#ffffff'): void {
    this.mainText.setText(text);
    this.mainText.setStyle({
      color, fontSize: '48px', fontFamily: 'monospace', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    });
    this.mainText.setAlpha(1).setScale(0.5);

    this.scene.tweens.add({
      targets: this.mainText,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    if (subtext) {
      this.subText.setText(subtext);
      this.subText.setAlpha(1);
    } else {
      this.subText.setAlpha(0);
    }

    this.scene.time.delayedCall(duration, () => {
      this.scene.tweens.add({
        targets: [this.mainText, this.subText],
        alpha: 0,
        duration: 300
      });
    });
  }

  private onRoundStart(data: RoundStartData): void {
    this.show(`ROUND ${data.round}`, '', 1500, '#ffcc00');
  }

  private onCountdownTick(data: CountdownData): void {
    this.show(`${data.count}`, '', 800, '#ffffff');
  }

  private onFight(): void {
    this.show('FIGHT!', '', 1000, '#ff6b35');
  }

  private onRoundEnd(data: RoundEndData): void {
    const playerColors = ['#ff6b35', '#35b5ff', '#44ff44', '#ffcc00'];
    if (data.winner !== null) {
      const color = playerColors[data.winner] || '#ffffff';
      this.show(`P${data.winner + 1} WINS!`, `Round ${data.round}`, 2000, color);
    } else {
      this.show('DRAW', `Round ${data.round}`, 2000, '#888888');
    }
  }

  private onMatchEnd(data: MatchEndData): void {
    const playerColors = ['#ff6b35', '#35b5ff', '#44ff44', '#ffcc00'];
    const color = playerColors[data.winner] || '#ffffff';
    this.show(`P${data.winner + 1} WINS THE MATCH!`, 'Press F5 to restart', 5000, color);
  }

  getUIObjects(): Phaser.GameObjects.GameObject[] {
    return [this.mainText, this.subText];
  }

  destroy(): void {
    EventBus.off(Events.ROUND_START, this.onRoundStart, this);
    EventBus.off(Events.COUNTDOWN_TICK, this.onCountdownTick, this);
    EventBus.off(Events.FIGHT, this.onFight, this);
    EventBus.off(Events.ROUND_END, this.onRoundEnd, this);
    EventBus.off(Events.MATCH_END, this.onMatchEnd, this);
    this.mainText.destroy();
    this.subText.destroy();
  }
}
