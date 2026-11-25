// «Успіх» hero (owner 2026-11-25: «Качка з сяйвом»; orange circle dropped — «перетягує… всю увагу з кнопки»).
// Delight thesis: you held, so the duck made it across — it rises into a warm glow and hops for joy,
// the sprinkles burst from behind it. Product-specific, short, the same every time; buttons never wait.
// Timeline (ms): glow 0–350 · duck rises 80–530 · hop at HOP_AT (+ success haptic + confetti burst).
// Reduce Motion: glow and duck fade in only; no rise, no hop, no confetti; the haptic stays.
// Duck is the static art from Bridge/art/duck.svg (happy eye) until Rive (then the hop becomes a Rive state).
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { Confetti } from './Confetti';
import { fixed, motion, useColors } from '@/theme';

export const HERO = 240; // glow diameter = hero box
const DUCK_H = 160;
const DUCK_W = (DUCK_H * 753) / 912;
/** When the duck hops; the rest of the screen times its reveals from this. */
export const HOP_AT = 600;

const ease = Easing.bezier(...motion.easeOut);
// Happy duck (owner 2026-11-25: «очі… півколом… ніби вона тішиться»): eye is a closed arc ‿ turned up,
// same 18 outline as the art. Made from duck.svg, only the eye differs.
const duck = require('@/assets/scene/duck-happy.svg');

export function SuccessHero() {
  const c = useColors();
  const reduced = useReducedMotion();
  const glow = useSharedValue(0);
  const rise = useSharedValue(0);
  const hop = useSharedValue(0);

  useEffect(() => {
    const buzz = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    glow.value = withTiming(1, { duration: 350, easing: ease });
    rise.value = withDelay(80, withTiming(1, { duration: 450, easing: ease }));
    if (reduced) {
      buzz();
      return;
    }
    hop.value = withDelay(
      HOP_AT,
      withSequence(
        withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }, (done) => {
          if (done) scheduleOnRN(buzz);
        }),
        withTiming(0, { duration: 240, easing: Easing.in(Easing.quad) }),
      ),
    );
  }, [reduced, glow, rise, hop]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: reduced ? 1 : 0.95 + 0.05 * glow.value }],
  }));
  const duckStyle = useAnimatedStyle(() => ({
    opacity: rise.value,
    transform: reduced
      ? []
      : [{ translateY: 24 * (1 - rise.value) - 16 * hop.value }, { scale: 0.92 + 0.08 * rise.value }],
  }));

  return (
    <View style={styles.box} accessible accessibilityRole="image" accessibilityLabel="Качка перейшла міст">
      <Confetti ox={HERO / 2} oy={HERO / 2} delay={HOP_AT} />
      <Animated.View style={[StyleSheet.absoluteFill, glowStyle]}>
        <Svg width={HERO} height={HERO}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={fixed.brand} stopOpacity={0.22} />
              <Stop offset="0.45" stopColor={c.surface} stopOpacity={0.9} />
              <Stop offset="1" stopColor={c.surface} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={HERO / 2} cy={HERO / 2} r={HERO / 2} fill="url(#glow)" />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.duck, duckStyle]}>
        <Image source={duck} style={{ width: DUCK_W, height: DUCK_H }} contentFit="contain" accessible={false} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: HERO, height: HERO, alignItems: 'center', justifyContent: 'center' },
  duck: { width: DUCK_W, height: DUCK_H },
});
