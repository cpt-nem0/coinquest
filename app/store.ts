import { create } from 'zustand';
import { Transaction, WorthRating } from './domain/types';
import { parseAll } from './domain/parser';
import { SAMPLE_MESSAGES } from './domain/sampleData';
import { loadPersisted, savePersisted } from './persist';

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
  /** Load from AsyncStorage (seed from the sample corpus on first run). */
  hydrate: () => Promise<void>;
  /** Confirm a reviewed spend: set category + worth, mark confirmed, award coins. Persists. */
  reviewTransaction: (id: string, categoryId: string, worth: WorthRating) => void;
  /** Add a manually-logged transaction (no coin reward — logging isn't a rewarded behavior). Persists. */
  addTransaction: (t: Transaction) => void;
}

export const useStore = create<AppState>((set, get) => ({
  transactions: [],
  budgetMinor: 5000000, // ₹50,000
  currency: 'INR',
  player: DEFAULT_PLAYER,
  hydrated: false,

  hydrate: async () => {
    const saved = await loadPersisted();
    if (saved && saved.transactions?.length) {
      console.log('[coinquest] loaded', saved.transactions.length, 'txns, coins =', saved.coins);
      set((s) => ({
        transactions: saved.transactions,
        player: { ...s.player, coins: saved.coins ?? s.player.coins },
        hydrated: true,
      }));
    } else {
      const txns = seedTransactions();
      await savePersisted({ transactions: txns, coins: DEFAULT_PLAYER.coins });
      console.log('[coinquest] seeded', txns.length, 'txns');
      set({ transactions: txns, hydrated: true });
    }
  },

  reviewTransaction: (id, categoryId, worth) => {
    const state = get();
    const transactions = state.transactions.map((t) =>
      t.id === id ? { ...t, categoryId, worth, status: 'confirmed' as const } : t
    );
    const player = { ...state.player, coins: state.player.coins + REVIEW_REWARD_COINS };
    set({ transactions, player });
    savePersisted({ transactions, coins: player.coins }).then(() =>
      console.log('[coinquest] persisted; coins =', player.coins)
    );
  },

  addTransaction: (t) => {
    const transactions = [t, ...get().transactions].sort((a, b) => b.ts - a.ts);
    const coins = get().player.coins;
    set({ transactions });
    savePersisted({ transactions, coins });
  },
}));
