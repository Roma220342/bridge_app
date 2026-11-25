// Last 7 days as dots (Noom idea, ui-spec §8): days with a plank are filled. Only grows, no blame.
// Shown on both «Успіх» and «Обрив» (owner 2026-11-25: «Так, на обидва»).
// `fillTodayAt` (ms): today's dot starts as a ring and fills then — opacity + scale 0.6 → 1, ease-out 300 ms.
// Reduce Motion: opacity only.
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { plankDays, today, useStore } from '@/data/store';
import { motion, type, useColors } from '@/theme';

const LETTERS = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const DOT = 24;

export function DaysRow({ fillTodayAt }: { fillTodayAt?: number }) {
  const c = useColors();
  const planks = useStore((s) => s.planks);
  const days = new Set(plankDays({ plan: 0, leaves: 0, planks }));
  const list = Array.from({ length: 7 }, (_, k) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - k));
    return { key: today(d), letter: LETTERS[d.getDay()], on: days.has(today(d)), isToday: k === 6 };
  });
  const count = list.filter((d) => d.on).length;
  return (
    <View style={styles.row} accessible accessibilityLabel={`Планка в ${count} з останніх 7 днів`}>
      {list.map((d) => (
        <View key={d.key} style={styles.day}>
          {d.on && d.isToday && fillTodayAt !== undefined ? (
            <View style={[styles.dot, { borderColor: c.line, borderWidth: 2 }]}>
              <FillIn at={fillTodayAt} color={c.ink} />
            </View>
          ) : (
            <View style={[styles.dot, d.on ? { backgroundColor: c.ink } : { borderColor: c.line, borderWidth: 2 }]} />
          )}
          <Text
            style={[type.footnote, { color: d.isToday ? c.ink : c.ink2 }, d.isToday && styles.todayLetter]}
            maxFontSizeMultiplier={1.3}>
            {d.letter}
          </Text>
        </View>
      ))}
    </View>
  );
}

function FillIn({ at, color }: { at: number; color: string }) {
  const reduced = useReducedMotion();
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(at, withTiming(1, { duration: 300, easing: Easing.bezier(...motion.easeOut) }));
  }, [at, v]);
  const style = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ scale: reduced ? 1 : 0.6 + 0.4 * v.value }],
  }));
  return <Animated.View style={[styles.fill, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  day: { alignItems: 'center', gap: 4 },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
  // covers the ring (border box): sits at -2 so it fills the full 24
  fill: { position: 'absolute', top: -2, left: -2, width: DOT, height: DOT, borderRadius: DOT / 2 },
  todayLetter: { fontWeight: '600' },
});
