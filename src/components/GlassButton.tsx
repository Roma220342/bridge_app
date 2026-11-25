// System Liquid Glass control: circle 44 or capsule of height 44 (ui-spec §1).
// Falls back to a surface pill with a hairline when Liquid Glass is unavailable.
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { size, useColors } from '@/theme';

const glass = isLiquidGlassAvailable();

export function GlassSurface({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const c = useColors();
  if (glass) {
    return (
      <GlassView glassEffectStyle="regular" isInteractive style={[styles.base, style]}>
        {children}
      </GlassView>
    );
  }
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: c.line },
        style,
      ]}>
      {children}
    </View>
  );
}

type Props = {
  onPress: () => void;
  label: string;
  children: ReactNode;
  width?: number;
};

/** One tappable glass element. Without `width` it is a 44 circle. */
export function GlassButton({ onPress, label, children, width }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={4}>
      <GlassSurface style={{ width: width ?? size.touch }}>{children}</GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: size.touch,
    borderRadius: size.touch / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
