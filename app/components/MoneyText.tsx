import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { colors, fonts, formatMoney } from '../theme';

type Props = {
  amountMinor: number;
  currency?: string;
  /** 'debit' shows red −, 'credit' shows green +, 'plain' shows neither. */
  kind?: 'debit' | 'credit' | 'plain';
  size?: number;
  color?: string; // override
  style?: StyleProp<TextStyle>;
};

/** All money renders here: JetBrains Mono + tabular figures so columns never jitter. */
export default function MoneyText({
  amountMinor,
  currency = 'INR',
  kind = 'plain',
  size = 16,
  color,
  style,
}: Props) {
  const sign = kind === 'debit' ? '−' : kind === 'credit' ? '+' : '';
  const c = color ?? (kind === 'debit' ? colors.loss : kind === 'credit' ? colors.gain : colors.ink);
  return (
    <Text
      style={[
        {
          fontFamily: fonts.money,
          fontSize: size,
          color: c,
          fontVariant: ['tabular-nums'],
        },
        style,
      ]}
    >
      {sign}
      {formatMoney(amountMinor, currency)}
    </Text>
  );
}
