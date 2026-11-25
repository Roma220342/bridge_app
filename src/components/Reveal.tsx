// Staggered entrance for result content: opacity 0 → 1 and 8 pt up, ease-out 300 ms (ui-spec §5).
// Reduce Motion: opacity only.
import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/theme';

export function Reveal({ at, children, style }: { at: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(at, withTiming(1, { duration: 300, easing: Easing.bezier(...motion.easeOut) }));
  }, [at, v]);
  const anim = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: reduced ? 0 : 8 * (1 - v.value) }],
  }));
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}
