import React, { useState } from 'react';
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

function Placeholder({ label }: { label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.ink }}>{label}</Text>
      <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, marginTop: 6 }}>Coming soon</Text>
    </View>
  );
}

export default function App() {
  const [tab, setTab] = useState<TabKey>('ledger');
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.paper }} />;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top', 'bottom']}>
        <StatusBar style="dark" />

        {/* shared top chrome: coins + level */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.md, paddingVertical: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <PixelCoin size={30} />
            <Text style={{ fontFamily: fonts.money, fontSize: 18, color: colors.ink, fontVariant: ['tabular-nums'] }}>1,250</Text>
            <Text style={{ fontFamily: fonts.label, fontSize: 13, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>coins</Text>
          </View>
          <NeoBox offset={0} contentStyle={{ paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontFamily: fonts.heading, fontSize: 13, color: colors.ink }}>LVL 12</Text>
          </NeoBox>
        </View>

        {/* active screen */}
        <View style={{ flex: 1 }}>
          {tab === 'home' && <HomeScreen />}
          {tab === 'ledger' && <LedgerScreen />}
          {tab === 'battles' && <Placeholder label="Battles" />}
          {tab === 'hero' && <Placeholder label="Hero" />}
          {tab === 'add' && <Placeholder label="Log a spend" />}
        </View>

        <TabBar active={tab} onChange={setTab} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
