/**
 * Web stub for the persistence layer — no SQLite in the browser preview.
 * The store falls back to the in-memory sample corpus on web.
 */
import { Transaction } from './domain/types';

export async function initDb(): Promise<void> {}
export async function getAllTransactions(): Promise<Transaction[]> {
  return [];
}
export async function saveTransactions(_txns: Transaction[]): Promise<void> {}
export async function updateTransaction(_t: Transaction): Promise<void> {}
export async function getKV(_key: string): Promise<string | null> {
  return null;
}
export async function setKV(_key: string, _value: string): Promise<void> {}
