import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, space } from '../theme';
import NeoBox from '../components/NeoBox';
import PixelCoin from '../components/PixelCoin';
import { useStore } from '../store';
import { computeBosses, moneyHealth, healthColor } from '../domain/engines';

function StatTile({ label, value, color, bottom }: { label: string; value: string; color: string; bottom: React.ReactNode }) {
  return (
    <NeoBox bg={colors.white} style={{ flex: 1 }} contentStyle={{ padding: 12, minHeight: 108, justifyContent: 'space-between' }}>
      <View>
        <Text style={{ fontFamily: fonts.label, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color, marginBottom: 4 }}>{label}</Text>
        <Text style={{ fontFamily: fonts.money, fontSize: 24, color }}>{value}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>{bottom}</View>
    </NeoBox>
  );
}

const BADGES = [
  { icon: '🏆', label: 'No-Spend Week', earned: true },
  { icon: '💰', label: 'First Save', earned: true },
  { icon: '⚔️', label: 'Boss Slayer', earned: true },
  { icon: '📊', label: 'Budget Master', earned: false },
  { icon: '🔥', label: 'Level 10', earned: true },
  { icon: '👑', label: 'Level 20', earned: false },
];

export default function HeroScreen() {
  const txns = useStore((s) => s.transactions);
  const budget = useStore((s) => s.budgetMinor);
  const player = useStore((s) => s.player);
  const bosses = computeBosses(txns);
  const beaten = bosses.filter((b) => b.state === 'winning').length;
  const health = moneyHealth(txns, budget);
  const hColor = healthColor(health, colors);
  const xpRatio = Math.min(1, player.xp / player.xpNext);

  return (
    <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: 48, gap: space.lg }}>
      {/* character card */}
      <NeoBox bg={colors.white} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: space.md }}>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <NeoBox bg={colors.surfaceHigh} offset={4} contentStyle={{ width: 84, height: 84, alignItems: 'center', justifyContent: 'center' }}>
            <PixelCoin size={52} />
          </NeoBox>
          <View style={{ flex: 1, justifyContent: 'center', gap: 4 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.ink }}>PLAYER ONE</Text>
            <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(91,61,240,0.12)', paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.brand }}>The Thrifty</Text>
            </View>
            <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 0.5, color: colors.ink }}>LEVEL {player.level}</Text>
          </View>
        </View>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: fonts.label, fontSize: 10, letterSpacing: 0.5, color: colors.inkSoft, textTransform: 'uppercase' }}>XP Progress</Text>
            <Text style={{ fontFamily: fonts.money, fontSize: 11, color: colors.inkSoft }}>{player.xp.toLocaleString('en-IN')} / {player.xpNext.toLocaleString('en-IN')}</Text>
          </View>
          <View style={{ height: 22, borderWidth: 3, borderColor: colors.ink, backgroundColor: colors.surface, flexDirection: 'row' }}>
            <View style={{ width: `${xpRatio * 100}%`, backgroundColor: colors.reward, borderRightWidth: 3, borderRightColor: colors.ink }} />
          </View>
        </View>
      </NeoBox>

      {/* stat grid */}
      <View style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <StatTile label="Money Health" value={`${health}%`} color={hColor} bottom={
            <View style={{ width: '100%', height: 12, borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.surface }}>
              <View style={{ height: '100%', width: `${health}%`, backgroundColor: hColor }} />
            </View>
          } />
          <StatTile label="Day Streak" value={`${player.streak}`} color={colors.reward} bottom={<Ionicons name="flame" size={30} color={colors.reward} />} />
        </View>
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <StatTile label="Coins" value={player.coins.toLocaleString('en-IN')} color={colors.ink} bottom={<PixelCoin size={34} />} />
          <StatTile label="Bosses Beaten" value={`${beaten}`} color={colors.ink} bottom={<Ionicons name="flash" size={30} color={colors.ink} />} />
        </View>
      </View>

      {/* badges */}
      <NeoBox bg={colors.white} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: space.md }}>
        <Text style={{ fontFamily: fonts.heading, fontSize: 16, color: colors.ink }}>BADGES</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 }}>
          {BADGES.map((b) => (
            <View key={b.label} style={{ alignItems: 'center', width: '30%', gap: 5, opacity: b.earned ? 1 : 0.45 }}>
              <View style={{ width: 56, height: 56, borderWidth: 3, borderColor: colors.ink, backgroundColor: b.earned ? colors.surfaceLow : colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 26 }}>{b.earned ? b.icon : '🔒'}</Text>
              </View>
              <Text numberOfLines={1} style={{ fontFamily: fonts.label, fontSize: 9, letterSpacing: 0.3, textTransform: 'uppercase', color: colors.inkSoft, textAlign: 'center' }}>{b.label}</Text>
            </View>
          ))}
        </View>
      </NeoBox>

      {/* perks */}
      <NeoBox bg={colors.surfaceLow} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: 6 }}>
        <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>Active Perks</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink }}>Savvy Shopper · −10% impulse-buy damage</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink }}>Interest Shield · +0.5 XP / hour</Text>
      </NeoBox>
    </ScrollView>
  );
}
