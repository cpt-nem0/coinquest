/** Core domain types for Coinquest. Money is always integer minor units + ISO currency. */

export type Direction = 'debit' | 'credit';
export type SourceKind = 'gmail' | 'manual' | 'share' | 'sms' | 'aa';
export type TxnStatus = 'confirmed' | 'needs_review';
/** The gamified "worth it?" reflection on a spend. */
export type WorthRating = 'worth' | 'meh' | 'regret';

/** A raw captured message from any source, before parsing. */
export interface RawMessage {
  id: string;
  source: SourceKind;
  sender: string; // e.g. "HDFC Bank", "alerts@icicibank.com"
  body: string;
  ts: number; // epoch ms when received
}

/** A parsed financial transaction. */
export interface Transaction {
  id: string;
  amountMinor: number; // always positive; direction carries sign meaning
  currency: string; // ISO 4217, e.g. "INR"
  direction: Direction;
  merchant: string; // normalized display name (real merchant)
  merchantRaw?: string; // original extracted text
  categoryId: string;
  ts: number; // transaction time (epoch ms)
  source: SourceKind;
  accountTail?: string; // e.g. "1234"
  refId?: string;
  status: TxnStatus; // needs_review when we're not confident (e.g. unknown merchant)
  worth?: WorthRating; // set when the user reviews it in the Encounter
}

export interface ParseResult {
  ok: boolean;
  transaction?: Transaction;
  /** Which fields we could/couldn't extract — useful for debugging & review UI. */
  extracted: {
    amountMinor?: number;
    direction?: Direction;
    merchantRaw?: string;
    accountTail?: string;
    refId?: string;
    ts?: number;
  };
  reason?: string; // why it failed / needs review
}
