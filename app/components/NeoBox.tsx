import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { colors, border } from '../theme';

type Props = {
  children?: React.ReactNode;
  bg?: string;
  borderColor?: string;
  offset?: number; // hard-shadow distance; 0 disables
  style?: StyleProp<ViewStyle>; // outer wrapper (margins, width, alignSelf…)
  contentStyle?: StyleProp<ViewStyle>; // the bordered content box (padding…)
};

/**
 * Neo-brutalist container. The solid (non-blurred) offset shadow lives INSIDE the
 * element's footprint — the content reserves margin bottom/right, the shadow fills it.
 * This keeps the shadow from ever causing horizontal overflow.
 */
export default function NeoBox({
  children,
  bg = colors.paper,
  borderColor = colors.ink,
  offset = border.shadow,
  style,
  contentStyle,
}: Props) {
  const o = Math.max(0, offset);
  return (
    <View style={[{ alignSelf: 'flex-start' }, style]}>
      {o > 0 && (
        <View
          style={{
            position: 'absolute',
            top: o,
            left: o,
            right: 0,
            bottom: 0,
            backgroundColor: colors.ink,
          }}
        />
      )}
      <View
        style={[
          {
            borderWidth: border.width,
            borderColor,
            borderRadius: border.radius,
            backgroundColor: bg,
            marginRight: o,
            marginBottom: o,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}
