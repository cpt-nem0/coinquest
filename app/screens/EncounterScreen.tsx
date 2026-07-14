import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { colors, fonts, space } from '../theme';
import NeoBox from '../components/NeoBox';
import MoneyText from '../components/MoneyText';
import PixelCoin from '../components/PixelCoin';
import { useStore, REVIEW_REWARD_COINS } from '../store';
import { CATEGORIES, INCOME } from '../domain/categories';
import { WorthRating } from '../domain/types';

const PICKABLE = CATEGORIES.filter((c) => c.id !== INCOME);

function WorthButton({ emoji, label, fill, onDark, selected, onPress }: { emoji: string; label: string; fill: string; onDark: boolean; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={{ flex: 1 }} onPress={onPress}>
      <NeoBox bg={fill} borderColor={selected ? colors.brand : colors.ink} offset={selected ? 0 : 4} style={{ alignSelf: 'stretch' }} contentStyle={{ paddingVertical: 14, alignItems: 'center', gap: 4, borderWidth: selected ? 4 : 3 }}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
        <Text style={{ fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: onDark ? colors.white : colors.ink }}>{label}</Text>
      </NeoBox>
    </Pressable>
  );
}

export default function EncounterScreen() {
  const txns = useStore((s) => s.transactions);
  const review = useStore((s) => s.reviewTransaction);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const queue = txns.filter((t) => t.status === 'needs_review' && !skipped.has(t.id));
  const current = queue[0];
  const [cat, setCat] = useState('other');
  const [worth, setWorth] = useState<WorthRating | undefined>(undefined);

  useEffect(() => {
    if (current) {
      setCat(current.categoryId);
      setWorth(undefined);
    }
  }, [current?.id]);

  if (!current) {
    return (
      <ScrollView contentContainerStyle={{ padding: space.md, gap: space.md, alignItems: 'center', paddingTop: 60 }}>
        <PixelCoin size={72} />
        <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.ink, textAlign: 'center' }}>All caught up!</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.inkSoft, textAlign: 'center', maxWidth: 280 }}>
          No expenses need review. New spends appear here to confirm — reviewing earns +{REVIEW_REWARD_COINS} ✦ coins each.
        </Text>
      </ScrollView>
    );
  }

  const save = () => review(current.id, cat, worth ?? 'meh');
  const skip = () => setSkipped((s) => new Set(s).add(current.id));
  const dateStr = new Date(current.ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: 48, gap: space.lg }}>
      {/* arcade banner */}
      <NeoBox bg={colors.ink} borderColor={colors.ink} offset={4} style={{ alignSelf: 'stretch' }} contentStyle={{ paddingVertical: 14, alignItems: 'center' }}>
        <Text style={{ fontFamily: fonts.heading, fontSize: 18, letterSpacing: 2, fontStyle: 'italic', color: colors.white, textAlign: 'center' }}>A WILD EXPENSE APPEARED!</Text>
      </NeoBox>

      {/* sprite */}
      <View style={{ alignItems: 'center', paddingVertical: 4 }}>
        <PixelCoin size={110} />
      </View>

      {/* enemy card */}
      <NeoBox bg={colors.white} offset={4} style={{ alignSelf: 'stretch', marginTop: 8 }} contentStyle={{ padding: 20, position: 'relative' }}>
        <View style={{ position: 'absolute', top: -16, left: -2, backgroundColor: colors.reward, borderWidth: 3, borderColor: colors.ink, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.ink }}>New Alert</Text>
        </View>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, textTransform: 'uppercase', color: colors.ink }}>{current.merchant}</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, marginTop: 4 }}>{dateStr} · via {current.source}</Text>
        <View style={{ borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.ink, marginVertical: 16 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ fontFamily: fonts.label, fontSize: 14, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.inkSoft }}>Cost</Text>
          <MoneyText amountMinor={current.amountMinor} currency={current.currency} kind={current.direction} size={30} />
        </View>
      </NeoBox>

      {/* worth it */}
      <View style={{ gap: space.sm }}>
        <Text style={{ fontFamily: fonts.heading, fontSize: 18, textAlign: 'center', textTransform: 'uppercase', color: colors.ink }}>Worth it?</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <WorthButton emoji="😋" label="Worth it" fill={colors.gain} onDark selected={worth === 'worth'} onPress={() => setWorth('worth')} />
          <WorthButton emoji="😐" label="Meh" fill={colors.white} onDark={false} selected={worth === 'meh'} onPress={() => setWorth('meh')} />
          <WorthButton emoji="😩" label="Regret" fill={colors.loss} onDark selected={worth === 'regret'} onPress={() => setWorth('regret')} />
        </View>
      </View>

      {/* category */}
      <View style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft }}>Category</Text>
          <Text style={{ fontFamily: fonts.moneyMed, fontSize: 11, color: colors.inkSoft }}>SELECT ONE</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {PICKABLE.map((c) => {
            const on = cat === c.id;
            return (
              <Pressable key={c.id} onPress={() => setCat(c.id)}>
                <NeoBox bg={on ? colors.reward : colors.white} offset={2} contentStyle={{ paddingHorizontal: 12, paddingVertical: 7 }}>
                  <Text style={{ fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.ink }}>{c.flavor}</Text>
                </NeoBox>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* footer */}
      <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, textAlign: 'center' }}>Reviewing earns +{REVIEW_REWARD_COINS} ✦ coins</Text>
      <Pressable onPress={save}>
        <NeoBox bg={colors.brand} offset={6} style={{ alignSelf: 'stretch' }} contentStyle={{ paddingVertical: 18, alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.heading, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', color: colors.white }}>Save</Text>
        </NeoBox>
      </Pressable>
      <Pressable onPress={skip} style={{ alignItems: 'center', paddingVertical: 4 }}>
        <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.inkSoft }}>Skip encounter</Text>
      </Pressable>
    </ScrollView>
  );
}
