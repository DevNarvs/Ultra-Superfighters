import Phaser from 'phaser';

export const EventBus = new Phaser.Events.EventEmitter();

export const Events = {
  PLAYER_HIT: 'playerHit',
  PLAYER_KO: 'playerKO',
  ROUND_START: 'roundStart',
  ROUND_END: 'roundEnd',
  MATCH_END: 'matchEnd',
  COUNTDOWN_TICK: 'countdownTick',
  FIGHT: 'fight',
  ABILITY_USED: 'abilityUsed',
  ULTIMATE_READY: 'ultimateReady',
  HIT_LANDED: 'hitLanded',
  COMBO_HIT: 'comboHit',
  COMBO_RESET: 'comboReset'
} as const;
