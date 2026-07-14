/**
 * Pure derivation engines. Everything the UI shows about money/game state is
 * computed here from the transaction list — no hardcoded numbers in screens.
 */

import { Transaction } from './types';
import { CATEGORY_BY_ID, CATEGORIES, INCOME } from './categories';

export type BossState = 'winning' | 'ahead' | 'scouting';

export interface Boss {
  categoryId: string;
  name: string;
  flavor: string;
  spentMinor: number; // this month
  medianMinor: number; // rolling median (last 3 months present)
  state: BossState;
}

export function monthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

/** The latest month present in the data = "current month" (keeps demo stable regardless of real date). */
export function currentMonthKey(txns: Transaction[]): string {
  return txns.reduce((max, t) => {
    const k = monthKey(t.ts);
    return k > max ? k : max;
  }, monthKey(txns[0]?.ts ?? Date.now()));
}

const isSpend = (t: Transaction) => t.direction === 'debit' && t.categoryId !== INCOME;

/** Total spent (all debits excl. income) in a given month. */
export function spentInMonth(txns: Transaction[], mk: string): number {
  return txns.filter((t) => isSpend(t) && monthKey(t.ts) === mk).reduce((s, t) => s + t.amountMinor, 0);
}

export function incomeInMonth(txns: Transaction[], mk: string): number {
  return txns.filter((t) => t.direction === 'credit' && monthKey(t.ts) === mk).reduce((s, t) => s + t.amountMinor, 0);
}

/** category -> { monthKey -> total } for spend categories only. */
function categoryMonthlyTotals(txns: Transaction[]): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const t of txns) {
    if (!isSpend(t)) continue;
    const mk = monthKey(t.ts);
    (out[t.categoryId] ??= {})[mk] = (out[t.categoryId]?.[mk] ?? 0) + t.amountMinor;
  }
  return out;
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

/** Boss per non-fixed spending category: this month's spend vs rolling 3-month median. */
export function computeBosses(txns: Transaction[]): Boss[] {
  const cur = currentMonthKey(txns);
  const totals = categoryMonthlyTotals(txns);
  const bosses: Boss[] = [];
  for (const cat of CATEGORIES) {
    if (cat.id === INCOME || cat.isFixedBill || cat.id === 'other') continue; // fixed bills & catch-all aren't battles
    const perMonth = totals[cat.id];
    if (!perMonth) continue;
    const months = Object.keys(perMonth).sort(); // chronological
    const last3 = months.slice(-3).map((m) => perMonth[m]);
    const spentMinor = perMonth[cur] ?? 0;
    if (spentMinor === 0) continue; // no battle if nothing spent this month
    const medianMinor = median(last3);
    const state: BossState = months.length < 2 ? 'scouting' : spentMinor <= medianMinor ? 'winning' : 'ahead';
    bosses.push({ categoryId: cat.id, name: cat.name, flavor: cat.flavor, spentMinor, medianMinor, state });
  }
  // biggest spend first
  return bosses.sort((a, b) => b.spentMinor - a.spentMinor);
}

export interface BossDetail extends Boss {
  /** chronological monthly totals for this category (up to `months` most recent). */
  history: { mk: string; label: string; total: number; isCurrent: boolean }[];
  /** this month's transactions in this category, newest first. */
  monthTxns: Transaction[];
  /** spent − median (positive = over your usual). */
  deltaMinor: number;
}

/** Full detail for one boss/category: trend history + this month's transactions. */
export function bossDetail(txns: Transaction[], categoryId: string, months = 6): BossDetail | null {
  const boss = computeBosses(txns).find((b) => b.categoryId === categoryId);
  if (!boss) return null;
  const cur = currentMonthKey(txns);

  const perMonth = categoryMonthlyTotals(txns)[categoryId] ?? {};
  const history = Object.keys(perMonth)
    .sort()
    .slice(-months)
    .map((mk) => {
      const [y, m] = mk.split('-').map(Number);
      return {
        mk,
        label: new Date(y, m, 1).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
        total: perMonth[mk],
        isCurrent: mk === cur,
      };
    });

  const monthTxns = txns
    .filter((t) => t.categoryId === categoryId && isSpend(t) && monthKey(t.ts) === cur)
    .sort((a, b) => b.ts - a.ts);

  return { ...boss, history, monthTxns, deltaMinor: boss.spentMinor - boss.medianMinor };
}

/** Transparent 0–100 Money Health: budget adherence (60%) + savings rate (40%). */
export function moneyHealth(txns: Transaction[], budgetMinor: number): number {
  const cur = currentMonthKey(txns);
  const spent = spentInMonth(txns, cur);
  const income = incomeInMonth(txns, cur);
  const ratio = budgetMinor > 0 ? spent / budgetMinor : 1;
  const budgetScore = ratio <= 1 ? 0.5 + 0.5 * (1 - ratio) : Math.max(0, 0.5 - (ratio - 1));
  const savingsScore = income > 0 ? Math.max(0, Math.min(1, (income - spent) / income)) : 0.5;
  return Math.round(100 * (0.6 * budgetScore + 0.4 * savingsScore));
}

export interface HomeSummary {
  monthLabel: string;
  spentMinor: number;
  budgetMinor: number;
  budgetRatio: number; // 0..1+
  health: number; // 0..100
  topBoss?: Boss;
  bossesBeaten: number; // count winning
  bossesTotal: number;
}

export function homeSummary(txns: Transaction[], budgetMinor: number): HomeSummary {
  const cur = currentMonthKey(txns);
  const spent = spentInMonth(txns, cur);
  const bosses = computeBosses(txns);
  const [y, m] = cur.split('-').map(Number);
  const monthLabel = new Date(y, m, 1).toLocaleDateString('en-IN', { month: 'long' });
  return {
    monthLabel,
    spentMinor: spent,
    budgetMinor,
    budgetRatio: budgetMinor > 0 ? spent / budgetMinor : 0,
    health: moneyHealth(txns, budgetMinor),
    topBoss: bosses.find((b) => b.state === 'ahead') ?? bosses[0], // surface the one needing attention
    bossesBeaten: bosses.filter((b) => b.state === 'winning').length,
    bossesTotal: bosses.length,
  };
}

export function healthColor(health: number, c: { gain: string; amber: string; loss: string }): string {
  return health >= 60 ? c.gain : health >= 40 ? c.amber : c.loss;
}
