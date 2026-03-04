import type { CharacterData } from '../types';
import { RINA_SHADOW_ASSASSIN } from './characters/rina_shadow_assassin';
import { FIRE_BATTLEMANCER } from './characters/fire_battlemancer';

const CHARACTERS: Record<string, CharacterData> = {
  rina_shadow_assassin: RINA_SHADOW_ASSASSIN,
  fire_battlemancer: FIRE_BATTLEMANCER
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
