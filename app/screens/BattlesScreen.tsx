import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors, fonts, space } from '../theme';
import NeoBox from '../components/NeoBox';
import MoneyText from '../components/MoneyText';
import { useStore } from '../store';
import { computeBosses, Boss } from '../domain/engines';

const BOSS_EMOJI: Record<string, string> = {
  food: '🍔', shopping: '🛍️', transport: '🚕', groceries: '🛒', entertainment: '🎬', health: '💊',
};

function HpBar({ ratio, color }: { ratio: number; color: string }) {
  const N = 12;
  const filled = Math.max(1, Math.round(Math.min(1, ratio) * N));
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1 }}>
      {Array.from({ length: N }).map((_, i) => (
        <View
          key={i}
          style={{ width: 9, height: 16, marginRight: 2, marginBottom: 2, borderWidth: 1, borderColor: colors.ink, backgroundColor: i < filled ? color : colors.track }}
        />
      ))}
    </View>
  );
}

function BossCard({ b }: { b: Boss }) {
  const winning = b.state === 'winning';
  const c = winning ? colors.gain : colors.amber;
  const stateLabel = winning ? 'WINNING' : b.state === 'scouting' ? 'SCOUTING' : 'BOSS AHEAD';
  const ratio = b.medianMinor > 0 ? b.spentMinor / b.medianMinor : 1;
  return (
    <NeoBox bg={colors.white} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: space.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
          <View style={{ width: 56, height: 56, borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 28 }}>{BOSS_EMOJI[b.categoryId] ?? '👾'}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: fonts.heading, fontSize: 16, textTransform: 'uppercase', color: colors.ink }}>{b.name} Boss</Text>
            <Text style={{ fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: c, marginTop: 2 }}>{stateLabel}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <MoneyText amountMinor={b.spentMinor} size={18} color={winning ? colors.ink : colors.amber} />
          <Text style={{ fontFamily: fonts.moneyMed, fontSize: 11, color: colors.inkSoft, textTransform: 'uppercase' }}>Median ₹{(b.medianMinor / 100).toLocaleString('en-IN')}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontFamily: fonts.label, fontSize: 12, fontWeight: '700', color: colors.ink, marginRight: 10 }}>HP</Text>
        <HpBar ratio={ratio} color={c} />
      </View>
    </NeoBox>
  );
}

export default function BattlesScreen() {
  const txns = useStore((s) => s.transactions);
  const bosses = computeBosses(txns);
  const beaten = bosses.filter((b) => b.state === 'winning').length;

  return (
    <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: 48, gap: space.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 28, color: colors.ink }}>BATTLES</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft }}>Beat your 3-month median</Text>
        </View>
        <NeoBox bg={colors.ink} borderColor={colors.ink} offset={4} contentStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text style={{ fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.6, color: colors.white, textTransform: 'uppercase' }}>Bosses beaten {beaten} / {bosses.length}</Text>
        </NeoBox>
      </View>

      {bosses.map((b) => (
        <BossCard key={b.categoryId} b={b} />
      ))}

      <NeoBox bg={colors.surfaceLow} offset={2} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md }}>
        <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft }}>
          Fixed bills (Rent, Utilities) aren't battles — they're just kept paid.
        </Text>
      </NeoBox>
    </ScrollView>
  );
}
