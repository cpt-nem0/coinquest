import { ImageSourcePropType } from 'react-native';
import { Transaction, Quest } from './types';

/** Everything an achievement predicate can look at, derived from live app state. */
export interface AchievementCtx {
  level: number;
  streak: number;
  coins: number;
  bossesBeaten: number;
  bossesTotal: number;
  txnCount: number;
  reviewedCount: number;
  questsAllDone: boolean;
  health: number; // 0..100
  monthSpentMinor: number;
  budgetMinor: number;
  netSavedMinor: number; // lifetime credits − debits
  noSpendDays: number; // count of no-spend calendar days this month
}

export type AchievementTrack = 'Progression' | 'Streaks' | 'Restraint' | 'Battles' | 'Wealth & habits';

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  track: AchievementTrack;
  icon: ImageSourcePropType;
  unlocked: (c: AchievementCtx) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ---- Progression ----
  { id: 'apprentice', name: 'Apprentice', desc: 'Reach level 5', track: 'Progression', icon: require('../assets/badges/apprentice.png'), unlocked: (c) => c.level >= 5 },
  { id: 'journeyman', name: 'Journeyman', desc: 'Reach level 10', track: 'Progression', icon: require('../assets/badges/journeyman.png'), unlocked: (c) => c.level >= 10 },
  { id: 'veteran', name: 'Veteran', desc: 'Reach level 20', track: 'Progression', icon: require('../assets/badges/veteran.png'), unlocked: (c) => c.level >= 20 },
  { id: 'legend', name: 'Legend', desc: 'Reach level 50', track: 'Progression', icon: require('../assets/badges/legend.png'), unlocked: (c) => c.level >= 50 },

  // ---- Streaks ----
  { id: 'warming-up', name: 'Warming Up', desc: '3-day streak', track: 'Streaks', icon: require('../assets/badges/warming-up.png'), unlocked: (c) => c.streak >= 3 },
  { id: 'consistent', name: 'Consistent', desc: '7-day streak', track: 'Streaks', icon: require('../assets/badges/consistent.png'), unlocked: (c) => c.streak >= 7 },
  { id: 'unstoppable', name: 'Unstoppable', desc: '30-day streak', track: 'Streaks', icon: require('../assets/badges/unstoppable.png'), unlocked: (c) => c.streak >= 30 },

  // ---- Restraint ----
  { id: 'iron-will', name: 'Iron Will', desc: 'A no-spend day', track: 'Restraint', icon: require('../assets/badges/iron-will.png'), unlocked: (c) => c.noSpendDays >= 1 },
  { id: 'monk-mode', name: 'Monk Mode', desc: '7 no-spend days in a month', track: 'Restraint', icon: require('../assets/badges/monk-mode.png'), unlocked: (c) => c.noSpendDays >= 7 },
  { id: 'budget-master', name: 'Budget Master', desc: 'Finish a month under budget', track: 'Restraint', icon: require('../assets/badges/budget-master.png'), unlocked: (c) => c.budgetMinor > 0 && c.monthSpentMinor <= c.budgetMinor },

  // ---- Battles ----
  { id: 'boss-slayer', name: 'Boss Slayer', desc: 'Beat your first boss', track: 'Battles', icon: require('../assets/badges/boss-slayer.png'), unlocked: (c) => c.bossesBeaten >= 1 },
  { id: 'champion', name: 'Champion', desc: 'Beat every boss at once', track: 'Battles', icon: require('../assets/badges/champion.png'), unlocked: (c) => c.bossesTotal > 0 && c.bossesBeaten >= c.bossesTotal },

  // ---- Wealth & habits ----
  { id: 'first-coin', name: 'First Coin', desc: 'Log your first spend', track: 'Wealth & habits', icon: require('../assets/badges/first-coin.png'), unlocked: (c) => c.txnCount >= 1 },
  { id: 'treasure-hunter', name: 'Treasure Hunter', desc: 'Save ₹10,000 net', track: 'Wealth & habits', icon: require('../assets/badges/treasure-hunter.png'), unlocked: (c) => c.netSavedMinor >= 1000000 },
  { id: 'coin-baron', name: 'Coin Baron', desc: 'Bank 5,000 coins', track: 'Wealth & habits', icon: require('../assets/badges/coin-baron.png'), unlocked: (c) => c.coins >= 5000 },
  { id: 'auditor', name: 'Auditor', desc: 'Review 10 spends', track: 'Wealth & habits', icon: require('../assets/badges/auditor.png'), unlocked: (c) => c.reviewedCount >= 10 },
  { id: 'questmaster', name: 'Questmaster', desc: 'Clear all daily quests', track: 'Wealth & habits', icon: require('../assets/badges/questmaster.png'), unlocked: (c) => c.questsAllDone },
  { id: 'peak-health', name: 'Peak Health', desc: 'Hit 100% money health', track: 'Wealth & habits', icon: require('../assets/badges/peak-health.png'), unlocked: (c) => c.health >= 100 },
];

export const TRACK_ORDER: AchievementTrack[] = ['Progression', 'Streaks', 'Restraint', 'Battles', 'Wealth & habits'];

/** Derive the achievement context from live app state. */
export function buildAchievementCtx(opts: {
  txns: Transaction[];
  budgetMinor: number;
  level: number;
  streak: number;
  coins: number;
  bossesBeaten: number;
  bossesTotal: number;
  health: number;
  quests: Quest[];
}): AchievementCtx {
  const { txns, budgetMinor, level, streak, coins, bossesBeaten, bossesTotal, health, quests } = opts;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const today = now.getDate();

  const isSpend = (t: Transaction) => t.direction === 'debit' && t.categoryId !== 'income';
  const inThisMonth = (t: Transaction) => {
    const d = new Date(t.ts);
    return d.getFullYear() === y && d.getMonth() === m;
  };

  const monthSpends = txns.filter((t) => isSpend(t) && inThisMonth(t));
  const monthSpentMinor = monthSpends.reduce((s, t) => s + t.amountMinor, 0);

  const credits = txns.filter((t) => t.direction === 'credit').reduce((s, t) => s + t.amountMinor, 0);
  const debits = txns.filter((t) => t.direction === 'debit').reduce((s, t) => s + t.amountMinor, 0);
  const netSavedMinor = credits - debits;

  const spentDays = new Set(monthSpends.map((t) => new Date(t.ts).getDate()));
  const noSpendDays = Math.max(0, today - spentDays.size);

  // "reviewed" = the user gave it a worth rating in the Encounter
  const reviewedCount = txns.filter((t) => t.worth != null).length;

  return {
    level,
    streak,
    coins,
    bossesBeaten,
    bossesTotal,
    txnCount: txns.length,
    reviewedCount,
    questsAllDone: quests.length > 0 && quests.every((q) => q.done),
    health,
    monthSpentMinor,
    budgetMinor,
    netSavedMinor,
    noSpendDays,
  };
}
