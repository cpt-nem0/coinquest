import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors, fonts, space } from '../theme';
import NeoBox from '../components/NeoBox';
import Chip from '../components/Chip';
import MoneyText from '../components/MoneyText';
import SegmentedBar from '../components/SegmentedBar';
import { useStore } from '../store';
import { computeBosses, Boss } from '../domain/engines';

function BossCard({ b }: { b: Boss }) {
  const winning = b.state === 'winning';
  const c = winning ? colors.gain : colors.amber;
  // progress = spent / median, capped for the bar
  const ratio = b.medianMinor > 0 ? b.spentMinor / b.medianMinor : 1;
  return (
    <NeoBox style={{ alignSelf: 'stretch' }} borderColor={c} contentStyle={{ padding: space.md, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: fonts.heading, fontSize: 18, color: colors.ink }}>{b.name} Boss</Text>
        <Chip label={winning ? 'Winning' : 'Boss ahead'} color={c} filled={winning} />
      </View>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft }}>Spent</Text>
          <MoneyText amountMinor={b.spentMinor} size={13} />
        </View>
        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft }}>Median</Text>
          <MoneyText amountMinor={b.medianMinor} size={13} />
        </View>
      </View>
      <SegmentedBar value={Math.min(ratio, 1)} color={c} segments={10} height={14} />
    </NeoBox>
  );
}

export default function BattlesScreen() {
  const txns = useStore((s) => s.transactions);
  const bosses = computeBosses(txns);
  const beaten = bosses.filter((b) => b.state === 'winning').length;

  return (
    <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: 40, gap: space.md }}>
      <View style={{ gap: 2 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 28, color: colors.ink }}>Battles</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft }}>Beat your 3-month median.</Text>
      </View>

      <NeoBox offset={0} contentStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}>
        <Text style={{ fontFamily: fonts.label, fontSize: 13, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>
          Bosses beaten {beaten} / {bosses.length}
        </Text>
      </NeoBox>

      {bosses.map((b) => (
        <BossCard key={b.categoryId} b={b} />
      ))}

      <NeoBox style={{ alignSelf: 'stretch' }} bg={colors.surfaceLow} contentStyle={{ padding: space.md }}>
        <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft }}>
          Fixed bills (Rent, Utilities) aren't battles — they're just kept paid.
        </Text>
      </NeoBox>
    </ScrollView>
  );
}
