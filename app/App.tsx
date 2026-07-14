import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';

import { colors, fonts, space } from './theme';
import PixelCoin from './components/PixelCoin';
import NeoBox from './components/NeoBox';
import TabBar, { TabKey } from './components/TabBar';
import HomeScreen from './screens/HomeScreen';
import LedgerScreen from './screens/LedgerScreen';
import BattlesScreen from './screens/BattlesScreen';
import HeroScreen from './screens/HeroScreen';
import AddScreen from './screens/AddScreen';
import { useStore } from './store';

export default function App() {
  const [tab, setTab] = useState<TabKey>('home');
  const player = useStore((s) => s.player);
  const hydrate = useStore((s) => s.hydrate);
  const hydrated = useStore((s) => s.hydrated);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  if (!fontsLoaded || !hydrated) return <View style={{ flex: 1, backgroundColor: colors.paper }} />;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top', 'bottom']}>
        <StatusBar style="dark" />

        {/* shared top chrome: coins + level (from store) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.md, paddingVertical: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <PixelCoin size={30} />
            <Text style={{ fontFamily: fonts.money, fontSize: 18, color: colors.ink, fontVariant: ['tabular-nums'] }}>
              {player.coins.toLocaleString('en-IN')}
            </Text>
            <Text style={{ fontFamily: fonts.label, fontSize: 13, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>coins</Text>
          </View>
          <NeoBox offset={0} contentStyle={{ paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontFamily: fonts.heading, fontSize: 13, color: colors.ink }}>LVL {player.level}</Text>
          </NeoBox>
        </View>

        {/* active screen */}
        <View style={{ flex: 1 }}>
          {tab === 'home' && <HomeScreen onNavigate={setTab} />}
          {tab === 'ledger' && <LedgerScreen />}
          {tab === 'battles' && <BattlesScreen />}
          {tab === 'hero' && <HeroScreen />}
          {tab === 'add' && <AddScreen />}
        </View>

        <TabBar active={tab} onChange={setTab} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
