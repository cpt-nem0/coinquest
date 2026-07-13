/**
 * On-device persistence via expo-sqlite (native / Expo Go).
 * Web uses db.web.ts (a no-op stub) — Metro resolves the platform file automatically,
 * so expo-sqlite never enters the web bundle.
 */
import * as SQLite from 'expo-sqlite';
import { Transaction, Direction, TxnStatus, SourceKind, WorthRating } from './domain/types';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDb(): Promise<void> {
  if (db) return;
  db = await SQLite.openDatabaseAsync('coinquest.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      amountMinor INTEGER NOT NULL,
      currency TEXT NOT NULL,
      direction TEXT NOT NULL,
      merchant TEXT NOT NULL,
      merchantRaw TEXT,
      categoryId TEXT NOT NULL,
      ts INTEGER NOT NULL,
      source TEXT NOT NULL,
      accountTail TEXT,
      refId TEXT,
      status TEXT NOT NULL,
      worth TEXT
    );
    CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT);
  `);
}

function rowToTxn(r: any): Transaction {
  return {
    id: r.id,
    amountMinor: r.amountMinor,
    currency: r.currency,
    direction: r.direction as Direction,
    merchant: r.merchant,
    merchantRaw: r.merchantRaw ?? undefined,
    categoryId: r.categoryId,
    ts: r.ts,
    source: r.source as SourceKind,
    accountTail: r.accountTail ?? undefined,
    refId: r.refId ?? undefined,
    status: r.status as TxnStatus,
    worth: (r.worth ?? undefined) as WorthRating | undefined,
  };
}

export async function getAllTransactions(): Promise<Transaction[]> {
  if (!db) return [];
  const rows = await db.getAllAsync('SELECT * FROM transactions ORDER BY ts DESC');
  return rows.map(rowToTxn);
}

async function upsert(t: Transaction): Promise<void> {
  if (!db) return;
  await db.runAsync(
    `INSERT OR REPLACE INTO transactions
       (id,amountMinor,currency,direction,merchant,merchantRaw,categoryId,ts,source,accountTail,refId,status,worth)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      t.id, t.amountMinor, t.currency, t.direction, t.merchant, t.merchantRaw ?? null,
      t.categoryId, t.ts, t.source, t.accountTail ?? null, t.refId ?? null, t.status, t.worth ?? null,
    ]
  );
}

export async function saveTransactions(txns: Transaction[]): Promise<void> {
  if (!db) return;
  await db.withTransactionAsync(async () => {
    for (const t of txns) await upsert(t);
  });
}

export async function updateTransaction(t: Transaction): Promise<void> {
  await upsert(t);
}

export async function getKV(key: string): Promise<string | null> {
  if (!db) return null;
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM kv WHERE key = ?', [key]);
  return row?.value ?? null;
}

export async function setKV(key: string, value: string): Promise<void> {
  if (!db) return;
  await db.runAsync('INSERT OR REPLACE INTO kv (key,value) VALUES (?,?)', [key, value]);
}
