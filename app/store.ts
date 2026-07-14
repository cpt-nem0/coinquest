import { create } from 'zustand';
import { Transaction, WorthRating, Quest } from './domain/types';
import { parseAll } from './domain/parser';
import { SAMPLE_MESSAGES } from './domain/sampleData';
import { loadPersisted, savePersisted, clearPersisted } from './persist';

export const REVIEW_REWARD_COINS = 20;

interface Player {
  level: number;
  xp: number;
  xpNext: number;
  coins: number;
  streak: number;
}

const DEFAULT_PLAYER: Player = { level: 12, xp: 2400, xpNext: 3000, coins: 1250, streak: 14 };

const DEFAULT_QUESTS: Quest[] = [
  { id: 'q1', title: 'No-spend morning', reward: 40, done: true },
  { id: 'q2', title: "Set next week's budget", reward: 80, done: false },
  { id: 'q3', title: 'Review your week', reward: 60, done: false },
];

function seedTransactions(): Transaction[] {
  return parseAll(SAMPLE_MESSAGES).sort((a, b) => b.ts - a.ts);
}

interface AppState {
  transactions: Transaction[];
  budgetMinor: number;
  currency: string;
  player: Player;
  quests: Quest[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  reviewTransaction: (id: string, categoryId: string, worth: WorthRating) => void;
  addTransaction: (t: Transaction) => void;
  toggleQuest: (id: string) => void;
  setBudget: (minor: number) => void;
  setCurrency: (code: string) => void;
  resetData: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => {
  const persist = () => {
    const s = get();
    savePersisted({
      transactions: s.transactions,
      coins: s.player.coins,
      quests: s.quests,
      budgetMinor: s.budgetMinor,
      currency: s.currency,
    });
  };

  return {
    transactions: [],
    budgetMinor: 5000000, // ₹50,000
    currency: 'INR',
    player: DEFAULT_PLAYER,
    quests: DEFAULT_QUESTS,
    hydrated: false,

    hydrate: async () => {
      const saved = await loadPersisted();
      if (saved && saved.transactions?.length) {
        set((s) => ({
          transactions: saved.transactions,
          player: { ...s.player, coins: saved.coins ?? s.player.coins },
          quests: saved.quests?.length ? saved.quests : s.quests,
          budgetMinor: saved.budgetMinor ?? s.budgetMinor,
          currency: saved.currency ?? s.currency,
          hydrated: true,
        }));
      } else {
        const txns = seedTransactions();
        await savePersisted({ transactions: txns, coins: DEFAULT_PLAYER.coins, quests: DEFAULT_QUESTS });
        set({ transactions: txns, hydrated: true });
      }
    },

    reviewTransaction: (id, categoryId, worth) => {
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, categoryId, worth, status: 'confirmed' as const } : t
        ),
        player: { ...state.player, coins: state.player.coins + REVIEW_REWARD_COINS },
      }));
      persist();
    },

    addTransaction: (t) => {
      set((state) => ({ transactions: [t, ...state.transactions].sort((a, b) => b.ts - a.ts) }));
      persist();
    },

    toggleQuest: (id) => {
      set((state) => {
        let delta = 0;
        const quests = state.quests.map((q) => {
          if (q.id !== id) return q;
          delta = q.done ? -q.reward : q.reward; // completing awards, un-completing removes
          return { ...q, done: !q.done };
        });
        return { quests, player: { ...state.player, coins: state.player.coins + delta } };
      });
      persist();
    },

    setBudget: (minor) => {
      set({ budgetMinor: Math.max(0, Math.round(minor)) });
      persist();
    },

    setCurrency: (code) => {
      set({ currency: code });
      persist();
    },

    resetData: async () => {
      await clearPersisted();
      const txns = seedTransactions();
      set({
        transactions: txns,
        budgetMinor: 5000000,
        currency: 'INR',
        player: { ...DEFAULT_PLAYER },
        quests: DEFAULT_QUESTS.map((q) => ({ ...q })),
      });
      await savePersisted({
        transactions: txns,
        coins: DEFAULT_PLAYER.coins,
        quests: DEFAULT_QUESTS,
        budgetMinor: 5000000,
        currency: 'INR',
      });
    },
  };
});
