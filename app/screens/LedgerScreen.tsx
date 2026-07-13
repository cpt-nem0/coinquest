import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors, fonts, space } from '../theme';
import NeoBox from '../components/NeoBox';
import Chip from '../components/Chip';
import MoneyText from '../components/MoneyText';
import { useStore } from '../store';
import { CATEGORY_BY_ID } from '../domain/categories';
import { Transaction } from '../domain/types';

function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function dayLabel(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const key = dayKey(ts);
  if (key === dayKey(now.getTime())) return 'TODAY';
  if (key === dayKey(now.getTime() - 86400000)) return 'YESTERDAY';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase();
}
function timeLabel(ts: number) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function MerchantMark({ letter }: { letter: string }) {
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderWidth: 2,
        borderColor: colors.ink,
        backgroundColor: colors.surfaceLow,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fonts.heading, fontSize: 18, color: colors.reward }}>{letter}</Text>
    </View>
  );
}

function Row({ t }: { t: Transaction }) {
  const cat = CATEGORY_BY_ID[t.categoryId];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: colors.track,
      }}
    >
      <MerchantMark letter={(t.merchant[0] || '?').toUpperCase()} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            numberOfLines={1}
            style={{ fontFamily: fonts.heading, fontSize: 16, color: colors.ink, flexShrink: 1 }}
          >
            {t.merchant}
          </Text>
          {t.status === 'needs_review' && <Chip label="review" color={colors.amber} />}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
          <Text style={{ fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.6, color: colors.inkSoft, textTransform: 'uppercase' }}>
            {cat?.flavor ?? 'Misc'}
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft }}>· {timeLabel(t.ts)}</Text>
          <Text style={{ fontFamily: fonts.label, fontSize: 9.5, letterSpacing: 0.5, color: colors.brand, textTransform: 'uppercase' }}>
            {t.source}
          </Text>
        </View>
      </View>
      <MoneyText amountMinor={t.amountMinor} currency={t.currency} kind={t.direction} size={15} />
    </View>
  );
}

export default function LedgerScreen() {
  const txns = useStore((s) => s.transactions);
  const { groups, totalOut } = useMemo(() => {
    const totalOut = txns.filter((t) => t.direction === 'debit').reduce((s, t) => s + t.amountMinor, 0);
    const map = new Map<string, Transaction[]>();
    for (const t of txns) {
      const k = dayKey(t.ts);
      (map.get(k) ?? map.set(k, []).get(k)!).push(t);
    }
    const groups = [...map.entries()].map(([, ts]) => ({ label: dayLabel(ts[0].ts), txns: ts }));
    return { groups, totalOut };
  }, [txns]);

  return (
    <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: 40, gap: space.md }}>
      <View style={{ gap: 2 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 28, color: colors.ink }}>Ledger</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft }}>Your spending, plain and clear.</Text>
      </View>

      <NeoBox style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: 4 }}>
        <Text style={{ fontFamily: fonts.label, fontSize: 13, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>
          Total out (all)
        </Text>
        <MoneyText amountMinor={totalOut} size={34} color={colors.ink} />
      </NeoBox>

      {groups.map((g, i) => (
        <View key={i} style={{ gap: 0 }}>
          <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase', marginBottom: 2 }}>
            {g.label}
          </Text>
          <NeoBox style={{ alignSelf: 'stretch' }} contentStyle={{ paddingHorizontal: space.md, paddingVertical: 2 }}>
            {g.txns.map((t) => (
              <Row key={t.id} t={t} />
            ))}
          </NeoBox>
        </View>
      ))}

      <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, textAlign: 'center', marginTop: 6 }}>
        {txns.length} transactions · parsed on-device · P1
      </Text>
    </ScrollView>
  );
}
