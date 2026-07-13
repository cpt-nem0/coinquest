/* Quick parser verification — run with:  npx tsx domain/verify.ts  */
import { parseMessage } from './parser';
import { SAMPLE_MESSAGES } from './sampleEmails';
import { CATEGORY_BY_ID } from './categories';

const fmt = (m: number) => '₹' + (m / 100).toLocaleString('en-IN');

let confirmed = 0, review = 0, dropped = 0;
for (const msg of SAMPLE_MESSAGES) {
  const r = parseMessage(msg);
  if (!r.ok) {
    dropped++;
    console.log(`DROP   [${msg.id}] ${r.reason}`);
    continue;
  }
  const t = r.transaction!;
  t.status === 'confirmed' ? confirmed++ : review++;
  const cat = CATEGORY_BY_ID[t.categoryId]?.name ?? t.categoryId;
  const sign = t.direction === 'debit' ? '-' : '+';
  console.log(
    `${t.status === 'confirmed' ? 'OK ' : 'REV'}    [${msg.id}] ${sign}${fmt(t.amountMinor)}  ${t.merchant.padEnd(14)} ${cat.padEnd(18)} a/c ${t.accountTail ?? '?'}  ref ${t.refId ?? '-'}`
  );
}
console.log(`\nSummary: ${confirmed} confirmed, ${review} needs-review, ${dropped} dropped (of ${SAMPLE_MESSAGES.length}).`);
