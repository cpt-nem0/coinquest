import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors, fonts, space } from '../theme';
import NeoBox from '../components/NeoBox';
import NeoButton from '../components/NeoButton';
import SegmentedBar from '../components/SegmentedBar';
import Chip from '../components/Chip';
import MoneyText from '../components/MoneyText';

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontFamily: fonts.label, fontSize: 13, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>
      {children}
    </Text>
  );
}
function H3({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: fonts.heading, fontSize: 20, color: colors.ink }}>{children}</Text>;
}

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: 40, gap: space.md }}>
      <NeoBox style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: space.sm }}>
        <Label>Spent this month</Label>
        <MoneyText amountMinor={4450000} size={40} />
        <Text style={{ fontFamily: fonts.moneyMed, fontSize: 14, color: colors.inkSoft }}>of ₹50,000 budget</Text>
        <SegmentedBar value={0.89} color={colors.amber} segments={12} height={18} />
      </NeoBox>

      <NeoBox style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: space.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Label>Money Health</Label>
          <Chip label="+6 this week" color={colors.gain} />
        </View>
        <SegmentedBar value={0.82} color={colors.gain} segments={12} height={18} />
      </NeoBox>

      <NeoBox style={{ alignSelf: 'stretch' }} borderColor={colors.gain} contentStyle={{ padding: space.md, gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <H3>Food Boss</H3>
          <Chip label="Winning" color={colors.gain} filled />
        </View>
        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft }}>Spent</Text>
            <MoneyText amountMinor={1248000} size={14} />
          </View>
          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft }}>Median</Text>
            <MoneyText amountMinor={1320000} size={14} />
          </View>
        </View>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.gain }}>You're under — keep it up!</Text>
        <NeoButton label="View Battle" variant="primary" style={{ marginTop: 6 }} />
      </NeoBox>

      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        <Chip label="Feasts" color={colors.brand} />
        <Chip label="Loot" color={colors.reward} filled />
        <Chip label="Travel" color={colors.inkSoft} />
      </View>
      <View style={{ gap: space.sm }}>
        <NeoButton label="Claim Reward" variant="reward" />
        <NeoButton label="Log a spend" variant="primary" />
      </View>
    </ScrollView>
  );
}
