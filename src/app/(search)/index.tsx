import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ErrorMessage } from "@/components/error-message";
import { PressableOpacity } from "@/components/pressable-opacity";
import { MaxContentWidth, Radius, Spacing } from "@/constants/theme";
import { useSeparator } from "@/hooks/use-separator";
import { useTheme } from "@/hooks/use-theme";
import {
  type ApiError,
  fetchUser,
  normalizeLogin,
  toApiError,
} from "@/lib/api";
import {
  addRecentSearch,
  loadRecentSearches,
  saveRecentSearches,
} from "@/lib/recent-searches";

export default function SearchScreen() {
  const theme = useTheme();
  const separator = useSeparator();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [recent, setRecent] = useState(loadRecentSearches);
  const [focused, setFocused] = useState(false);

  async function search(input: string) {
    if (loading) return;
    setError(null);

    let login: string;
    try {
      login = normalizeLogin(input);
    } catch (e) {
      setError(toApiError(e));
      return;
    }

    setLoading(true);
    try {
      // Fetch first so a missing login is reported here, on the search view.
      await fetchUser(login);
      const nextRecent = addRecentSearch(recent, login);
      setRecent(nextRecent);
      saveRecentSearches(nextRecent);
      router.push({ pathname: "/user/[login]", params: { login } });
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.intro, { color: theme.textSecondary }]}>
        Look up any 42 student by their login.
      </Text>

      <View style={styles.form}>
        <View
          style={[
            styles.field,
            {
              backgroundColor: theme.card,
              borderColor: focused ? theme.accent : theme.border,
            },
          ]}
        >
          <SymbolView
            name={{ ios: "magnifyingglass", android: "search" }}
            size={18}
            tintColor={focused ? theme.accent : theme.textSecondary}
          />
          <TextInput
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setError(null);
            }}
            onSubmitEditing={() => search(query)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Login, e.g. norminet"
            placeholderTextColor={theme.textSecondary}
            selectionColor={theme.accent}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            returnKeyType="search"
            editable={!loading}
            style={[styles.input, { color: theme.text }]}
            accessibilityLabel="Student login"
          />
          {query.length > 0 && !loading ? (
            <PressableOpacity
              onPress={() => {
                setQuery("");
                setError(null);
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear"
            >
              <SymbolView
                name={{
                  ios: "xmark.circle.fill",
                  android: "cancel",
                }}
                size={18}
                tintColor={theme.textSecondary}
              />
            </PressableOpacity>
          ) : null}
        </View>
      </View>

      {error ? (
        <ErrorMessage error={error} onRetry={() => search(query)} />
      ) : null}

      {recent.length > 0 ? (
        <View style={styles.recent}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            RECENT
          </Text>
          <View style={[styles.recentList, { backgroundColor: theme.card }]}>
            {recent.map((login, index) => (
              <Pressable
                key={login}
                onPress={() => {
                  setQuery(login);
                  search(login);
                }}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.recentItem,
                  index > 0 && separator,
                  pressed && { backgroundColor: theme.track },
                ]}
              >
                <Text style={[styles.recentLabel, { color: theme.text }]}>
                  {login}
                </Text>
                <Text style={{ color: theme.textSecondary }}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
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
    fontSize: 16,
  },
  form: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  field: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderCurve: "continuous",
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    alignSelf: "stretch",
    fontSize: 16,
  },
  recent: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: Spacing.lg,
  },
  recentList: {
    borderRadius: Radius.md,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
  },
  recentLabel: {
    fontSize: 16,
  },
});
