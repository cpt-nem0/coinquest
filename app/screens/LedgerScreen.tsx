import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, space } from '../theme';
import NeoBox from '../components/NeoBox';
import MoneyText from '../components/MoneyText';
import { useStore } from '../store';
import { CATEGORY_BY_ID } from '../domain/categories';
import { Transaction } from '../domain/types';

const CAT_COLOR: Record<string, string> = {
  food: colors.reward, shopping: colors.amber, transport: colors.brand, groceries: colors.gain,
  bills: colors.inkSoft, rent: colors.inkSoft, entertainment: colors.brand, health: colors.loss,
  income: colors.gain, other: colors.inkSoft, cosmetics: colors.brand,
};
const catColor = (id: string) => CAT_COLOR[id] ?? colors.inkSoft;

function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function dayLabel(ts: number) {
  const now = new Date();
  const k = dayKey(ts);
  if (k === dayKey(now.getTime())) return 'TODAY';
  if (k === dayKey(now.getTime() - 86400000)) return 'YESTERDAY';
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase();
}
function timeLabel(ts: number) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function Row({ t }: { t: Transaction }) {
  const cat = CATEGORY_BY_ID[t.categoryId];
  const cc = catColor(t.categoryId);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.track }}>
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
        <Text numberOfLines={1} style={{ fontFamily: fonts.heading, fontSize: 17, color: colors.ink }}>{t.merchant}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ borderWidth: 1.5, borderColor: cc, paddingHorizontal: 6, paddingVertical: 1 }}>
            <Text style={{ fontFamily: fonts.label, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: cc }}>{cat?.flavor ?? 'Misc'}</Text>
          </View>
          <Text style={{ fontFamily: fonts.moneyMed, fontSize: 10, color: colors.inkSoft }}>{timeLabel(t.ts)} • {t.source.toUpperCase()}</Text>
        </View>
      </View>
      <MoneyText amountMinor={t.amountMinor} currency={t.currency} kind={t.direction} size={15} />
    </View>
  );
}

export default function LedgerScreen() {
  const txns = useStore((s) => s.transactions);
  const budget = useStore((s) => s.budgetMinor);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all'); // categoryId or 'all'

  // filter chips = ALL + flavors of categories present
  const filterCats = useMemo(() => {
    const ids = Array.from(new Set(txns.map((t) => t.categoryId)));
    return ids.map((id) => ({ id, flavor: CATEGORY_BY_ID[id]?.flavor ?? 'Misc' }));
  }, [txns]);

  const { groups, spentToday } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = txns.filter(
      (t) => (filter === 'all' || t.categoryId === filter) && (!q || t.merchant.toLowerCase().includes(q))
    );
    const todayK = dayKey(Date.now());
    const spentToday = txns
      .filter((t) => t.direction === 'debit' && t.categoryId !== 'income' && dayKey(t.ts) === todayK)
      .reduce((s, t) => s + t.amountMinor, 0);
    const map = new Map<string, Transaction[]>();
    for (const t of filtered) (map.get(dayKey(t.ts)) ?? map.set(dayKey(t.ts), []).get(dayKey(t.ts))!).push(t);
    const groups = [...map.entries()].map(([, ts]) => ({ label: dayLabel(ts[0].ts), txns: ts }));
    return { groups, spentToday };
  }, [txns, query, filter]);

  const dailyLimit = budget / 30;
  const dailyRatio = dailyLimit > 0 ? Math.min(1, spentToday / dailyLimit) : 0;

  return (
    <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: 48, gap: space.lg }} keyboardShouldPersistTaps="handled">
      {/* header */}
      <View style={{ gap: 2 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.ink }}>LEDGER</Text>
        <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 0.5, color: colors.inkSoft, textTransform: 'uppercase' }}>Your spending, plain and clear.</Text>
      </View>

      {/* search */}
      <View style={{ borderWidth: 3, borderColor: colors.ink, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="SEARCH DEEDS..."
          placeholderTextColor={colors.inkSoft}
          style={{ flex: 1, fontFamily: fonts.moneyMed, fontSize: 13, color: colors.ink, paddingVertical: 12 }}
        />
        <Ionicons name="search" size={18} color={colors.ink} />
      </View>

      {/* filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {[{ id: 'all', flavor: 'All' }, ...filterCats].map((c) => {
          const on = filter === c.id;
          return (
            <Pressable key={c.id} onPress={() => setFilter(c.id)}>
              <View style={{ borderWidth: 3, borderColor: colors.ink, backgroundColor: on ? colors.ink : colors.white, paddingHorizontal: 14, paddingVertical: 7 }}>
                <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: on ? colors.white : colors.ink }}>{c.flavor}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* spent today */}
      <NeoBox bg={colors.white} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: 20, alignItems: 'center', gap: 4 }}>
        <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>Spent today</Text>
        <MoneyText amountMinor={spentToday} size={44} color={colors.ink} />
        <View style={{ width: '100%', height: 10, borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.surface, marginTop: 8 }}>
          <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${dailyRatio * 100}%`, backgroundColor: dailyRatio >= 1 ? colors.loss : colors.reward }} />
        </View>
        <Text style={{ fontFamily: fonts.moneyMed, fontSize: 10, letterSpacing: 0.5, color: colors.inkSoft, marginTop: 6, textTransform: 'uppercase' }}>
          {Math.round(dailyRatio * 100)}% of daily limit
        </Text>
      </NeoBox>

      {/* grouped transactions */}
      {groups.length === 0 ? (
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, textAlign: 'center' }}>No deeds match.</Text>
      ) : (
        groups.map((g, i) => (
          <View key={i} style={{ gap: 0 }}>
            <View style={{ alignSelf: 'flex-start', backgroundColor: colors.ink, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10 }}>
              <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1, color: colors.white, textTransform: 'uppercase' }}>{g.label}</Text>
            </View>
            <View style={{ borderTopWidth: 3, borderTopColor: colors.ink }}>
              {g.txns.map((t) => (
                <Row key={t.id} t={t} />
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
