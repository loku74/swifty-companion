import { StyleSheet, Text, View, type ViewProps } from "react-native";

import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type CardProps = ViewProps & {
  title?: string;
};

export function Card({ title, style, children, ...rest }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.card }, style]}
      {...rest}
    >
      {title ? (
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
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
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
});
