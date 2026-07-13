/**
 * Rule-based, on-device transaction parser.
 * Input: a RawMessage (bank alert / UPI / merchant receipt, email or SMS-shaped).
 * Output: a ParseResult with a Transaction (confirmed) or needs_review/failed.
 *
 * Deterministic, no network, no LLM. (An optional on-device LLM fallback can be
 * layered on later for formats these rules miss — see SPEC §4.5.)
 */

import { ParseResult, RawMessage, Transaction, Direction } from './types';
import { normalizeMerchant } from './merchants';
import { INCOME } from './categories';

const DEBIT_WORDS = /\b(debited|debit|sent|paid|spent|withdrawn|purchase|deducted)\b/i;
const CREDIT_WORDS = /\b(credited|credit|received|deposited|refund(?:ed)?)\b/i;

/** Extract the first money amount → minor units. Handles ₹ / Rs / INR, commas, decimals. */
function extractAmount(body: string): number | undefined {
  const m = body.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (!m) return undefined;
  const major = parseFloat(m[1].replace(/,/g, ''));
  if (isNaN(major)) return undefined;
  return Math.round(major * 100);
}

function extractDirection(body: string): Direction | undefined {
  // credit check first only if no debit word (some messages contain both, e.g. "debited ... to X credited")
  if (DEBIT_WORDS.test(body) && !/\bcredited to (?:vpa|payee|beneficiary)/i.test(body)) return 'debit';
  if (CREDIT_WORDS.test(body)) return 'credit';
  if (DEBIT_WORDS.test(body)) return 'debit';
  return undefined;
}

function extractAccountTail(body: string): string | undefined {
  const m = body.match(/(?:a\/c|acct|account|card)\s*(?:no\.?|number)?\s*[xX*•]*\s*(\d{3,4})\b/i);
  return m?.[1];
}

function extractRef(body: string): string | undefined {
  const m = body.match(/(?:upi\s*ref(?:\s*no)?|ref(?:erence)?(?:\s*no)?|txn\s*id)\.?\s*[:#]?\s*([A-Za-z0-9]{6,})/i);
  return m?.[1];
}

function extractDate(body: string, fallback: number): number {
  // dd-Mon-yy | dd-mm-yy | dd/mm/yyyy
  const m = body.match(/(\d{1,2})[-\/]([A-Za-z]{3}|\d{1,2})[-\/](\d{2,4})/);
  if (!m) return fallback;
  const [, d, mo, y] = m;
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  let month: number;
  if (/^\d+$/.test(mo)) month = parseInt(mo, 10) - 1;
  else month = months.indexOf(mo.toLowerCase());
  if (month < 0) return fallback;
  let year = parseInt(y, 10);
  if (year < 100) year += 2000;
  const dt = new Date(year, month, parseInt(d, 10));
  const t = dt.getTime();
  return isNaN(t) ? fallback : t;
}

/** Pull the merchant phrase around the direction keyword (to/from/at X). */
function extractMerchantRaw(body: string, direction: Direction): string | undefined {
  // debit: "to X", "at X", "paid to X"; credit: "from X", "by X"
  const patterns =
    direction === 'debit'
      ? [/(?:paid to|sent to|to vpa|to|at)\s+([A-Za-z0-9][A-Za-z0-9 &._@'-]{1,40}?)(?=\s+(?:on|via|ref|upi|a\/c|dt|\.|,|;|$))/i]
      : [/(?:received from|credited by|from|by)\s+([A-Za-z0-9][A-Za-z0-9 &._@'-]{1,40}?)(?=\s+(?:on|via|ref|to|a\/c|dt|\.|,|;|$))/i];
  for (const re of patterns) {
    const m = body.match(re);
    if (m?.[1]) return m[1].trim();
  }
  // fallback: a known merchant name appearing anywhere is handled by normalizeMerchant(body)
  return undefined;
}

export function parseMessage(msg: RawMessage): ParseResult {
  const body = msg.body.replace(/\s+/g, ' ').trim();
  const amountMinor = extractAmount(body);
  const direction = extractDirection(body);
  const accountTail = extractAccountTail(body);
  const refId = extractRef(body);
  const ts = extractDate(body, msg.ts);

  const extracted = { amountMinor, direction, accountTail, refId, ts, merchantRaw: undefined as string | undefined };

  if (amountMinor == null || direction == null) {
    return { ok: false, extracted, reason: 'No amount or direction found — not a transaction message.' };
  }

  const merchantRaw = extractMerchantRaw(body, direction);
  extracted.merchantRaw = merchantRaw;

  // Normalize from the explicit phrase if we have one, else scan the whole body for a known merchant.
  const norm = merchantRaw ? normalizeMerchant(merchantRaw) : normalizeMerchant(body);

  // For credits with no known merchant, default category to income (salary/refunds).
  const categoryId = !norm.known && direction === 'credit' ? INCOME : norm.categoryId;
  const merchant = norm.name;

  // Confidence: needs review if we couldn't identify a real merchant.
  const known = norm.known;
  const status = known ? 'confirmed' : 'needs_review';

  const transaction: Transaction = {
    id: msg.id,
    amountMinor,
    currency: 'INR',
    direction,
    merchant,
    merchantRaw,
    categoryId,
    ts,
    source: msg.source,
    accountTail,
    refId,
    status,
  };

  return {
    ok: true,
    transaction,
    extracted,
    reason: known ? undefined : 'Unknown merchant — sent to review.',
  };
}

/** Parse many messages, dropping non-transaction ones. */
export function parseAll(messages: RawMessage[]): Transaction[] {
  return messages
    .map(parseMessage)
    .filter((r) => r.ok && r.transaction)
    .map((r) => r.transaction!) as Transaction[];
}
