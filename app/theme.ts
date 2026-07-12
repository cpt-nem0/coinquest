/**
 * Coinquest Arcade — design tokens (light theme, v1).
 * Source of truth: ../DESIGN.md. Color = meaning; sharp corners; hard offset shadows.
 */

export const colors = {
  // paper / surfaces
  paper: '#fffdf7',
  surfaceLow: '#fbf7ec',
  surface: '#f5efe0',
  surfaceHigh: '#ece4d1',
  // ink
  ink: '#14130f',
  inkSoft: '#54503f',
  // brand + semantic (each has ONE meaning)
  brand: '#5b3df0', // violet — brand / primary actions / active
  gain: '#12a35a', // green — saved / income / health / winning
  loss: '#e23b2e', // red — overspend / money out / damage
  reward: '#ffc01e', // gold — coins / XP / rewards ONLY
  amber: '#e88c00', // neutral "consumption" (budget used), pre-danger
  // on-color text
  onBrand: '#ffffff',
  onReward: '#14130f',
  onGain: '#ffffff',
  onLoss: '#ffffff',
  // misc
  track: '#e2d8c1', // empty segment / meter track
  white: '#ffffff',
} as const;

export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  heading: 'SpaceGrotesk_700Bold',
  label: 'SpaceGrotesk_500Medium',
  body: 'SpaceGrotesk_400Regular',
  money: 'JetBrainsMono_700Bold', // ALL money/numbers are mono + tabular
  moneyMed: 'JetBrainsMono_500Medium',
} as const;

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 } as const;

export const border = {
  width: 3, // chunky chrome border
  color: colors.ink,
  radius: 0, // strictly sharp
  shadow: 4, // hard offset shadow distance (px), bottom-right, no blur
} as const;

/** Format minor units into a currency string (tabular-friendly). */
export function formatMoney(amountMinor: number, currency = 'INR'): string {
  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const sym = symbols[currency] ?? '';
  const major = Math.abs(amountMinor) / 100;
  const grouped =
    currency === 'INR'
      ? major.toLocaleString('en-IN', { maximumFractionDigits: 0 })
      : major.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return `${sym}${grouped}`;
}
