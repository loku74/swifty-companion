import { useEffect, useState, useSyncExternalStore } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Card } from "@/components/card";
import { ErrorMessage } from "@/components/error-message";
import { MaxContentWidth, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  type ApiError,
  corruptToken,
  expireTokenNow,
  getCurrentToken,
  getToken,
  hasCredentials,
  subscribeToToken,
  toApiError,
} from "@/lib/ft-api";

function formatDuration(ms: number) {
  if (ms <= 0) return "expired";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0
    ? `${hours}h ${pad(minutes)}m ${pad(seconds)}s`
    : `${minutes}m ${pad(seconds)}s`;
}

/** Current time, updated every second. */
function useNow() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  return now;
}

export default function SessionScreen() {
  const theme = useTheme();
  const token = useSyncExternalStore(subscribeToToken, getCurrentToken);
  const now = useNow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  async function requestToken() {
    setLoading(true);
    setError(null);
    try {
      await getToken();
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setLoading(false);
    }
  }

  const rows: [string, string][] = [
    ["Credentials", hasCredentials() ? "Loaded from .env" : "Missing"],
    ["Access token", token ? `${token.accessToken.slice(0, 8)}…` : "None yet"],
    ["Created", token ? new Date(token.createdAt).toLocaleTimeString() : "–"],
    ["Expires in", token ? formatDuration(token.expiresAt - now) : "–"],
  ];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.intro, { color: theme.textSecondary }]}>
        The app authenticates with the 42 API through OAuth2 (client
        credentials). A single token is reused for every request and renewed
        automatically when it expires or gets rejected.
      </Text>

      <Card title="OAuth2 token">
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {label}
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
          </View>
        ))}
      </Card>

      {error ? <ErrorMessage error={error} onRetry={requestToken} /> : null}

      <Card title="Test token renewal">
        <Text style={{ color: theme.textSecondary }}>
          Break the current token, then search for a login: the app gets a new
          token without showing an error.
        </Text>
        <ActionButton
          label="Get token"
          onPress={requestToken}
          loading={loading}
        />
        <ActionButton
          label="Expire token now"
          onPress={expireTokenNow}
          disabled={!token}
        />
        <ActionButton
          label="Simulate revoked token"
          onPress={corruptToken}
          disabled={!token}
        />
      </Card>
    </ScrollView>
  );
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

function ActionButton({
  label,
  onPress,
  disabled,
  loading,
}: ActionButtonProps) {
  const theme = useTheme();
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.background,
          opacity: inactive ? 0.5 : pressed ? 0.7 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.accent} />
      ) : (
        <Text style={[styles.buttonLabel, { color: theme.accent }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  intro: {
    fontSize: 15,
    lineHeight: 21,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  label: {
    fontSize: 15,
  },
  value: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    textAlign: "right",
  },
  button: {
    minHeight: 44,
    borderRadius: Radius.md,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
