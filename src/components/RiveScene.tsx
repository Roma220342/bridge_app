// The Rive scene from Bridge/rive (bridge.rml → assets/rive/bridge.riv).
// View model `Bridge`: `broken` = the plank was dropped (ducks fall from where they are, the bridge snaps),
// `hung` = start already hanging (the drop result screen). Imported only in our own build: Rive is native.
import { Fit, RiveView, useRiveBoolean, useRiveFile, useViewModelInstance } from '@rive-app/react-native';
import { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';

export type SceneMode = 'walk' | 'broken' | 'hung';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- Metro asset (.riv)
const source = require('@/assets/rive/bridge.riv');

export default function RiveScene({ mode, width, height, style }: { mode: SceneMode; width: number; height: number; style?: ViewStyle }) {
  const { riveFile } = useRiveFile(source);
  const { instance } = useViewModelInstance(riveFile, { async: true });
  const broken = useRiveBoolean('broken', instance);
  const hung = useRiveBoolean('hung', instance);
  const setBroken = broken.setValue;
  const setHung = hung.setValue;

  useEffect(() => {
    if (!instance) return;
    setBroken(mode !== 'walk');
    setHung(mode === 'hung');
  }, [instance, mode, setBroken, setHung]);

  return (
    // No taps: the scene only shows (the tap area in the file is for the preview window).
    <View pointerEvents="none" style={[{ width, height }, style]} accessible={false}>
      {riveFile && instance ? (
        <RiveView file={riveFile} dataBind={instance} autoPlay fit={Fit.Contain} style={{ width, height }} />
      ) : null}
    </View>
  );
}
