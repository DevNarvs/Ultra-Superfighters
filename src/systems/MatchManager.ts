import { EventBus, Events } from './EventBus';
import { ArenaFactory } from '../arenas/ArenaFactory';
import type { Fighter } from '../entities/Fighter';
import type { Arena } from '../types';

export enum MatchState {
  WAITING = 'waiting',
  COUNTDOWN = 'countdown',
  FIGHTING = 'fighting',
  ROUND_END = 'round_end',
  MATCH_END = 'match_end'
}

interface MatchOptions {
  roundsToWin?: number;
  countdownSeconds?: number;
  roundEndDelay?: number;
}

export class MatchManager {
  private scene: Phaser.Scene;
  private fighters: Fighter[];
  private arena: Arena;
  private roundsToWin: number;
  private countdownSeconds: number;
  private roundEndDelay: number;

  public state: MatchState;
  public currentRound: number;
  private scores: Record<number, number>;

  constructor(scene: Phaser.Scene, fighters: Fighter[], arena: Arena, options: MatchOptions = {}) {
    this.scene = scene;
    this.fighters = fighters;
    this.arena = arena;

    this.roundsToWin = options.roundsToWin || 3;
    this.countdownSeconds = options.countdownSeconds || 3;
    this.roundEndDelay = options.roundEndDelay || 2000;

    this.state = MatchState.WAITING;
    this.currentRound = 0;
    this.scores = {};

    for (const f of fighters) {
      this.scores[f.playerIndex] = 0;
    }
  }

  start(): void {
    this.currentRound = 0;
    for (const key of Object.keys(this.scores)) {
      this.scores[Number(key)] = 0;
    }
    this.startRound();
  }

  private startRound(): void {
    this.currentRound++;
    this.state = MatchState.COUNTDOWN;

    for (let i = 0; i < this.fighters.length; i++) {
      const spawn = ArenaFactory.getSpawnPoint(this.arena, i);
      this.fighters[i].reset(spawn.x, spawn.y);
      this.fighters[i].inputMgr.disable();
    }

    EventBus.emit(Events.ROUND_START, { round: this.currentRound });

    let count = this.countdownSeconds;
    EventBus.emit(Events.COUNTDOWN_TICK, { count });

    this.scene.time.addEvent({
      delay: 1000,
      repeat: this.countdownSeconds - 1,
      callback: () => {
        count--;
        if (count > 0) {
          EventBus.emit(Events.COUNTDOWN_TICK, { count });
        } else {
          this.state = MatchState.FIGHTING;
          EventBus.emit(Events.FIGHT);
          for (const f of this.fighters) {
            f.inputMgr.enable();
          }
        }
      }
    });
  }

  update(_time: number, _delta: number): void {
    if (this.state !== MatchState.FIGHTING) return;

    const alive = this.fighters.filter(f => !f.isDead);

    if (alive.length <= 1) {
      this.endRound(alive[0] || null);
    }
  }

  private endRound(winner: Fighter | null): void {
    this.state = MatchState.ROUND_END;

    for (const f of this.fighters) {
      f.inputMgr.disable();
    }

    if (winner) {
      this.scores[winner.playerIndex]++;
    }

    EventBus.emit(Events.ROUND_END, {
      round: this.currentRound,
      winner: winner ? winner.playerIndex : null,
      scores: { ...this.scores }
    });

    const matchWinner = this.checkMatchWinner();
    if (matchWinner !== null) {
      this.scene.time.delayedCall(this.roundEndDelay, () => {
        this.state = MatchState.MATCH_END;
        EventBus.emit(Events.MATCH_END, {
          winner: matchWinner,
          scores: { ...this.scores }
        });
      });
    } else {
      this.scene.time.delayedCall(this.roundEndDelay, () => {
        this.startRound();
      });
    }
  }

  private checkMatchWinner(): number | null {
    for (const [idx, wins] of Object.entries(this.scores)) {
      if (wins >= this.roundsToWin) {
        return parseInt(idx);
      }
    }
    return null;
  }

  getScores(): Record<number, number> {
    return { ...this.scores };
  }
}
