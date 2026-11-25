// Success confetti — sprinkles, after the owner's photo reference (2026-11-25): thin rods with round
// ends (12 × 3 pt, ratio ~4:1 measured on the photo), random tilt, many colours, evenly scattered.
// Owner: «конфеті вибухає з-за кола й осідає папірцями» → rods burst out from behind the circle
// (ease-out, ~0.5 s), then drift down slowly with a light sway and turn, fading at the end.
// Colours: `celebrate-*` tokens + brand + leaf (7, as on the reference; owner: «додати семантичні кольори»).
// Reduce Motion: no confetti (ui-spec §5). Only transform + opacity are animated.
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { fixed } from '@/theme';

const COLORS = [
  fixed.celebratePink,
  fixed.celebrateYellow,
  fixed.celebrateBlue,
  fixed.brand,
  fixed.leafLight,
  fixed.celebratePurple,
  fixed.leaf,
];
const COUNT = 64;
const TOTAL = 3200; // ms
const BURST = 0.16; // share of TOTAL for the burst (~0.5 s)
const W = 3;
const L = 12;

/** Deterministic 0…1 noise, so every mount looks the same and render stays pure. */
const rand = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type Seed = {
  angle: number;
  dist: number;
  fall: number;
  sway: number;
  swayFreq: number;
  rot0: number;
  spin: number;
  color: string;
};

function Piece({ s, t, ox, oy }: { s: Seed; t: SharedValue<number>; ox: number; oy: number }) {
  const style = useAnimatedStyle(() => {
    const v = t.value;
    const b = Math.min(1, v / BURST);
    const burst = 1 - Math.pow(1 - b, 3); // ease-out cubic
    const f = Math.max(0, (v - BURST) / (1 - BURST));
    const x = Math.cos(s.angle) * s.dist * burst + Math.sin(f * Math.PI * s.swayFreq) * s.sway * f;
    const y = Math.sin(s.angle) * s.dist * burst + s.fall * f * f * 0.6 + s.fall * f * 0.4;
    const opacity = v < 0.02 ? v / 0.02 : v > 0.75 ? Math.max(0, (1 - v) / 0.25) : 1;
    return {
      opacity,
      transform: [
        { translateX: ox + x - L / 2 },
        { translateY: oy + y - W / 2 },
        { rotate: `${s.rot0 + s.spin * v}deg` },
      ],
    };
  });
  return <Animated.View style={[styles.piece, { backgroundColor: s.color }, style]} />;
}

/** `ox`, `oy` — burst origin (the circle centre) in the parent's coordinates. */
export function Confetti({ ox, oy, delay = 0 }: { ox: number; oy: number; delay?: number }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  const seeds = useMemo<Seed[]>(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        // all around, a little more upward so pieces have room to settle
        angle: rand(i, 1) * Math.PI * 2 - (rand(i, 2) < 0.35 ? Math.PI / 2 : 0),
        dist: 80 + rand(i, 3) * 140,
        fall: 220 + rand(i, 4) * 320,
        sway: 8 + rand(i, 5) * 14,
        swayFreq: 2 + rand(i, 6) * 2,
        rot0: rand(i, 7) * 180,
        spin: (rand(i, 8) - 0.5) * 540,
        color: COLORS[i % COLORS.length],
      })),
    [],
  );

  useEffect(() => {
    if (reduced) return;
    t.value = withDelay(delay, withTiming(1, { duration: TOTAL, easing: Easing.linear }));
  }, [reduced, delay, t]);

  if (reduced) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} importantForAccessibility="no-hide-descendants">
      {seeds.map((s, i) => (
        <Piece key={i} s={s} t={t} ox={ox} oy={oy} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', top: 0, left: 0, width: L, height: W, borderRadius: W / 2 },
});
