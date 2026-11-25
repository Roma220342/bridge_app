// One place for our own icons (Phosphor, weight Bold). Swap the set or weight here only.
// System places (tabs, close, chevrons) use SF Symbols directly.
import {
  ArrowCounterClockwise,
  ArrowLeft,
  CaretDoubleLeft,
  CaretRight,
  Crown,
  House,
  ShareFat,
  Timer,
  Trophy,
  X,
  type IconProps,
} from 'phosphor-react-native';

const icons = {
  timer: Timer,
  trophy: Trophy,
  crown: Crown,
  share: ShareFat,
  retry: ArrowCounterClockwise,
  home: House,
  close: X,
  chevron: CaretRight,
  arrowLeft: ArrowLeft,
  chevronsLeft: CaretDoubleLeft,
} as const;

export type IconName = keyof typeof icons;

export function Icon({ name, size = 22, color, ...rest }: { name: IconName } & IconProps) {
  const Cmp = icons[name];
  return <Cmp size={size} color={color} weight="bold" {...rest} />;
}
