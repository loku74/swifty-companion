import { StyleSheet, Text, View } from "react-native";

import { PressableOpacity } from "@/components/pressable-opacity";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { ApiError, ApiErrorKind } from "@/lib/api";

const TITLES: Record<ApiErrorKind, string> = {
  "invalid-login": "Invalid login",
  config: "App not configured",
  network: "No connection",
  timeout: "Request timed out",
  "not-found": "Login not found",
  unauthorized: "Authentication failed",
  "rate-limited": "Slow down",
  server: "42 API unavailable",
  unknown: "Something went wrong",
};

/** Errors worth retrying as-is, without changing the input. */
const RETRYABLE: ApiErrorKind[] = [
  "network",
  "timeout",
  "rate-limited",
  "server",
  "unknown",
];

type ErrorMessageProps = {
  error: ApiError;
  onRetry?: () => void;
};

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  const theme = useTheme();
  const canRetry = onRetry && RETRYABLE.includes(error.kind);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.dangerBackground }]}
      accessibilityRole="alert"
    >
      <Text style={[styles.title, { color: theme.danger }]}>
        {TITLES[error.kind]}
      </Text>
      <Text style={[styles.message, { color: theme.text }]}>
        {error.message}
      </Text>
      {canRetry ? (
        <PressableOpacity
          onPress={onRetry}
          accessibilityRole="button"
          style={[styles.retry, { borderColor: theme.danger }]}
        >
          <Text style={[styles.retryLabel, { color: theme.danger }]}>
            Try again
          </Text>
        </PressableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.md,
    borderCurve: "continuous",
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  message: {
    fontSize: 15,
    lineHeight: 21,
  },
  retry: {
    alignSelf: "flex-start",
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  retryLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});
