import { useColorScheme } from 'react-native';

import { fixed, palette, type Colors } from './tokens';

export * from './tokens';

export function useColors(): Colors & { scheme: 'light' | 'dark' } {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { ...palette[scheme], ...fixed, scheme };
}
