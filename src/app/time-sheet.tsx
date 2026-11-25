// #4 Time sheet (ui-spec §2, frame light/049): system form sheet, glass X, segment «За планом / Свій час».
// Owner 2026-11-25: «impeccable bolder… більш структуровано… блоками» → three blocks:
//   1. the time itself: big number (title-large 34 Bold) + «закінчиш о…»;
//   2. «За планом»: card «Як росте план» (today / tomorrow if you hold / cap 3:00);
//      «Свій час»: system slider 15 s – 10 min with end labels;
//   3. «Почати».
import { Host, Picker, Slider, Text as SText } from '@expo/ui/swift-ui';
import { pickerStyle, tag, tint } from '@expo/ui/swift-ui/modifiers';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassButton } from '@/components/GlassButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CUSTOM_MAX, PLAN_CAP, planPreview, useStore } from '@/data/store';
import { endsAt, formatShort } from '@/lib/format';
import { size, space, type, useColors } from '@/theme';

type Mode = 'plan' | 'custom';
const CUSTOM_MIN = 15;

export default function TimeSheet() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const plan = useStore((s) => s.plan);
  const tomorrow = useStore((s) => planPreview(s).tomorrow);
  const [mode, setMode] = useState<Mode>('plan');
  const [custom, setCustom] = useState(plan);
  const seconds = mode === 'plan' ? plan : custom;

  const start = () => {
    router.dismiss();
    router.push({ pathname: '/countdown', params: { seconds: String(seconds), auto: mode === 'plan' ? '1' : '0' } });
  };

  return (
    <View style={[styles.sheet, { backgroundColor: c.bg, paddingBottom: insets.bottom + space.l }]}>
      <View style={styles.header}>
        <GlassButton label="Закрити" onPress={() => router.dismiss()}>
          <SymbolView name="xmark" size={17} weight="semibold" tintColor={c.ink} />
        </GlassButton>
        <Host style={styles.segment}>
          <Picker<Mode>
            selection={mode}
            onSelectionChange={(m) => setMode(m)}
            modifiers={[pickerStyle('segmented')]}>
            <SText modifiers={[tag('plan')]}>За планом</SText>
            <SText modifiers={[tag('custom')]}>Свій час</SText>
          </Picker>
        </Host>
        <View style={{ width: size.touch }} />
      </View>

      {/* 1 — the time */}
      <View style={styles.hero} accessible accessibilityLabel={`${formatShort(seconds)}, закінчиш о ${endsAt(seconds)}`}>
        <Text style={[type.titleLarge, styles.number, { color: c.ink }]} maxFontSizeMultiplier={1.2} accessibilityLiveRegion="polite">
          {formatShort(seconds)}
        </Text>
        <Text style={[type.callout, { color: c.ink2 }]}>закінчиш о {endsAt(seconds)}</Text>
      </View>

      {/* 2 — how the time is set */}
      {mode === 'plan' ? (
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]}>
          <Text style={[type.button, styles.cardTitle, { color: c.ink }]}>Як росте план</Text>
          <Row label="Сьогодні" value={formatShort(plan)} />
          <Row label="Завтра, якщо встоїш" value={formatShort(tomorrow)} />
          <Row label="Межа плану" value={formatShort(PLAN_CAP)} last />
        </View>
      ) : (
        <View style={styles.custom}>
          <Host matchContents={{ vertical: true }} style={styles.slider}>
            <Slider
              value={custom}
              min={CUSTOM_MIN}
              max={CUSTOM_MAX}
              step={5}
              onValueChange={(v) => setCustom(Math.round(v / 5) * 5)}
              modifiers={[tint(c.ink)]}
            />
          </Host>
          <View style={styles.ends} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            <Text style={[type.footnote, { color: c.ink2 }]}>{formatShort(CUSTOM_MIN)}</Text>
            <Text style={[type.footnote, { color: c.ink2 }]}>{CUSTOM_MAX / 60} хв</Text>
          </View>
        </View>
      )}

      {/* 3 — go */}
      <View style={styles.cta}>
        <PrimaryButton label="Почати" onPress={start} haptic />
      </View>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const c = useColors();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line }]}>
      <Text style={[type.body, styles.rowLabel, { color: c.ink2 }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[type.counter, { color: c.ink }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: size.marginWide, paddingTop: space.l },
  header: { height: size.touch, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  segment: { width: 203, height: size.touch },
  hero: { marginTop: space.xxl, gap: space.xs },
  number: { fontVariant: ['tabular-nums'] },
  card: {
    marginTop: space.xl,
    paddingHorizontal: space.l,
    paddingTop: space.l,
    paddingBottom: space.xs,
    borderRadius: size.cardRadius,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardTitle: { marginBottom: space.xs },
  row: { minHeight: size.touch, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.m },
  rowLabel: { flexShrink: 1 },
  custom: { marginTop: space.xl },
  slider: { width: '100%' },
  ends: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.xs },
  cta: { alignItems: 'center', marginTop: space.xxl },
});
