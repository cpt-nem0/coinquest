import { create } from 'zustand';
import { Transaction, WorthRating } from './domain/types';
import { parseAll } from './domain/parser';
import { SAMPLE_MESSAGES } from './domain/sampleData';
import { initDb, getAllTransactions, saveTransactions, updateTransaction, getKV, setKV } from './db';

export const REVIEW_REWARD_COINS = 20;

interface Player {
  level: number;
  xp: number;
  xpNext: number;
  coins: number;
  streak: number;
}

const DEFAULT_PLAYER: Player = { level: 12, xp: 2400, xpNext: 3000, coins: 1250, streak: 14 };

function seedTransactions(): Transaction[] {
  return parseAll(SAMPLE_MESSAGES).sort((a, b) => b.ts - a.ts);
}

interface AppState {
  transactions: Transaction[];
  budgetMinor: number;
  currency: string;
  player: Player;
  hydrated: boolean;
  /** Load from SQLite (seed from the sample corpus on first run). Safe on web (in-memory). */
  hydrate: () => Promise<void>;
  /** Confirm a reviewed spend: set category + worth, mark confirmed, award coins. Persists. */
  reviewTransaction: (id: string, categoryId: string, worth: WorthRating) => void;
}

export const useStore = create<AppState>((set, get) => ({
  transactions: [],
  budgetMinor: 5000000, // ₹50,000
  currency: 'INR',
  player: DEFAULT_PLAYER,
  hydrated: false,

  hydrate: async () => {
    try {
      await initDb();
      let txns = await getAllTransactions();
      if (!txns.length) {
        txns = seedTransactions();
        await saveTransactions(txns);
      }
      const coins = await getKV('coins');
      set((s) => ({
        transactions: txns,
        player: { ...s.player, coins: coins != null ? Number(coins) : s.player.coins },
        hydrated: true,
      }));
    } catch {
      // DB unavailable (e.g. web) → in-memory sample so the app still works
      set({ transactions: seedTransactions(), hydrated: true });
    }
  },

  reviewTransaction: (id, categoryId, worth) => {
    set((state) => {
      const transactions = state.transactions.map((t) =>
        t.id === id ? { ...t, categoryId, worth, status: 'confirmed' as const } : t
      );
      const player = { ...state.player, coins: state.player.coins + REVIEW_REWARD_COINS };
      // write-through (fire-and-forget; no-op on web)
      const updated = transactions.find((t) => t.id === id);
      if (updated) updateTransaction(updated);
      setKV('coins', String(player.coins));
      return { transactions, player };
    });
  },
}));
