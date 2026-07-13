/**
 * Merchant normalization + default categorization.
 * Rule: raw bank text (e.g. "SWIGGY BANGALORE IN") → clean name ("Swiggy") + category.
 * User corrections (stored as CategoryRule elsewhere) override these seeds at runtime.
 */

import { OTHER } from './categories';

interface MerchantSeed {
  /** lowercase substrings that identify this merchant in raw text */
  match: string[];
  name: string; // clean display name
  categoryId: string;
}

export const MERCHANT_SEEDS: MerchantSeed[] = [
  { match: ['swiggy', 'bundl technologies'], name: 'Swiggy', categoryId: 'food' },
  { match: ['zomato'], name: 'Zomato', categoryId: 'food' },
  { match: ['starbucks'], name: 'Starbucks', categoryId: 'food' },
  { match: ["domino", 'dominos', 'jubilant food'], name: "Domino's", categoryId: 'food' },
  { match: ['mcdonald', 'mcd '], name: "McDonald's", categoryId: 'food' },
  { match: ['amazon', 'amzn'], name: 'Amazon', categoryId: 'shopping' },
  { match: ['flipkart'], name: 'Flipkart', categoryId: 'shopping' },
  { match: ['myntra'], name: 'Myntra', categoryId: 'shopping' },
  { match: ['ajio'], name: 'Ajio', categoryId: 'shopping' },
  { match: ['uber'], name: 'Uber', categoryId: 'transport' },
  { match: ['ola ', 'olacabs', 'ani technologies'], name: 'Ola', categoryId: 'transport' },
  { match: ['rapido'], name: 'Rapido', categoryId: 'transport' },
  { match: ['irctc'], name: 'IRCTC', categoryId: 'transport' },
  { match: ['bigbasket', 'big basket', 'supermarket grocer'], name: 'BigBasket', categoryId: 'groceries' },
  { match: ['blinkit', 'grofers'], name: 'Blinkit', categoryId: 'groceries' },
  { match: ['zepto'], name: 'Zepto', categoryId: 'groceries' },
  { match: ['dmart', 'avenue supermart'], name: 'DMart', categoryId: 'groceries' },
  { match: ['jio', 'reliance jio'], name: 'Jio', categoryId: 'bills' },
  { match: ['airtel'], name: 'Airtel', categoryId: 'bills' },
  { match: ['electricity', 'bescom', 'tata power', 'adani electric'], name: 'Electricity', categoryId: 'bills' },
  { match: ['netflix'], name: 'Netflix', categoryId: 'entertainment' },
  { match: ['spotify'], name: 'Spotify', categoryId: 'entertainment' },
  { match: ['bookmyshow', 'bigtree'], name: 'BookMyShow', categoryId: 'entertainment' },
  { match: ['pvr', 'inox'], name: 'PVR INOX', categoryId: 'entertainment' },
  { match: ['apollo', 'pharmeasy', '1mg', 'netmeds'], name: 'Pharmacy', categoryId: 'health' },
  { match: ['cult.fit', 'cultfit', 'curefit'], name: 'Cult.fit', categoryId: 'health' },
  { match: ['rent', 'landlord'], name: 'Rent', categoryId: 'rent' },
  { match: ['salary', 'sal cr', 'payroll', 'neft cr'], name: 'Salary', categoryId: 'income' },
];

/** Returns { name, categoryId } for a raw merchant/body string. Unknown → title-cased raw, category "other". */
export function normalizeMerchant(raw: string): { name: string; categoryId: string; known: boolean } {
  const hay = raw.toLowerCase();
  for (const s of MERCHANT_SEEDS) {
    if (s.match.some((m) => hay.includes(m))) {
      return { name: s.name, categoryId: s.categoryId, known: true };
    }
  }
  return { name: titleCase(cleanRaw(raw)), categoryId: OTHER, known: false };
}

function cleanRaw(raw: string): string {
  return raw
    .replace(/\b(pvt|ltd|limited|india|in|bangalore|mumbai|delhi|pvt\.)\b/gi, '')
    .replace(/[*_\-]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .slice(0, 40) || 'Unknown';
}
