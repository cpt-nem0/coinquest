/**
 * Simple, reliable on-device persistence via AsyncStorage (works in Expo Go & web).
 * At v1 scale (dozens of transactions) a JSON blob is plenty; SQLite returns when
 * data volume / query needs grow (with the dev build).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from './domain/types';

const KEY = 'coinquest:v1';

export interface Persisted {
  transactions: Transaction[];
  coins: number;
}

export async function loadPersisted(): Promise<Persisted | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Persisted) : null;
  } catch (e) {
    console.warn('[coinquest] load failed:', e);
    return null;
  }
}

export async function savePersisted(p: Persisted): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(p));
  } catch (e) {
    console.warn('[coinquest] save failed:', e);
  }
}

export async function clearPersisted(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}
