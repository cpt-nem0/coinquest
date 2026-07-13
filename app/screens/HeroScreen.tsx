import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors, fonts, space } from '../theme';
import NeoBox from '../components/NeoBox';
import SegmentedBar from '../components/SegmentedBar';
import PixelCoin from '../components/PixelCoin';
import { useStore } from '../store';
import { computeBosses, moneyHealth, healthColor } from '../domain/engines';

function StatTile({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <NeoBox style={{ flex: 1 }} contentStyle={{ padding: space.md, gap: 4, minHeight: 72 }}>
      <Text style={{ fontFamily: fonts.money, fontSize: 22, color: color ?? colors.ink }}>{value}</Text>
      <Text style={{ fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.8, color: colors.inkSoft, textTransform: 'uppercase' }}>
        {label}
      </Text>
    </NeoBox>
  );
}

export default function HeroScreen() {
  const txns = useStore((s) => s.transactions);
  const budget = useStore((s) => s.budgetMinor);
  const player = useStore((s) => s.player);
  const bosses = computeBosses(txns);
  const beaten = bosses.filter((b) => b.state === 'winning').length;
  const health = moneyHealth(txns, budget);

  return (
    <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: 40, gap: space.md }}>
      {/* character card */}
      <NeoBox style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <View style={{ width: 64, height: 64, borderWidth: 3, borderColor: colors.ink, backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center' }}>
            <PixelCoin size={40} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.ink }}>Player One</Text>
            <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1, color: colors.brand, textTransform: 'uppercase' }}>
              The Thrifty · Lvl {player.level}
            </Text>
          </View>
        </View>
        <View style={{ gap: 4 }}>
          <Text style={{ fontFamily: fonts.moneyMed, fontSize: 12, color: colors.inkSoft }}>
            XP {player.xp.toLocaleString('en-IN')} / {player.xpNext.toLocaleString('en-IN')}
          </Text>
          <SegmentedBar value={player.xp / player.xpNext} color={colors.reward} segments={12} height={14} />
        </View>
      </NeoBox>

      {/* stat tiles — derived from data */}
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <StatTile label="Money Health" value={`${health}%`} color={healthColor(health, colors)} />
        <StatTile label="Day Streak" value={`${player.streak}`} color={colors.reward} />
      </View>
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <StatTile label="Bosses Beaten" value={`${beaten}/${bosses.length}`} color={colors.gain} />
        <StatTile label="Coins" value={player.coins.toLocaleString('en-IN')} color={colors.reward} />
      </View>

      <NeoBox style={{ alignSelf: 'stretch' }} bg={colors.surfaceLow} contentStyle={{ padding: space.md, gap: 4 }}>
        <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>Perks</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink }}>Savvy Shopper · −10% impulse-buy damage</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink }}>Interest Shield · +0.5 XP / hour</Text>
      </NeoBox>
    </ScrollView>
  );
}
