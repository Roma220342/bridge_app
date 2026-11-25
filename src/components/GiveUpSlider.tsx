// «Slide quit» from ChickFocus (ui-spec §2 #6): 300 × 64 with corner 20 like the main button
// (owner 2026-11-25: «нічого не має бути піл»), knob on the right with «‹‹» (SF chevron.left.2, as before). Text alone, centred
// in the whole slider (owner 2026-11-25: «біля тексту нічого не треба… текст розмісти по центру»). Drag left. Released at the end = give up; released short = spring back.
// While dragging the trail fills `ink`; at the end the text reads «Відпусти, щоб завершити».
// No red (owner 2026-11-25: «Темний, без червоного»).
import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  ReduceMotion,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { motion, size, type, useColors } from '@/theme';

export const SLIDER_W = 300;
const H = 64;
const PAD = 4;
const KNOB = H - PAD * 2; // 56
const TRAVEL = SLIDER_W - PAD * 2 - KNOB;
const RELEASE_AT = 0.92;

export function GiveUpSlider({ onGiveUp }: { onGiveUp: () => void }) {
  const c = useColors();
  const x = useSharedValue(0); // 0 … -TRAVEL
  const armed = useSharedValue(false);
  const progress = useDerivedValue(() => Math.min(1, -x.value / TRAVEL));

  const tick = () => Haptics.selectionAsync();
  const giveUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onGiveUp();
  };

  const pan = usePanGesture({
    activeOffsetX: [-8, 8],
    onUpdate: (e) => {
      'worklet';
      x.value = Math.max(-TRAVEL, Math.min(0, e.translationX));
      const nowArmed = -x.value / TRAVEL >= RELEASE_AT;
      if (nowArmed !== armed.value) {
        armed.value = nowArmed;
        if (nowArmed) scheduleOnRN(tick);
      }
    },
    onDeactivate: (e) => {
      'worklet';
      if (armed.value) {
        x.value = -TRAVEL;
        scheduleOnRN(giveUp);
      } else {
        x.value = withSpring(0, { ...motion.snapBack, velocity: e.velocityX, reduceMotion: ReduceMotion.System });
      }
      armed.value = false;
    },
  });

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  // Trail: from the knob's left edge to the capsule's right end.
  const trailStyle = useAnimatedStyle(() => ({
    width: KNOB + PAD * 2 - x.value,
    opacity: interpolate(progress.value, [0, 0.05], [0, 1], 'clamp'),
  }));
  const hintStyle = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, 0.4], [1, 0], 'clamp') }));
  const releaseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [RELEASE_AT - 0.15, RELEASE_AT], [0, 1], 'clamp'),
  }));

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Здатися"
      accessibilityHint="Потягни ліворуч і відпусти, щоб завершити планку"
      accessibilityActions={[{ name: 'activate', label: 'Здатися' }]}
      onAccessibilityAction={() => {
        AccessibilityInfo.announceForAccessibility('Планку завершено');
        giveUp();
      }}
      style={[styles.track, { backgroundColor: c.surface, borderColor: c.line }]}>
      <Animated.View style={[styles.trail, { backgroundColor: c.btn }, trailStyle]} />
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, hintStyle]} pointerEvents="none">
        <Text style={[type.callout, { color: c.ink2 }]} numberOfLines={1}>
          Тягни, щоб здатися
        </Text>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, styles.release, releaseStyle]} pointerEvents="none">
        <Text style={[type.button, { color: c.btnText }]} numberOfLines={1}>
          Відпусти, щоб завершити
        </Text>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.knob, { backgroundColor: c.btn }, knobStyle]}>
          <SymbolView name="chevron.left.2" size={20} weight="bold" tintColor={c.btnText} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: SLIDER_W,
    height: H,
    borderRadius: size.buttonRadius,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trail: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: size.buttonRadius,
    borderCurve: 'continuous',
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  // at release the knob sits on the left: centre the text in the space right of it
  release: { paddingLeft: KNOB + PAD },
  knob: {
    position: 'absolute',
    right: PAD,
    width: KNOB,
    height: KNOB,
    borderRadius: size.buttonRadius - PAD, // 16, concentric with the track
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
