import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

/** Opacity of every `PressableOpacity` while pressed, for consistent feedback. */
const PRESSED_OPACITY = 0.6;

type PressableOpacityProps = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle>;
};

/** A `Pressable` that fades while pressed. */
export function PressableOpacity({ style, ...rest }: PressableOpacityProps) {
  return (
    <Pressable
      style={({ pressed }) => [style, pressed && { opacity: PRESSED_OPACITY }]}
      {...rest}
    />
  );
}
