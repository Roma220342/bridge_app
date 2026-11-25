// #5 Countdown (ui-spec §2): 5…1 at `countdown` 160, «Телефон під обличчя», «Скасувати» below.
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TextButton } from '@/components/TextButton';
import { motion, type, useColors } from '@/theme';

const enter = FadeIn.duration(200).easing(Easing.bezier(...motion.easeOut).factory()).reduceMotion(ReduceMotion.Never);

export default function Countdown() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { seconds = '45', auto = '1' } = useLocalSearchParams<{ seconds: string; auto: string }>();
  const [n, setN] = useState(5);

  useEffect(() => {
    if (n === 0) {
      router.replace({ pathname: '/plank', params: { seconds, auto } });
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const t = setTimeout(() => setN(n - 1), 1000);
    return () => clearTimeout(t);
  }, [n, seconds, auto]);

  return (
    <View style={[styles.screen, { backgroundColor: c.bg }]}>
      <View style={styles.center} accessible accessibilityLiveRegion="assertive" accessibilityLabel={`${Math.max(n, 1)}`}>
        <Animated.Text key={Math.max(n, 1)} entering={enter} style={[type.countdown, { color: c.ink }]} maxFontSizeMultiplier={1}>
          {Math.max(n, 1)}
        </Animated.Text>
        <Text style={[type.callout, { color: c.ink2 }]}>Телефон під обличчя</Text>
      </View>
      <View style={[styles.bottom, { bottom: insets.bottom + 53 }]}>
        <TextButton label="Скасувати" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bottom: { position: 'absolute', left: 0, right: 0, height: 64, alignItems: 'center', justifyContent: 'center' },
});
