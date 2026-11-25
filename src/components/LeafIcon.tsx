// The currency: a two-tone green leaf with an `outline` stroke, like the duck (design-tokens.md §3).
import Svg, { Path } from 'react-native-svg';

import { fixed } from '@/theme';

export function LeafIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      {/* light half (upper-left of the midrib) */}
      <Path d="M4.5 19.5 C4.5 10.5 9.5 4.5 20 4 Z" fill={fixed.leafLight} />
      {/* main tone (lower-right) */}
      <Path d="M4.5 19.5 L20 4 C19.5 14.5 13.5 19.5 4.5 19.5 Z" fill={fixed.leaf} />
      {/* midrib */}
      <Path d="M7 17 L15.5 8.5" stroke={fixed.leafLight} strokeWidth={1.4} strokeLinecap="round" />
      {/* outline + stem */}
      <Path
        d="M4.5 19.5 C4.5 10.5 9.5 4.5 20 4 C19.5 14.5 13.5 19.5 4.5 19.5 Z M4.5 19.5 L2.5 21.5"
        fill="none"
        stroke={fixed.outline}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
