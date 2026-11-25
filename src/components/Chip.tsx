// Result chip: capsule, height 30, `surface` fill + `line` border (ui-spec §1).
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { type, useColors } from '@/theme';

export function Chip({ icon, label }: { icon?: ReactNode; label: string }) {
  const c = useColors();
  return (
    <View style={[styles.chip, { backgroundColor: c.surface, borderColor: c.line }]}>
      {icon}
      <Text style={[type.footnote, styles.text, { color: c.ink }]} maxFontSizeMultiplier={1.4}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: { fontFamily: 'ui-rounded', fontWeight: '600', fontVariant: ['tabular-nums'] },
});
