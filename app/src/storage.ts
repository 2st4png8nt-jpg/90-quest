import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState } from './game';

// Everything stays on the phone. No accounts, no network.
const KEY = '90dayquest.save.v1';

export async function loadGame(): Promise<GameState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const s = raw ? JSON.parse(raw) : null;
    return s && s.version === 3 ? s : null; // older test saves are dropped
  } catch {
    return null;
  }
}

export async function saveGame(s: GameState | null): Promise<void> {
  try {
    if (s) await AsyncStorage.setItem(KEY, JSON.stringify(s));
    else await AsyncStorage.removeItem(KEY);
  } catch {
    // A failed save shouldn't crash the game; the next action tries again.
  }
}
