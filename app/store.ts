import { create } from 'zustand';
import { Transaction } from './domain/types';
import { parseAll } from './domain/parser';
import { SAMPLE_MESSAGES } from './domain/sampleData';

interface Player {
  level: number;
  xp: number;
  xpNext: number;
  coins: number;
  streak: number;
}

interface AppState {
  transactions: Transaction[];
  budgetMinor: number;
  currency: string;
  player: Player;
  /** Re-parse from a set of raw messages (later: real IMAP/manual sources). */
  loadFromSample: () => void;
}

// v1 source = the sample corpus, run through the real parser. Swap for IMAP later.
const initialTxns = parseAll(SAMPLE_MESSAGES).sort((a, b) => b.ts - a.ts);

export const useStore = create<AppState>((set) => ({
  transactions: initialTxns,
  budgetMinor: 5000000, // ₹50,000
  currency: 'INR',
  player: { level: 12, xp: 2400, xpNext: 3000, coins: 1250, streak: 14 },
  loadFromSample: () => set({ transactions: parseAll(SAMPLE_MESSAGES).sort((a, b) => b.ts - a.ts) }),
}));
