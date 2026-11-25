// Temporary screen body until the screen is built (phase 2 of hifi-v1).
// Owner 2026-11-25: «все, що знизу, це має виглядати як bottom sheet. Все, що виїжджає з боку,
// це має бути окрема сторінка з стрілкою назад» → nav="back" for pushed pages, nav="close" for sheets.
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassButton } from './GlassButton';
import { size, space, type, useColors } from '@/theme';

export function Placeholder({ title, nav }: { title: string; nav?: 'back' | 'close' }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { backgroundColor: c.bg, paddingTop: nav === 'close' ? space.l : insets.top }]}>
      <View style={styles.header}>
        {nav === 'back' ? (
          <GlassButton label="Назад" onPress={() => router.back()}>
            <SymbolView name="chevron.left" size={17} weight="semibold" tintColor={c.ink} />
          </GlassButton>
        ) : nav === 'close' ? (
          <GlassButton label="Закрити" onPress={() => router.back()}>
            <SymbolView name="xmark" size={17} weight="semibold" tintColor={c.ink} />
          </GlassButton>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={[type.title, { color: c.ink }]}>{title}</Text>
        <Text style={[type.callout, { color: c.ink2 }]}>Екран у роботі</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { height: size.touch, paddingHorizontal: size.marginTight, flexDirection: 'row' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
});
