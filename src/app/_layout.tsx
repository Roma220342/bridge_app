import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { loadStore } from '@/data/store';
import { useColors } from '@/theme';

export default function RootLayout() {
  const c = useColors();
  useEffect(() => {
    loadStore();
  }, []);

  const base = c.scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, background: c.bg, card: c.bg, text: c.ink, primary: c.ink, border: c.line },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={theme}>
        <StatusBar style={c.scheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="time-sheet"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: 'fitToContents',
              sheetGrabberVisible: false,
              contentStyle: { backgroundColor: c.bg },
            }}
          />
          <Stack.Screen name="countdown" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="plank" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="result" options={{ animation: 'slide_from_right', gestureEnabled: false }} />
          {/* From the side = page with a back arrow; from below = sheet with X (owner 2026-11-25). */}
          <Stack.Screen name="collection" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="achievements" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal', contentStyle: { backgroundColor: c.bg } }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
