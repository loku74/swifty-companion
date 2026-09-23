import { StyleSheet, Text, View, type ViewProps } from "react-native";

import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type CardProps = ViewProps & {
  title?: string;
  /** Rendered on the right of the title. */
  accessory?: React.ReactNode;
};

export function Card({
  title,
  accessory,
  style,
  children,
  ...rest
}: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.card }, style]}
      {...rest}
    >
      {title ? (
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {accessory}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderCurve: "continuous",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
});
