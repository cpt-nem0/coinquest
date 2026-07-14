import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, space } from '../theme';
import NeoBox from '../components/NeoBox';
import SegmentedBar from '../components/SegmentedBar';
import MoneyText from '../components/MoneyText';
import { useStore } from '../store';
import { homeSummary, healthColor } from '../domain/engines';
import { TabKey } from '../components/TabBar';

const BOSS_EMOJI: Record<string, string> = {
  food: '🍔', shopping: '🛍️', transport: '🚕', groceries: '🛒', entertainment: '🎬', health: '💊',
};

function H3({ children, color }: { children: React.ReactNode; color?: string }) {
  return <Text style={{ fontFamily: fonts.heading, fontSize: 18, color: color ?? colors.ink }}>{children}</Text>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>{children}</Text>;
}

function QuestRow({ id, title, reward, done }: { id: string; title: string; reward: number; done: boolean }) {
  const toggle = useStore((s) => s.toggleQuest);
  return (
    <Pressable onPress={() => toggle(id)}>
      <NeoBox bg={colors.white} offset={4} style={{ alignSelf: 'stretch', opacity: done ? 0.55 : 1 }} contentStyle={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: space.md }}>
        <View style={{ width: 24, height: 24, borderWidth: 3, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
          {done && <Text style={{ fontFamily: fonts.heading, fontSize: 16, color: colors.ink, lineHeight: 18 }}>✕</Text>}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.heading, fontSize: 14, textTransform: 'uppercase', color: done ? colors.inkSoft : colors.ink, textDecorationLine: done ? 'line-through' : 'none' }}>{title}</Text>
          <Text style={{ fontFamily: fonts.money, fontSize: 12, color: colors.reward, marginTop: 2 }}>+{reward} ✦</Text>
        </View>
      </NeoBox>
    </Pressable>
  );
}

export default function HomeScreen({ onNavigate }: { onNavigate?: (t: TabKey) => void }) {
  const txns = useStore((s) => s.transactions);
  const budget = useStore((s) => s.budgetMinor);
  const quests = useStore((s) => s.quests);
  const s = homeSummary(txns, budget);
  const hColor = healthColor(s.health, colors);
  const boss = s.topBoss;
  const bossWinning = boss?.state === 'winning';
  const bossColor = boss ? (bossWinning ? colors.gain : colors.amber) : colors.ink;
  const pct = Math.round(s.budgetRatio * 100);

  return (
    <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: 48, gap: space.lg }}>
      {/* Spend tracker */}
      <NeoBox bg={colors.white} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: 20, gap: space.sm }}>
        <Label>Spent this month</Label>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <MoneyText amountMinor={s.spentMinor} size={40} />
          <Text style={{ fontFamily: fonts.moneyMed, fontSize: 14, color: colors.inkSoft }}>/ ₹{(budget / 100).toLocaleString('en-IN')}</Text>
        </View>
        <SegmentedBar value={s.budgetRatio} color={s.budgetRatio > 1 ? colors.loss : colors.reward} segments={12} height={16} />
        <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, fontStyle: 'italic' }}>
          {pct}% of budget consumed.{pct >= 80 ? ' Danger zone approaching!' : ''}
        </Text>
      </NeoBox>

      {/* Money Health */}
      <NeoBox bg={colors.surfaceLow} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: space.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <H3>MONEY HEALTH</H3>
          <View style={{ backgroundColor: hColor, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontFamily: fonts.money, fontSize: 12, color: colors.white }}>{s.health}%</Text>
          </View>
        </View>
        <SegmentedBar value={s.health / 100} color={hColor} segments={12} height={22} />
      </NeoBox>

      {/* Boss */}
      {boss && (
        <NeoBox bg={colors.white} borderColor={bossColor} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: 20, gap: space.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <H3 color={bossColor}>{boss.name.toUpperCase()} BOSS</H3>
              <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 4, lineHeight: 18 }}>
                Spent <MoneyText amountMinor={boss.spentMinor} size={12} />{'\n'}
                Typical <MoneyText amountMinor={boss.medianMinor} size={12} /> (3-mo median)
              </Text>
            </View>
            <View style={{ width: 56, height: 56, borderWidth: 3, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceLow }}>
              <Text style={{ fontSize: 28 }}>{BOSS_EMOJI[boss.categoryId] ?? '👾'}</Text>
            </View>
          </View>
          <View style={{ backgroundColor: bossWinning ? 'rgba(18,163,90,0.12)' : 'rgba(232,140,0,0.12)', borderLeftWidth: 4, borderLeftColor: bossColor, padding: 10 }}>
            <Text style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: '700', color: bossColor }}>
              {bossWinning ? "You're under — keep it up!" : 'Over your median — ease off to win.'}
            </Text>
          </View>
          <Pressable onPress={() => onNavigate?.('battles')}>
            <NeoBox bg={colors.brand} offset={4} style={{ alignSelf: 'stretch' }} contentStyle={{ paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Text style={{ fontFamily: fonts.heading, fontSize: 15, letterSpacing: 1, textTransform: 'uppercase', color: colors.white }}>View Battle</Text>
              <Ionicons name="flash" size={16} color={colors.white} />
            </NeoBox>
          </Pressable>
        </NeoBox>
      )}

      {/* Daily Quests */}
      <View style={{ gap: space.sm }}>
        <Text style={{ fontFamily: fonts.heading, fontSize: 18, color: colors.ink, paddingHorizontal: 2 }}>DAILY QUESTS</Text>
        {quests.map((q) => (
          <QuestRow key={q.id} id={q.id} title={q.title} reward={q.reward} done={q.done} />
        ))}
      </View>
    </ScrollView>
  );
}
