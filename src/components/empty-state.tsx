import { Text } from "react-native";

import { useTheme } from "@/hooks/use-theme";

export function EmptyState({ children }: { children: string }) {
  const theme = useTheme();
  return <Text style={{ color: theme.textSecondary }}>{children}</Text>;
}
