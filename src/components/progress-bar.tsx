import { StyleSheet, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

type ProgressBarProps = {
  /** Between 0 and 1. */
  progress: number;
  color?: string;
  height?: number;
};

export function ProgressBar({ progress, color, height = 6 }: ProgressBarProps) {
  const theme = useTheme();
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: theme.track },
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height: "100%",
          borderRadius: height / 2,
          backgroundColor: color ?? theme.accent,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
});
