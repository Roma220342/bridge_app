// Bridge design tokens. Source of truth: Bridge/design-tokens.md (approved 2026-11-25).
// Layout numbers: Bridge/ui-spec.md (ChickFocus measured in pt).
import type { TextStyle } from 'react-native';

export const palette = {
  light: {
    bg: '#F6F0E6',
    surface: '#FFFDF8',
    ink: '#23120B',
    ink2: '#6B5A4E',
    ink3: '#8A7A6D',
    line: '#E4DACB',
    btn: '#23120B',
    btnText: '#F6F0E6',
    btnDisabled: '#D9CFC3',
  },
  dark: {
    bg: '#1A120D',
    surface: '#261B15',
    ink: '#F6F0E6',
    ink2: '#BFB2A5',
    ink3: '#8F8277',
    line: '#3A2C23',
    btn: '#F6F0E6',
    btnText: '#23120B',
    btnDisabled: '#3A2C23',
  },
} as const;

// Same in both themes.
export const fixed = {
  brand: '#F88E27',
  leaf: '#3F8A4F',
  leafLight: '#85BB65',
  duck: '#FCF9F3',
  duckShade: '#EDE2D6',
  beak: '#F88E27',
  beakDark: '#E5731C',
  outline: '#23120B',
  woodDark: '#A26235',
  woodLight: '#CD8750',
  // Celebration (design-tokens.md §1, owner 2026-11-25): confetti only, never text, buttons or icons.
  celebratePink: '#E94B8A',
  celebrateBlue: '#2EA6DD',
  celebratePurple: '#8B5FBF',
  celebrateYellow: '#F2BE2A',
} as const;

export type Colors = { [K in keyof typeof palette.light]: string } & typeof fixed;

const rounded = 'ui-rounded';
const nums: TextStyle['fontVariant'] = ['tabular-nums'];

export const type = {
  countdown: { fontFamily: rounded, fontSize: 160, fontWeight: '700', fontVariant: nums },
  timer: { fontFamily: rounded, fontSize: 96, fontWeight: '700', fontVariant: nums },
  resultNumber: { fontFamily: rounded, fontSize: 48, fontWeight: '700', fontVariant: nums },
  statNumber: { fontFamily: rounded, fontSize: 28, fontWeight: '600', fontVariant: nums },
  counter: { fontFamily: rounded, fontSize: 17, fontWeight: '600', fontVariant: nums },
  titleLarge: { fontFamily: rounded, fontSize: 34, fontWeight: '700' },
  title: { fontFamily: rounded, fontSize: 22, fontWeight: '600' },
  body: { fontSize: 17, fontWeight: '400' },
  button: { fontSize: 17, fontWeight: '600' },
  callout: { fontSize: 15, fontWeight: '400' },
  footnote: { fontSize: 13, fontWeight: '400' },
} satisfies Record<string, TextStyle>;

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const size = {
  touch: 44,
  button: 64,
  buttonRadius: 20,
  cardRadius: 20,
  buttonWidthHome: 180,
  buttonWidthResult: 240,
  marginTight: 16,
  marginWide: 24,
} as const;

// Motion (Emil Kowalski, animate-expo). Durations in ms.
export const motion = {
  pressScale: 0.97,
  pressIn: 120,
  easeOut: [0.23, 1, 0.32, 1] as const,
  settle: { duration: 400, dampingRatio: 1 },
  snapBack: { duration: 400, dampingRatio: 0.8 },
} as const;
