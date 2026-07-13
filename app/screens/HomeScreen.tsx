import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors, fonts, space } from '../theme';
import NeoBox from '../components/NeoBox';
import NeoButton from '../components/NeoButton';
import SegmentedBar from '../components/SegmentedBar';
import Chip from '../components/Chip';
import MoneyText from '../components/MoneyText';
import { useStore } from '../store';
import { homeSummary, healthColor } from '../domain/engines';
import { TabKey } from '../components/TabBar';

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontFamily: fonts.label, fontSize: 13, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>
      {children}
    </Text>
  );
}

export default function HomeScreen({ onNavigate }: { onNavigate?: (t: TabKey) => void }) {
  const txns = useStore((s) => s.transactions);
  const budget = useStore((s) => s.budgetMinor);
  const s = homeSummary(txns, budget);
  const hColor = healthColor(s.health, colors);
  const boss = s.topBoss;
  const bossWinning = boss?.state === 'winning';
  const bossColor = boss ? (boss.state === 'winning' ? colors.gain : colors.amber) : colors.ink;

  return (
    <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: 40, gap: space.md }}>
      {/* real money — the hero */}
      <NeoBox style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: space.sm }}>
        <Label>Spent in {s.monthLabel}</Label>
        <MoneyText amountMinor={s.spentMinor} size={40} />
        <Text style={{ fontFamily: fonts.moneyMed, fontSize: 14, color: colors.inkSoft }}>
          of ₹{(budget / 100).toLocaleString('en-IN')} budget · {Math.round(s.budgetRatio * 100)}% used
        </Text>
        <SegmentedBar
          value={s.budgetRatio}
          color={s.budgetRatio > 1 ? colors.loss : colors.amber}
          segments={12}
          height={18}
        />
      </NeoBox>

      {/* money health — color follows the score */}
      <NeoBox style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: space.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Label>Money Health</Label>
          <Text style={{ fontFamily: fonts.money, fontSize: 16, color: hColor }}>{s.health}%</Text>
        </View>
        <SegmentedBar value={s.health / 100} color={hColor} segments={12} height={18} />
      </NeoBox>

      {/* active boss (top spend category) */}
      {boss && (
        <NeoBox style={{ alignSelf: 'stretch' }} borderColor={bossColor} contentStyle={{ padding: space.md, gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.heading, fontSize: 20, color: colors.ink }}>{boss.name} Boss</Text>
            <Chip label={bossWinning ? 'Winning' : 'Boss ahead'} color={bossColor} filled={bossWinning} />
          </View>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft }}>Spent</Text>
              <MoneyText amountMinor={boss.spentMinor} size={14} />
            </View>
            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft }}>Median</Text>
              <MoneyText amountMinor={boss.medianMinor} size={14} />
            </View>
          </View>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: bossColor }}>
            {bossWinning ? "You're under your median — keep it up!" : 'Over your median — ease off to win.'}
          </Text>
          <NeoButton label="View Battles" variant="primary" style={{ marginTop: 6 }} onPress={() => onNavigate?.('battles')} />
        </NeoBox>
      )}

      <View style={{ gap: space.sm }}>
        <NeoButton label="Log a spend" variant="reward" onPress={() => onNavigate?.('add')} />
        <NeoButton label="Open Ledger" variant="primary" onPress={() => onNavigate?.('ledger')} />
      </View>
    </ScrollView>
  );
}
