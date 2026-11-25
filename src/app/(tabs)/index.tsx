// #3 Home (ui-spec §2, frame light/020). Positions are ChickFocus y-values in pt,
// shifted by the safe-area difference (ChickFocus phone: top inset 47).
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/GlassButton';
import { Icon } from '@/components/Icon';
import { LeafIcon } from '@/components/LeafIcon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Scene } from '@/components/Scene';
import { useStore } from '@/data/store';
import { formatShort } from '@/lib/format';
import { size, type, useColors } from '@/theme';

const CF_TOP_INSET = 47;
const CHARACTER_CENTER = 276; // y 220–332
const CHIP_CENTER = 386;
const START_TOP = 494;

export default function Home() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const plan = useStore((s) => s.plan);
  const leaves = useStore((s) => s.leaves);
  const dy = insets.top - CF_TOP_INSET;

  const start = () => router.push({ pathname: '/countdown', params: { seconds: String(plan), auto: '1' } });

  return (
    <View style={[styles.screen, { backgroundColor: c.bg }]}>
      {/* top row */}
      <View style={[styles.topRow, { top: insets.top }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Листочки: ${leaves}. Відкрити колекцію`}
          onPress={() => router.push('/collection')}>
          <GlassSurface style={styles.counter}>
            <LeafIcon size={20} />
            <Text style={[type.counter, { color: c.ink }]} maxFontSizeMultiplier={1.3}>
              {leaves}
            </Text>
          </GlassSurface>
        </Pressable>
        <GlassSurface style={{ width: size.touch * 2 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Досягнення"
            style={styles.cell}
            onPress={() => router.push('/achievements')}>
            <Icon name="trophy" size={22} color={c.ink} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bridge Pro"
            style={styles.cell}
            onPress={() => router.push('/paywall')}>
            <Icon name="crown" size={22} color={c.ink} />
          </Pressable>
        </GlassSurface>
      </View>

      {/* calm state on home: not decided yet (talk with the owner) → static picture for now */}
      <Scene ducks="one" still centerY={CHARACTER_CENTER + dy} />

      {/* today chip, no background (ChickFocus «Study 5:00 ›») */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Сьогодні ${formatShort(plan)}. Змінити час`}
        onPress={() => router.push('/time-sheet')}
        style={({ pressed }) => [
          styles.chip,
          { top: CHIP_CENTER - size.touch / 2 + dy, opacity: pressed ? 0.6 : 1 },
        ]}>
        <Icon name="timer" size={20} color={c.ink} />
        <Text style={[type.counter, { color: c.ink }]} maxFontSizeMultiplier={1.3}>
          Сьогодні {formatShort(plan)}
        </Text>
        <SymbolView name="chevron.right" size={14} weight="bold" tintColor={c.ink} />
      </Pressable>

      <View style={[styles.start, { top: START_TOP + dy }]}>
        <PrimaryButton label="Старт" onPress={start} haptic />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topRow: {
    position: 'absolute',
    left: size.marginTight,
    right: size.marginTight,
    height: size.touch,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  counter: { paddingLeft: 12, paddingRight: 16, gap: 6 },
  cell: { width: size.touch, height: size.touch, alignItems: 'center', justifyContent: 'center' },
  chip: {
    position: 'absolute',
    alignSelf: 'center',
    height: size.touch,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  start: { position: 'absolute', alignSelf: 'center' },
});
