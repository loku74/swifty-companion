import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const PRESSED_OPACITY = 0.6;

type PressableOpacityProps = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle>;
};

export function PressableOpacity({ style, ...rest }: PressableOpacityProps) {
  return (
    <Pressable
      style={({ pressed }) => [style, pressed && { opacity: PRESSED_OPACITY }]}
      {...rest}
    />
  );
}
