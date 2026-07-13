import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

const COIN = require('../assets/brand/coin.png');

/** The canonical gold ✦ coin. Used for Coins counters, rewards, app chrome. */
export default function PixelCoin({ size = 28, style }: { size?: number; style?: StyleProp<ImageStyle> }) {
  return (
    <Image
      source={COIN}
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
      fadeDuration={0}
    />
  );
}
