import { StyleSheet } from "react-native";

import { useTheme } from "@/hooks/use-theme";

/**
 * Style for a thin line above a list row. Apply it to every row but the first:
 * `index > 0 && separator`.
 */
export function useSeparator() {
  const theme = useTheme();
  return {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.border,
  };
}
