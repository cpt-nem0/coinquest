import React, { useState } from 'react';
import { Pressable, Text, View, ViewStyle, StyleProp } from 'react-native';
import { colors, border, fonts } from '../theme';

type Variant = 'primary' | 'reward' | 'danger' | 'ghost';

const FILL: Record<Variant, string> = {
  primary: colors.brand,
  reward: colors.reward,
  danger: colors.loss,
  ghost: colors.paper,
};
const ON: Record<Variant, string> = {
  primary: colors.onBrand,
  reward: colors.onReward,
  danger: colors.onLoss,
  ghost: colors.ink,
};

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

/**
 * Neo-brutalist button. Shadow reserved inside the footprint (margin), so no overflow.
 * On press it "sinks": content slides into the shadow's spot and the shadow disappears.
 */
export default function NeoButton({ label, onPress, variant = 'primary', style }: Props) {
  const [pressed, setPressed] = useState(false);
  const o = border.shadow;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[{ alignSelf: 'stretch' }, style]}
    >
      <View>
        {!pressed && (
          <View
            style={{ position: 'absolute', top: o, left: o, right: 0, bottom: 0, backgroundColor: colors.ink }}
          />
        )}
        <View
          style={{
            borderWidth: border.width,
            borderColor: colors.ink,
            backgroundColor: FILL[variant],
            paddingVertical: 14,
            paddingHorizontal: 18,
            alignItems: 'center',
            marginRight: pressed ? 0 : o,
            marginBottom: pressed ? 0 : o,
            marginLeft: pressed ? o : 0,
            marginTop: pressed ? o : 0,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.heading,
              fontSize: 16,
              letterSpacing: 0.5,
              color: ON[variant],
              textTransform: 'uppercase',
            }}
          >
            {label}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
