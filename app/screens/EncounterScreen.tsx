import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { colors, fonts, space } from '../theme';
import NeoBox from '../components/NeoBox';
import NeoButton from '../components/NeoButton';
import MoneyText from '../components/MoneyText';
import PixelCoin from '../components/PixelCoin';
import { useStore, REVIEW_REWARD_COINS } from '../store';
import { CATEGORIES, INCOME } from '../domain/categories';
import { WorthRating } from '../domain/types';

const PICKABLE = CATEGORIES.filter((c) => c.id !== INCOME);

function WorthOption({
  emoji,
  label,
  fill,
  onDark,
  selected,
  onPress,
}: {
  emoji: string;
  label: string;
  fill: string;
  onDark: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <View
        style={{
          borderWidth: 3,
          borderColor: colors.ink,
          backgroundColor: selected ? fill : colors.paper,
          paddingVertical: 12,
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
        <Text
          style={{
            fontFamily: fonts.label,
            fontSize: 11,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: selected ? (onDark ? colors.paper : colors.ink) : colors.ink,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function CatChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          borderWidth: 2,
          borderColor: selected ? colors.brand : colors.ink,
          backgroundColor: selected ? colors.brand : 'transparent',
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.label,
            fontSize: 12,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: selected ? colors.paper : colors.ink,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export default function EncounterScreen() {
  const txns = useStore((s) => s.transactions);
  const review = useStore((s) => s.reviewTransaction);

  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const queue = txns.filter((t) => t.status === 'needs_review' && !skipped.has(t.id));
  const current = queue[0];

  const [cat, setCat] = useState<string>('other');
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
        <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.inkSoft, textAlign: 'center', maxWidth: 260 }}>
          No expenses need review. New spends appear here to confirm — reviewing earns +{REVIEW_REWARD_COINS} ✦ coins each.
        </Text>
      </ScrollView>
    );
  }

  const save = () => review(current.id, cat, worth ?? 'meh');
  const skip = () => setSkipped((s) => new Set(s).add(current.id));

  return (
    <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: 40, gap: space.md }}>
      {/* banner */}
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.brand, textAlign: 'center' }}>
          A wild expense appeared!
        </Text>
        <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1, color: colors.inkSoft }}>
          {queue.length} to review
        </Text>
      </View>

      {/* the expense */}
      <NeoBox style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: 10, alignItems: 'center' }}>
        <PixelCoin size={56} />
        <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.ink }}>{current.merchant}</Text>
        <MoneyText amountMinor={current.amountMinor} currency={current.currency} kind={current.direction} size={30} />
        <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft }}>
          {new Date(current.ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · via {current.source}
        </Text>
      </NeoBox>

      {/* worth it? */}
      <Text style={{ fontFamily: fonts.label, fontSize: 13, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>
        Worth it?
      </Text>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <WorthOption emoji="😋" label="Worth it" fill={colors.gain} onDark selected={worth === 'worth'} onPress={() => setWorth('worth')} />
        <WorthOption emoji="😐" label="Meh" fill={colors.surfaceHigh} onDark={false} selected={worth === 'meh'} onPress={() => setWorth('meh')} />
        <WorthOption emoji="😩" label="Regret" fill={colors.loss} onDark selected={worth === 'regret'} onPress={() => setWorth('regret')} />
      </View>

      {/* category */}
      <Text style={{ fontFamily: fonts.label, fontSize: 13, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>
        Category
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {PICKABLE.map((c) => (
          <CatChip key={c.id} label={c.name} selected={cat === c.id} onPress={() => setCat(c.id)} />
        ))}
      </View>

      <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, textAlign: 'center', marginTop: 2 }}>
        Reviewing earns +{REVIEW_REWARD_COINS} ✦ coins
      </Text>

      <View style={{ gap: space.sm }}>
        <NeoButton label="Save" variant="primary" onPress={save} />
        <Pressable onPress={skip} style={{ alignItems: 'center', paddingVertical: 6 }}>
          <Text style={{ fontFamily: fonts.label, fontSize: 13, letterSpacing: 0.5, color: colors.inkSoft, textTransform: 'uppercase' }}>
            Skip for now
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
