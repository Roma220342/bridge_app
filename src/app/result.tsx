// #7 Success (IMG_5027) and #8 Drop (frame light/147). Simple version of the Mobbin mix (ui-spec §8):
// success (owner 2026-11-25: «Качка з сяйвом», «Так, на обидва»): duck in a warm glow hops, sprinkles burst
// (SuccessHero); big number = days with a plank (only grows), row of days with today filling in, chips
// +leaves / ducks / tomorrow; share + «Готово». Text reveals in a short stagger; buttons are there at once.
// No X on top: exit only via the buttons (owner: «Перше так прибираємо»).
// drop = hanging bridge + number + «Завтра N с» + row of days, «Додому» + «Ще раз». No red, no penalty.
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/Chip';
import { DaysRow } from '@/components/DaysRow';
import { Icon } from '@/components/Icon';
import { LeafIcon } from '@/components/LeafIcon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Scene, riveAvailable, sceneHeight } from '@/components/Scene';
import { Reveal } from '@/components/Reveal';
import { HERO, HOP_AT, SuccessHero } from '@/components/SuccessHero';
import { TextButton } from '@/components/TextButton';
import { plankDays, useStore } from '@/data/store';
import { formatShort, plural } from '@/lib/format';
import { size, type, useColors } from '@/theme';

const CF_TOP_INSET = 47;

export default function Result() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const p = useLocalSearchParams<{
    kind: 'success' | 'drop';
    ducks: string;
    total: string;
    leaves: string;
    next: string;
    seconds: string;
    auto: string;
  }>();
  const success = p.kind === 'success';
  const ducks = Number(p.ducks) || 0;
  const leaves = Number(p.leaves) || 0;
  const next = Number(p.next) || 0;
  const dy = insets.top - CF_TOP_INSET;
  const home = () => router.dismissTo('/');
  const days = useStore((s) => plankDays(s).length);
  const word = plural(ducks, 'качка перейшла', 'качки перейшли', 'качок перейшли');

  const chips = (
    <View style={styles.chips}>
      <Chip icon={<LeafIcon size={16} />} label={`+${leaves}`} />
      <Chip label={`Завтра ${formatShort(next)}`} />
    </View>
  );

  if (success) {
    const share = () =>
      Share.share({ message: `Bridge: планка ${formatShort(Number(p.seconds))}, ${ducks} ${word} міст.` });
    return (
      <View style={[styles.screen, { backgroundColor: c.bg }]}>
        {/* hero centre at y 230 (ChickFocus illustration y 110–350) */}
        <View style={[styles.hero, { top: 230 - HERO / 2 + dy }]}>
          <SuccessHero />
        </View>
        <View style={[styles.block, { top: 362 + dy }]}>
          <Reveal at={250}>
            <Text style={[type.resultNumber, styles.center, { color: c.ink }]} maxFontSizeMultiplier={1.2}>
              {days}
            </Text>
          </Reveal>
          <Reveal at={320}>
            <Text style={[type.body, { color: c.ink2 }]}>{plural(days, 'день', 'дні', 'днів')} з планкою</Text>
          </Reveal>
          <Reveal at={400} style={styles.days}>
            <DaysRow fillTodayAt={HOP_AT + 250} />
          </Reveal>
          <Reveal at={480} style={[styles.chips, styles.chipsAfterDays]}>
            <Chip icon={<LeafIcon size={16} />} label={`+${leaves}`} />
            <Chip label={`${ducks} ${plural(ducks, 'качка', 'качки', 'качок')}`} />
            <Chip label={`Завтра ${formatShort(next)}`} />
          </Reveal>
        </View>
        <View style={[styles.bottomRow, { top: 697 + dy }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Поділитися"
            onPress={share}
            style={({ pressed }) => [styles.share, { backgroundColor: c.surface, borderColor: c.line, opacity: pressed ? 0.7 : 1 }]}>
            <Icon name="share" size={22} color={c.ink} />
          </Pressable>
          <PrimaryButton label="Готово" onPress={home} width={165} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: c.bg }]}>
      <HangingBridge centerY={230 + dy} />
      <View style={[styles.block, { top: 362 + dy }]}>
        <Text style={[type.resultNumber, { color: c.ink }]} maxFontSizeMultiplier={1.2}>
          {ducks}
        </Text>
        <Text style={[type.body, { color: c.ink2 }]}>{word}</Text>
        {chips}
        <View style={{ marginTop: 24 }}>
          <DaysRow />
        </View>
      </View>
      <View style={[styles.actions, { top: 637 + dy }]}>
        <PrimaryButton label="Додому" onPress={home} width={size.buttonWidthResult} />
        <View style={{ marginTop: 16 }}>
          <TextButton
            label="Ще раз"
            icon="retry"
            onPress={() => router.replace({ pathname: '/countdown', params: { seconds: p.seconds, auto: '0' } })}
          />
        </View>
      </View>
    </View>
  );
}

/**
 * Our own build: the Rive scene, already hanging (`hung`; the snap itself played on the Plank screen).
 * Expo Go / web: the static bridge tilted, swaying slowly. Reduce Motion: static.
 */
function HangingBridge({ centerY }: { centerY: number }) {
  const reduced = useReducedMotion();
  const { width } = useWindowDimensions();
  const h = sceneHeight(width);
  const sway = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    const ease = Easing.inOut(Easing.sin);
    sway.value = withRepeat(
      withSequence(withTiming(1, { duration: 1600, easing: ease }), withTiming(-1, { duration: 1600, easing: ease })),
      -1,
      true,
    );
  }, [reduced, sway]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${14 + sway.value * 2}deg` }] }));
  if (riveAvailable && !reduced) return <Scene mode="hung" centerY={centerY} />;
  return (
    <Animated.View style={[{ position: 'absolute', top: centerY - h / 2, width, height: h, transformOrigin: 'left top' }, style]}>
      <Scene ducks="empty" still centerY={h / 2} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  hero: { position: 'absolute', alignSelf: 'center' },
  center: { textAlign: 'center' },
  days: { marginTop: 24 },
  chipsAfterDays: { marginTop: 24 },
  block: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  chips: { flexDirection: 'row', gap: 12, marginTop: 18 },
  bottomRow: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', gap: 11 },
  share: {
    width: 64,
    height: 64,
    borderRadius: size.buttonRadius,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { position: 'absolute', alignSelf: 'center', alignItems: 'center' },
});
