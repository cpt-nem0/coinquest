import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, border, fonts } from '../theme';

export type TabKey = 'home' | 'battles' | 'add' | 'ledger' | 'hero';

const TABS: { key: TabKey; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { key: 'home', icon: 'home', label: 'HOME' },
  { key: 'battles', icon: 'flash', label: 'BATTLES' },
  { key: 'add', icon: 'add', label: '' },
  { key: 'ledger', icon: 'list', label: 'LEDGER' },
  { key: 'hero', icon: 'person', label: 'HERO' },
];

export default function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange?: (k: TabKey) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: border.width,
        borderTopColor: colors.ink,
        backgroundColor: colors.paper,
        paddingTop: 8,
        paddingBottom: 22,
        paddingHorizontal: 12,
        alignItems: 'center',
      }}
    >
      {TABS.map((t) => {
        if (t.key === 'add') {
          // raised gold center button
          return (
            <Pressable key={t.key} onPress={() => onChange?.(t.key)} style={{ flex: 1, alignItems: 'center' }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  marginTop: -18,
                  borderWidth: border.width,
                  borderColor: colors.ink,
                  backgroundColor: colors.reward,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="add" size={30} color={colors.ink} />
              </View>
            </Pressable>
          );
        }
        const on = active === t.key;
        return (
          <Pressable key={t.key} onPress={() => onChange?.(t.key)} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
            <Ionicons name={t.icon} size={22} color={on ? colors.brand : colors.inkSoft} />
            <Text
              style={{
                fontFamily: fonts.label,
                fontSize: 10,
                letterSpacing: 0.5,
                color: on ? colors.brand : colors.inkSoft,
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
