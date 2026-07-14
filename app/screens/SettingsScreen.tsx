import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, space, formatMoney } from '../theme';
import NeoBox from '../components/NeoBox';
import { useStore } from '../store';
import { CATEGORY_BY_ID } from '../domain/categories';

const CURRENCIES = [
  { code: 'INR', sym: '₹' },
  { code: 'USD', sym: '$' },
  { code: 'EUR', sym: '€' },
  { code: 'GBP', sym: '£' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1.5, color: colors.inkSoft, textTransform: 'uppercase', marginBottom: 10, marginLeft: 2 }}>
      {children}
    </Text>
  );
}

function Toggle({ on, disabled }: { on: boolean; disabled?: boolean }) {
  return (
    <View style={{ width: 52, height: 30, borderWidth: 3, borderColor: colors.ink, backgroundColor: on ? colors.gain : colors.track, justifyContent: 'center', paddingHorizontal: 3, opacity: disabled ? 0.5 : 1 }}>
      <View style={{ width: 18, height: 18, backgroundColor: on ? colors.white : colors.inkSoft, borderWidth: 2, borderColor: colors.ink, alignSelf: on ? 'flex-end' : 'flex-start' }} />
    </View>
  );
}

export default function SettingsScreen({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const budgetMinor = useStore((s) => s.budgetMinor);
  const currency = useStore((s) => s.currency);
  const transactions = useStore((s) => s.transactions);
  const setBudget = useStore((s) => s.setBudget);
  const setCurrency = useStore((s) => s.setCurrency);
  const resetData = useStore((s) => s.resetData);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(Math.round(budgetMinor / 100)));

  const saveBudget = () => {
    const major = parseInt(draft.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(major)) setBudget(major * 100);
    setEditing(false);
  };

  const exportCsv = async () => {
    const header = 'date,merchant,category,direction,amount,currency';
    const rows = transactions.map((t) => {
      const d = new Date(t.ts).toISOString().slice(0, 10);
      const cat = CATEGORY_BY_ID[t.categoryId]?.name ?? t.categoryId;
      return `${d},"${t.merchant}",${cat},${t.direction},${(t.amountMinor / 100).toFixed(2)},${t.currency}`;
    });
    const csv = [header, ...rows].join('\n');
    try {
      await Share.share({ message: csv, title: 'Coinquest export' });
    } catch {
      /* user dismissed */
    }
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset all data?',
      'This wipes your transactions, coins, and quests, then restores the sample data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetData() },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      {/* header */}
      <View style={{ backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.md, paddingTop: insets.top + 14, paddingBottom: 16 }}>
        <Pressable onPress={onClose} hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
          <Text style={{ fontFamily: fonts.display, fontSize: 22, letterSpacing: 1, color: colors.white }}>SETTINGS</Text>
        </Pressable>
        <Pressable onPress={onClose} hitSlop={10}>
          <View style={{ width: 34, height: 34, borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={20} color={colors.white} />
          </View>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: insets.bottom + 48, gap: space.lg }} keyboardShouldPersistTaps="handled">
        {/* MONEY */}
        <View>
          <SectionLabel>Money</SectionLabel>

          {/* Monthly budget */}
          <NeoBox bg={colors.white} style={{ alignSelf: 'stretch', marginBottom: space.md }} contentStyle={{ padding: space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>Monthly budget</Text>
                {editing ? (
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    keyboardType="number-pad"
                    autoFocus
                    onSubmitEditing={saveBudget}
                    style={{ fontFamily: fonts.money, fontSize: 30, color: colors.ink, padding: 0, marginTop: 2 }}
                  />
                ) : (
                  <Text style={{ fontFamily: fonts.money, fontSize: 30, color: colors.ink, marginTop: 2 }}>{formatMoney(budgetMinor, currency)}</Text>
                )}
              </View>
              <Pressable onPress={editing ? saveBudget : () => { setDraft(String(Math.round(budgetMinor / 100))); setEditing(true); }}>
                <NeoBox bg={editing ? colors.gain : colors.brand} offset={4} contentStyle={{ width: 46, height: 46, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={editing ? 'checkmark' : 'pencil'} size={20} color={colors.white} />
                </NeoBox>
              </Pressable>
            </View>
          </NeoBox>

          {/* Currency */}
          <NeoBox bg={colors.white} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: 12 }}>
            <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1, color: colors.inkSoft, textTransform: 'uppercase' }}>Currency</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CURRENCIES.map((c) => {
                const on = currency === c.code;
                return (
                  <Pressable key={c.code} onPress={() => setCurrency(c.code)}>
                    <View style={{ borderWidth: 3, borderColor: colors.ink, backgroundColor: on ? colors.ink : colors.white, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontFamily: fonts.money, fontSize: 14, color: on ? colors.white : colors.ink }}>{c.sym}</Text>
                      <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 0.5, color: on ? colors.white : colors.ink }}>{c.code}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </NeoBox>
        </View>

        {/* APPEARANCE */}
        <View>
          <SectionLabel>Appearance</SectionLabel>
          <NeoBox bg={colors.white} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: fonts.heading, fontSize: 15, textTransform: 'uppercase', color: colors.ink }}>Theme</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ borderWidth: 3, borderColor: colors.ink, backgroundColor: colors.ink, paddingHorizontal: 14, paddingVertical: 7 }}>
                <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 0.5, color: colors.white }}>LIGHT</Text>
              </View>
              <View style={{ borderWidth: 3, borderColor: colors.track, backgroundColor: colors.surfaceLow, paddingHorizontal: 12, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name="lock-closed" size={12} color={colors.inkSoft} />
                <Text style={{ fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.5, color: colors.inkSoft }}>DARK · SOON</Text>
              </View>
            </View>
          </NeoBox>
        </View>

        {/* CAPTURE */}
        <View>
          <SectionLabel>Capture</SectionLabel>
          <NeoBox bg={colors.white} style={{ alignSelf: 'stretch', marginBottom: space.md }} contentStyle={{ padding: space.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.heading, fontSize: 15, textTransform: 'uppercase', color: colors.ink }}>Manual entry</Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>Log spends yourself from the + tab.</Text>
            </View>
            <Toggle on disabled />
          </NeoBox>
          <NeoBox bg={colors.surfaceLow} offset={2} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.heading, fontSize: 15, textTransform: 'uppercase', color: colors.inkSoft }}>Auto-capture</Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>Read spends from Gmail & SMS.</Text>
            </View>
            <View style={{ backgroundColor: colors.ink, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ fontFamily: fonts.label, fontSize: 10, letterSpacing: 0.5, color: colors.white }}>COMING SOON</Text>
            </View>
          </NeoBox>
        </View>

        {/* DATA */}
        <View>
          <SectionLabel>Data</SectionLabel>
          <Pressable onPress={exportCsv}>
            <NeoBox bg={colors.white} offset={4} style={{ alignSelf: 'stretch', marginBottom: space.md }} contentStyle={{ padding: space.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: fonts.heading, fontSize: 15, textTransform: 'uppercase', color: colors.ink }}>Export data (.csv)</Text>
              <Ionicons name="download-outline" size={20} color={colors.ink} />
            </NeoBox>
          </Pressable>
          <Pressable onPress={confirmReset}>
            <NeoBox bg={colors.white} borderColor={colors.loss} offset={4} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: fonts.heading, fontSize: 15, textTransform: 'uppercase', color: colors.loss }}>Reset all data</Text>
              <Ionicons name="warning-outline" size={20} color={colors.loss} />
            </NeoBox>
          </Pressable>
        </View>

        {/* ABOUT */}
        <View>
          <SectionLabel>About</SectionLabel>
          <NeoBox bg={colors.surfaceLow} offset={2} style={{ alignSelf: 'stretch' }} contentStyle={{ padding: space.md, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.ink }}>COINQUEST</Text>
              <View style={{ backgroundColor: colors.reward, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ fontFamily: fonts.money, fontSize: 11, color: colors.ink }}>v1.0.0</Text>
              </View>
            </View>
            <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft }}>Made for the quest to spend wisely.</Text>
          </NeoBox>
        </View>
      </ScrollView>
    </View>
  );
}
