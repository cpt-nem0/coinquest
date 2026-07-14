import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, space } from '../theme';
import NeoBox from '../components/NeoBox';
import MoneyText from '../components/MoneyText';
import { useStore } from '../store';
import { bossDetail } from '../domain/engines';
import { bossIcon } from '../domain/bossIcons';

function HpBar({ ratio, color }: { ratio: number; color: string }) {
  const N = 16;
  const filled = Math.max(1, Math.round(Math.min(1, ratio) * N));
  return (
    <View style={{ flexDirection: 'row', flex: 1, gap: 2 }}>
      {Array.from({ length: N }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 18, borderWidth: 1, borderColor: colors.ink, backgroundColor: i < filled ? color : colors.track }} />
      ))}
    </View>
  );
}

function StatTile({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <NeoBox bg={colors.white} style={{ flex: 1 }} contentStyle={{ padding: 14, gap: 6 }}>
      <Text style={{ fontFamily: fonts.label, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.inkSoft }}>{label}</Text>
      <Text style={{ fontFamily: fonts.money, fontSize: 22, color }}>{value}</Text>
    </NeoBox>
  );
}

function timeLabel(ts: number) {
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function tipsFor(state: string, deltaMajor: string, currency: string): string[] {
  if (state === 'winning')
    return ['You’re under your usual — keep the streak alive.', 'Bank the difference into your Savings Nest.'];
  if (state === 'scouting')
    return ['Not enough history yet — keep logging to lock your median.', 'One clean month sets the bar to beat.'];
  return [
    `Trim about ${deltaMajor} here to drop below your median.`,
    'Wait 24h before the next buy in this category.',
    'Skip one order this week to flip the battle.',
  ];
}

export default function BossDetailScreen({ categoryId, onClose }: { categoryId: string; onClose: () => void }) {
  const txns = useStore((s) => s.transactions);
  const currency = useStore((s) => s.currency);
  const detail = bossDetail(txns, categoryId);

  if (!detail) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.paper }}>
        <View style={{ backgroundColor: colors.ink, paddingHorizontal: space.md, paddingTop: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable onPress={onClose} hitSlop={10}><Ionicons name="chevron-back" size={22} color={colors.white} /></Pressable>
          <Text style={{ fontFamily: fonts.display, fontSize: 22, letterSpacing: 1, color: colors.white }}>BOSS</Text>
        </View>
        <View style={{ padding: space.lg }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft }}>This boss has no activity this month.</Text>
        </View>
      </View>
    );
  }

  const winning = detail.state === 'winning';
  const c = winning ? colors.gain : detail.state === 'scouting' ? colors.brand : colors.amber;
  const stateLabel = winning ? 'WINNING' : detail.state === 'scouting' ? 'SCOUTING' : 'BOSS AHEAD';
  const ratio = detail.medianMinor > 0 ? detail.spentMinor / detail.medianMinor : 1;

  const deltaMajor = `${currency === 'INR' ? '₹' : ''}${Math.abs(detail.deltaMinor / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const tips = tipsFor(detail.state, deltaMajor, currency);

  // trend chart scaling
  const chartH = 120;
  const maxVal = Math.max(detail.medianMinor, ...detail.history.map((h) => h.total), 1);
  const medianY = (detail.medianMinor / maxVal) * chartH;

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      {/* header */}
      <View style={{ backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: space.md, paddingTop: 16, paddingBottom: 16 }}>
        <Pressable onPress={onClose} hitSlop={10}><Ionicons name="chevron-back" size={22} color={colors.white} /></Pressable>
        <Text style={{ fontFamily: fonts.display, fontSize: 22, letterSpacing: 1, color: colors.white }}>BOSS</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: 48, gap: space.lg }}>
        {/* hero card */}
        <NeoBox bg={colors.white} borderColor={c} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 66, height: 66, borderWidth: 3, borderColor: colors.ink, backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {bossIcon(categoryId) ? (
                <Image source={bossIcon(categoryId)} style={{ width: 62, height: 62 }} resizeMode="cover" />
              ) : (
                <Text style={{ fontSize: 30 }}>👾</Text>
              )}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: c }}>{stateLabel}</Text>
              <Text style={{ fontFamily: fonts.display, fontSize: 22, textTransform: 'uppercase', color: colors.ink }}>{detail.name} Boss</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.label, fontSize: 12, fontWeight: '700', color: colors.ink, marginRight: 10 }}>HP</Text>
            <HpBar ratio={ratio} color={c} />
          </View>
        </NeoBox>

        {/* stat tiles */}
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <StatTile label="Spent this month" value={<MoneyText amountMinor={detail.spentMinor} currency={currency} size={22} color={c} />} color={c} />
          <StatTile label="Your median" value={<MoneyText amountMinor={detail.medianMinor} currency={currency} size={22} color={colors.ink} />} color={colors.ink} />
        </View>

        {/* callout */}
        <View style={{ alignSelf: 'stretch', backgroundColor: winning ? '#e4f3ea' : detail.state === 'scouting' ? colors.surfaceLow : '#fbeccf', borderWidth: 3, borderColor: colors.ink, borderLeftWidth: 6, borderLeftColor: c, padding: space.md }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: '700', color: colors.ink }}>
            {winning
              ? `You’re ${deltaMajor} under your usual — keep it up!`
              : detail.state === 'scouting'
              ? 'Building your median — one more month locks the target.'
              : `You’re ${deltaMajor} over your usual — ease off to win.`}
          </Text>
        </View>

        {/* 3-month trend */}
        <NeoBox bg={colors.white} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: space.md }}>
          <Text style={{ fontFamily: fonts.heading, fontSize: 15, color: colors.ink }}>{detail.history.length}-MONTH TREND</Text>
          <View style={{ height: chartH, flexDirection: 'row', alignItems: 'flex-end', gap: 12, position: 'relative' }}>
            {/* median reference line */}
            {detail.medianMinor > 0 && (
              <View style={{ position: 'absolute', left: 0, right: 0, bottom: medianY, height: 0, borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.inkSoft, zIndex: 2 }} />
            )}
            {detail.history.map((h) => {
              const bh = Math.max(4, (h.total / maxVal) * chartH);
              const bc = h.isCurrent ? c : colors.track;
              return (
                <View key={h.mk} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: chartH }}>
                  <Text style={{ fontFamily: fonts.moneyMed, fontSize: 9, color: h.isCurrent ? c : colors.inkSoft, marginBottom: 3 }}>{Math.round(h.total / 100 / 1000)}k</Text>
                  <View style={{ width: '78%', height: bh, backgroundColor: bc, borderWidth: 2, borderColor: colors.ink }} />
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {detail.history.map((h) => (
              <Text key={h.mk} style={{ flex: 1, textAlign: 'center', fontFamily: fonts.label, fontSize: 10, letterSpacing: 0.5, color: h.isCurrent ? colors.ink : colors.inkSoft }}>{h.label}</Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 16, borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.inkSoft }} />
            <Text style={{ fontFamily: fonts.label, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.inkSoft }}>Your median ({detail.history.length}-mo)</Text>
          </View>
        </NeoBox>

        {/* this month's transactions */}
        <View style={{ gap: space.sm }}>
          <Text style={{ fontFamily: fonts.heading, fontSize: 15, color: colors.ink, paddingHorizontal: 2 }}>THIS MONTH</Text>
          <NeoBox bg={colors.white} style={{ alignSelf: 'stretch' }} contentStyle={{ paddingHorizontal: space.md }}>
            {detail.monthTxns.length === 0 ? (
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, paddingVertical: 16 }}>Nothing logged here yet this month.</Text>
            ) : (
              detail.monthTxns.map((t, i) => (
                <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.track }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={{ fontFamily: fonts.heading, fontSize: 15, color: colors.ink }}>{t.merchant}</Text>
                    <Text style={{ fontFamily: fonts.moneyMed, fontSize: 10, color: colors.inkSoft, marginTop: 2 }}>{timeLabel(t.ts)} • {t.source.toUpperCase()}</Text>
                  </View>
                  <MoneyText amountMinor={t.amountMinor} currency={t.currency} kind="debit" size={15} />
                </View>
              ))
            )}
          </NeoBox>
        </View>

        {/* how to win */}
        <View style={{ gap: space.sm }}>
          <Text style={{ fontFamily: fonts.heading, fontSize: 15, color: colors.ink, paddingHorizontal: 2 }}>HOW TO WIN</Text>
          {tips.map((tip, i) => (
            <NeoBox key={i} bg={colors.surfaceLow} offset={2} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderLeftWidth: 5, borderLeftColor: c }}>
              <Ionicons name={winning ? 'checkmark-circle' : 'bulb'} size={18} color={c} />
              <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.ink }}>{tip}</Text>
            </NeoBox>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
