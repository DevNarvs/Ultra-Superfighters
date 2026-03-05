import type { CharacterData } from '../types';
import { RINA_SHADOW_ASSASSIN } from './characters/rina_shadow_assassin';
import { FIRE_BATTLEMANCER } from './characters/fire_battlemancer';
import { MORTIS_DEATH_REAPER } from './characters/mortis_death_reaper';
import { HIRO_SUN_DANCER } from './characters/hiro_sun_dancer';
import { KARASU_CRIMSON_PHANTOM } from './characters/karasu_crimson_phantom';

const CHARACTERS: Record<string, CharacterData> = {
  rina_shadow_assassin: RINA_SHADOW_ASSASSIN,
  fire_battlemancer: FIRE_BATTLEMANCER,
  mortis_death_reaper: MORTIS_DEATH_REAPER,
  hiro_sun_dancer: HIRO_SUN_DANCER,
  karasu_crimson_phantom: KARASU_CRIMSON_PHANTOM
};

export function getCharacter(id: string): CharacterData | null {
  return CHARACTERS[id] || null;
}

export function getCharacterIds(): string[] {
  return Object.keys(CHARACTERS);
}

export function getAllCharacters(): CharacterData[] {
  return Object.values(CHARACTERS);
}
