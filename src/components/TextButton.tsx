// Text button under the main one: icon 18 (Phosphor Bold, matches 17 Semibold) + gap 6 + 17 Semibold, `ink-2`.
// Owner 2026-11-25: icon 14 was «замаленька, і вона не відповідає жирності тексту».
import { Pressable, StyleSheet, Text } from 'react-native';

import { Icon, type IconName } from './Icon';
import { size, type, useColors } from '@/theme';

export function TextButton({ label, icon, onPress }: { label: string; icon?: IconName; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
      {icon ? <Icon name={icon} size={18} color={c.ink2} /> : null}
      <Text style={[type.button, { color: c.ink2 }]} maxFontSizeMultiplier={1.4}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: size.touch,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
