import { ImageSourcePropType } from 'react-native';

/** Pixel-art boss sprites (from Stitch), keyed by category id. */
export const BOSS_ICONS: Record<string, ImageSourcePropType> = {
  food: require('../assets/bosses/food.png'),
  shopping: require('../assets/bosses/shopping.png'),
  groceries: require('../assets/bosses/groceries.png'),
  health: require('../assets/bosses/health.png'),
  entertainment: require('../assets/bosses/entertainment.png'),
  transport: require('../assets/bosses/transport.png'),
  cosmetics: require('../assets/bosses/cosmetics.png'),
};

export const bossIcon = (categoryId: string): ImageSourcePropType | undefined =>
  BOSS_ICONS[categoryId];
