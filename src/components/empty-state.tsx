import { Text } from "react-native";

import { useTheme } from "@/hooks/use-theme";

/** A short muted message for lists that have nothing to show. */
export function EmptyState({ children }: { children: string }) {
  const theme = useTheme();
  return <Text style={{ color: theme.textSecondary }}>{children}</Text>;
}
