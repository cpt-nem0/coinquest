/**
 * A richer 3-month sample corpus (May–Jul 2026), generated as real bank-style
 * messages so the PARSER produces them — same pipeline that IMAP will feed later.
 * Compact source tuples → formatted message bodies → parseAll() → transactions.
 */

import { RawMessage } from './types';

type Entry = [merchant: string, amountMajor: number, dateISO: string, dir: 'd' | 'c'];

// [merchant, ₹amount, YYYY-MM-DD, debit|credit]
const ENTRIES: Entry[] = [
  // ---- May 2026 ----
  ['Salary', 52000, '2026-05-01', 'c'],
  ['Rent', 15000, '2026-05-03', 'd'],
  ['Swiggy', 520, '2026-05-05', 'd'],
  ['Zomato', 410, '2026-05-12', 'd'],
  ['Amazon', 1800, '2026-05-09', 'd'],
  ['Uber', 260, '2026-05-14', 'd'],
  ['BigBasket', 1200, '2026-05-18', 'd'],
  ['Netflix', 649, '2026-05-20', 'd'],
  ['Apollo Pharmacy', 500, '2026-05-22', 'd'],
  ['Nykaa', 900, '2026-05-15', 'd'],
  ['Jio Prepaid', 399, '2026-05-08', 'd'],
  // ---- June 2026 ----
  ['Salary', 52000, '2026-06-01', 'c'],
  ['Rent', 15000, '2026-06-03', 'd'],
  ['Swiggy', 610, '2026-06-06', 'd'],
  ['Zomato', 380, '2026-06-16', 'd'],
  ['Flipkart', 2760, '2026-06-27', 'd'],
  ['Uber', 298, '2026-06-22', 'd'],
  ['BigBasket', 1180, '2026-06-24', 'd'],
  ['BookMyShow', 560, '2026-06-20', 'd'],
  ['Apollo Pharmacy', 780, '2026-06-18', 'd'],
  ['Nykaa', 1100, '2026-06-14', 'd'],
  ['Jio Prepaid', 399, '2026-06-08', 'd'],
  // ---- July 2026 (current) ----
  ['Salary', 52000, '2026-07-01', 'c'],
  ['Rent', 15000, '2026-07-03', 'd'],
  ['Swiggy', 487, '2026-07-13', 'd'],
  ['Zomato', 342, '2026-07-06', 'd'],
  ['Starbucks', 415, '2026-07-02', 'd'],
  ['Amazon', 2199, '2026-07-13', 'd'],
  ['Myntra', 1849, '2026-07-04', 'd'],
  ['Uber', 236, '2026-07-12', 'd'],
  ['Ola Cabs', 189, '2026-07-01', 'd'],
  ['BigBasket', 1340, '2026-07-12', 'd'],
  ['Zepto', 420, '2026-07-10', 'd'],
  ['Netflix', 649, '2026-07-20', 'd'],
  ['Apollo Pharmacy', 780, '2026-07-05', 'd'],
  ['Nykaa', 1250, '2026-07-09', 'd'],
  ['Jio Prepaid', 399, '2026-07-08', 'd'],
  ['Electricity', 1620, '2026-07-03', 'd'],
  // unknown merchants → parser flags needs_review → surface in the Encounter
  ['QwikMart Retail', 640, '2026-07-11', 'd'],
  ['Cafe Mocha', 280, '2026-07-13', 'd'],
];

function ddmmyy(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y.slice(2)}`;
}

let refCounter = 100000000000;
function nextRef() {
  return String(refCounter++);
}

function toMessage(e: Entry, i: number): RawMessage {
  const [merchant, amt, date, dir] = e;
  const ts = Date.parse(`${date}T10:00:00`);
  const amtStr = amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const body =
    dir === 'd'
      ? `Sent Rs.${amtStr} From HDFC Bank A/C x1234 To ${merchant.toUpperCase()} On ${ddmmyy(date)} UPI Ref ${nextRef()}.`
      : `Rs.${amtStr} credited to A/C xx1234 on ${ddmmyy(date)} by ${merchant.toUpperCase()} NEFT CR. Avl Bal Rs.80,000.00.`;
  return { id: `g${i}`, source: 'gmail', sender: 'alerts@hdfcbank.net', ts, body };
}

export const SAMPLE_MESSAGES: RawMessage[] = ENTRIES.map(toMessage);
