// The bridge scene. In our own build: the Rive scene (RiveScene). In Expo Go, on web and with Reduce Motion:
// the static picture from Bridge/art (bridge-preview.svg), as before.
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Image } from 'expo-image';
import { Platform, useWindowDimensions, type ImageStyle, type ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import type { SceneMode } from './RiveScene';

export type { SceneMode };

const sources = {
  empty: require('@/assets/scene/bridge-0.svg'),
  one: require('@/assets/scene/bridge-1.svg'),
  three: require('@/assets/scene/bridge-3.svg'),
};

const ASPECT = 4600 / 2000;

// Rive artboard «Scene»: 920 × 560. While the ducks walk, the picture sits in y ≈ 110–340 (centre 225);
// the snapped bridge hangs below it, down to 560.
const ART_W = 920;
const ART_H = 560;
const ART_CENTER = 225;

/** Rive is native: not in Expo Go and not on web. */
export const riveAvailable =
  Platform.OS !== 'web' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

// Loaded lazily so Expo Go never touches the native module.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- conditional native import
const RiveScene: typeof import('./RiveScene').default | null = riveAvailable ? require('./RiveScene').default : null;

/**
 * `centerY` = where the walking picture's centre goes on screen (same place as the old static scene).
 * `ducks` = the static picture for the fallback.
 */
export function Scene({
  mode = 'walk',
  ducks = 'one',
  centerY,
  still = false,
  style,
}: {
  mode?: SceneMode;
  ducks?: keyof typeof sources;
  centerY: number;
  /** Always the static picture (home: the calm state is not decided yet). */
  still?: boolean;
  style?: ViewStyle;
}) {
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  if (RiveScene && !reduced && !still) {
    const s = width / ART_W;
    return (
      <RiveScene
        mode={mode}
        width={width}
        height={ART_H * s}
        style={{ position: 'absolute', left: 0, top: centerY - ART_CENTER * s, ...style }}
      />
    );
  }
  const h = width / ASPECT;
  return (
    <Image
      source={sources[ducks]}
      style={[{ position: 'absolute', left: 0, top: centerY - h / 2, width, height: h }, style as ImageStyle]}
      contentFit="contain"
      accessible={false}
    />
  );
}

export const sceneHeight = (width: number) => width / ASPECT;
