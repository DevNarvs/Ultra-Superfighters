import Phaser from 'phaser';

// ─── Character Data ───

export interface AttackData {
  name: string;
  damage: number;
  range: number;
  knockback: number;
  comboWindow: number;
  startup: number;
  active: number;
  recovery: number;
}

export interface ProjectileAbility {
  name: string;
  type: 'projectile';
  damage: number;
  speed: number;
  cooldown: number;
  knockback: number;
  size: { width: number; height: number };
}

export interface ShieldAbility {
  name: string;
  type: 'shield';
  duration: number;
  absorb: number;
  cooldown: number;
}

export interface WaveAbility {
  name: string;
  type: 'wave';
  damage: number;
  knockback: number;
  startup: number;
  chargeRate: {
    dealDamage: number;
    takeDamage: number;
    passive: number;
  };
}

export interface DodgeAbility {
  name: string;
  duration: number;
  cooldown: number;
}

export interface AbilityConfig {
  primary: ProjectileAbility;
  secondary: ShieldAbility;
  ultimate: WaveAbility;
  dodge: DodgeAbility;
}

export interface CharacterData {
  id: string;
  name: string;
  texture: string;
  element: string;
  health: number;
  moveSpeed: number;
  jumpForce: number;
  gravity: number;
  attacks: AttackData[];
  abilities: AbilityConfig;
}

// ─── Arena Data ───

export interface PlatformData {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
}

export interface SpawnPoint {
  x: number;
  y: number;
}

export interface ArenaData {
  id: string;
  name: string;
  backgroundColor: string;
  bounds: { x: number; y: number; width: number; height: number };
  killZone: { y: number };
  ground: PlatformData[];
  platforms: PlatformData[];
  spawnPoints: SpawnPoint[];
}

export interface Arena {
  data: ArenaData;
  groundGroup: Phaser.Physics.Arcade.StaticGroup;
  platformGroup: Phaser.Physics.Arcade.StaticGroup;
  spawnPoints: SpawnPoint[];
}

// ─── Ability State ───

export interface AbilityState {
  primaryCooldown: number;
  secondaryCooldown: number;
  dodgeCooldown: number;
  ultimateCharge: number;
  shieldActive: boolean;
  shieldHP: number;
  shieldVisual: Phaser.GameObjects.Arc | null;
}

// ─── Projectile Config ───

export interface ProjectileConfig {
  damage: number;
  speed: number;
  knockback: number;
  direction: number;
  ownerIndex: number;
  lifespan?: number;
  passThrough?: boolean;
  size?: { width: number; height: number };
}
