import type { CharacterData } from '../types';
import { RINA_SHADOW_ASSASSIN } from './characters/rina_shadow_assassin';

const CHARACTERS: Record<string, CharacterData> = {
  rina_shadow_assassin: RINA_SHADOW_ASSASSIN
};

export function getCharacter(id: string): CharacterData | null {
  return CHARACTERS[id] || null;
}

export function getCharacterIds(): string[] {
  return Object.keys(CHARACTERS);
}
