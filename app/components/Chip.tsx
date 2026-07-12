import React from 'react';
import { View, Text } from 'react-native';
import { colors, border, fonts } from '../theme';

type Props = {
  label: string;
  color?: string; // border/text accent; defaults to ink
  filled?: boolean; // solid accent bg
};

/** Small sharp-cornered tag. Category/status chip. */
export default function Chip({ label, color = colors.ink, filled = false }: Props) {
  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: color,
        backgroundColor: filled ? color : 'transparent',
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          fontFamily: fonts.label,
          fontSize: 11,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: filled ? colors.paper : color,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
