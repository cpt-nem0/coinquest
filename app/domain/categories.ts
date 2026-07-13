/** Categories carry BOTH a plain name (primary, for finance clarity) and an RPG flavor label. */

export interface Category {
  id: string;
  name: string; // real, plain-English (the primary label)
  flavor: string; // RPG flavor (used only as a small chip, never replaces merchant)
  isFixedBill?: boolean; // excluded from boss battles
}

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', flavor: 'Feasts' },
  { id: 'shopping', name: 'Shopping', flavor: 'Loot' },
  { id: 'transport', name: 'Transport', flavor: 'Travel' },
  { id: 'groceries', name: 'Groceries', flavor: 'Supplies' },
  { id: 'bills', name: 'Bills & Utilities', flavor: 'Upkeep', isFixedBill: true },
  { id: 'rent', name: 'Rent', flavor: 'Stronghold', isFixedBill: true },
  { id: 'entertainment', name: 'Entertainment', flavor: 'Revelry' },
  { id: 'health', name: 'Health', flavor: 'Potions' },
  { id: 'income', name: 'Income', flavor: 'Bounty' },
  { id: 'other', name: 'Other', flavor: 'Misc' },
];

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);

export const OTHER = 'other';
export const INCOME = 'income';
