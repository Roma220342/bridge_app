// Main button, as in ChickFocus: height 64, continuous corner 20 (ui-spec §1).
// Press: scale 0.97 over 120 ms ease-out, release settles with a no-bounce spring.
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { motion, size, type, useColors } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  width?: DimensionValue;
  haptic?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, width = size.buttonWidthHome, haptic, disabled }: Props) {
  const c = useColors();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPressIn={() => {
        scale.set(
          withTiming(motion.pressScale, {
            duration: motion.pressIn,
            easing: Easing.bezier(...motion.easeOut),
            reduceMotion: ReduceMotion.System,
          }),
        );
      }}
      onPressOut={() => {
        scale.set(withSpring(1, { ...motion.settle, reduceMotion: ReduceMotion.System }));
      }}
      onPress={() => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={{ width }}>
      <Animated.View
        style={[
          styles.body,
          { backgroundColor: disabled ? c.btnDisabled : c.btn },
          style,
        ]}>
        <Text
          style={[type.button, { color: disabled ? c.ink3 : c.btnText }]}
          maxFontSizeMultiplier={1.4}
          numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    height: size.button,
    borderRadius: size.buttonRadius,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
