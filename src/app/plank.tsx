// #6 Plank (ui-spec §2, frames light/133, light/141). Ends by itself at 0:00.
// Give up = slider; leaving the app = drop (owner 2026-11-25). No tap to stop.
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GiveUpSlider } from '@/components/GiveUpSlider';
import { GlassButton } from '@/components/GlassButton';
import { Scene, riveAvailable } from '@/components/Scene';
import { duckCount, ducksCrossed, finishPlank } from '@/data/store';
import { formatClock } from '@/lib/format';
import { size, type, useColors } from '@/theme';

const CF_TOP_INSET = 47;
const CHARACTER_CENTER = 260; // y 202–318
const TIMER_CAP_TOP = 371;
const TIMER_ASCENT_TO_CAP = 24; // 96 pt rounded: box top → cap top
// Give up: the bridge snaps on this screen first (Rive: ducks fall from where they are, ≤ 0.5 s to the next step,
// 0.85 s fraying, then the fall), then the drop result opens with the bridge already hanging.
const SNAP_SHOW_MS = 2200;

export default function Plank() {
  useKeepAwake();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ seconds: string; auto: string }>();
  const total = Math.max(15, Number(params.seconds) || 45);
  const auto = params.auto === '1';
  const startedAt = useRef(0);
  const done = useRef(false);
  const [elapsed, setElapsed] = useState(0);
  const [sound, setSound] = useState(true);
  const [dropped, setDropped] = useState(false);
  const dy = insets.top - CF_TOP_INSET;

  const finish = useCallback(
    (held: number, show = false) => {
      if (done.current) return;
      done.current = true;
      const full = held >= total;
      const r = finishPlank({ planned: total, held: Math.min(held, total), auto });
      // Success haptic fires on the result screen when the check closes (SuccessMark).
      if (!full) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      const go = () => router.replace({
        pathname: '/result',
        params: {
          kind: full ? 'success' : 'drop',
          ducks: String(r.ducks),
          total: String(duckCount(total)),
          leaves: String(r.leaves),
          next: String(r.nextPlan),
          seconds: String(total),
          auto: auto ? '1' : '0',
        },
      });
      // Gave up with the slider: let the bridge snap here first. Leaving the app: straight to the result.
      if (!full && show && riveAvailable) {
        setDropped(true);
        setTimeout(go, SNAP_SHOW_MS);
      } else go();
    },
    [total, auto],
  );

  useEffect(() => {
    startedAt.current = Date.now();
    const id = setInterval(() => {
      if (done.current) return; // the timer stops while the bridge snaps
      const t = (Date.now() - startedAt.current) / 1000;
      if (t >= total) {
        clearInterval(id);
        finish(total);
      } else setElapsed(t);
    }, 200);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background') finish((Date.now() - startedAt.current) / 1000);
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [total, finish]);

  const remaining = total - elapsed;
  const crossed = ducksCrossed(total, elapsed);
  const n = duckCount(total);

  return (
    <View style={[styles.screen, { backgroundColor: c.bg }]}>
      <View style={[styles.topRow, { top: insets.top }]}>
        <GlassButton label={sound ? 'Вимкнути звук' : 'Увімкнути звук'} onPress={() => setSound((v) => !v)}>
          <SymbolView name={sound ? 'speaker.wave.2.fill' : 'speaker.slash.fill'} size={17} weight="semibold" tintColor={c.ink} />
        </GlassButton>
      </View>

      <Scene ducks="three" mode={dropped ? 'broken' : 'walk'} centerY={CHARACTER_CENTER + dy} />

      <View style={[styles.timerBlock, { top: TIMER_CAP_TOP - TIMER_ASCENT_TO_CAP + dy }]}>
        <Text
          style={[type.timer, { color: c.ink }]}
          maxFontSizeMultiplier={1}
          accessibilityRole="timer"
          accessibilityLabel={`Лишилось ${Math.ceil(remaining)} секунд`}>
          {formatClock(remaining)}
        </Text>
        {/* owner 2026-11-25: «дуже маленьким… більший текст… жирнішим» → 22 Semibold rounded, ink */}
        <Text style={[type.title, { color: c.ink }]} maxFontSizeMultiplier={1.3} accessibilityLiveRegion="polite">
          {crossed} з {n} перейшли
        </Text>
      </View>

      <View style={[styles.bottom, { bottom: insets.bottom + 53 }]}>
        <GiveUpSlider onGiveUp={() => finish((Date.now() - startedAt.current) / 1000, true)} />
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
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  timerBlock: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bottom: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
});
