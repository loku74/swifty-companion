import { StyleSheet } from "react-native";

import { useTheme } from "@/hooks/use-theme";

export function useSeparator() {
  const theme = useTheme();
  return {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.border,
  };
}
