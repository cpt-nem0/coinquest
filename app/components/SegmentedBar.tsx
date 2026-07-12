import React from 'react';
import { View } from 'react-native';
import { colors, border } from '../theme';

type Props = {
  value: number; // 0..1
  color?: string; // fill color (semantic)
  segments?: number;
  height?: number;
};

/** HP/XP-style segmented meter: discrete blocks with gaps, framed like a hardware readout. */
export default function SegmentedBar({
  value,
  color = colors.gain,
  segments = 10,
  height = 16,
}: Props) {
  const clamped = Math.max(0, Math.min(1, value));
  const filled = Math.round(clamped * segments);
  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: border.width,
        borderColor: colors.ink,
        backgroundColor: colors.track,
        padding: 2,
        height,
        gap: 2,
      }}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <View
          key={i}
          style={{ flex: 1, backgroundColor: i < filled ? color : 'transparent' }}
        />
      ))}
    </View>
  );
}
