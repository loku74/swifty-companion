import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/error-message';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type ApiError, fetchUser, normalizeLogin, toApiError } from '@/lib/ft-api';

const MAX_RECENT = 5;

export default function SearchScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [recent, setRecent] = useState<string[]>([]);

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
      setRecent((previous) => [login, ...previous.filter((item) => item !== login)].slice(0, MAX_RECENT));
      router.push({ pathname: '/user/[login]', params: { login } });
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = query.trim().length > 0 && !loading;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}>
      <Text style={[styles.intro, { color: theme.textSecondary }]}>
        Look up any 42 student by their login.
      </Text>

      <View style={styles.form}>
        <TextInput
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setError(null);
          }}
          onSubmitEditing={() => search(query)}
          placeholder="Login, e.g. norminet"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          returnKeyType="search"
          editable={!loading}
          style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
          accessibilityLabel="Student login"
        />
        <Pressable
          onPress={() => search(query)}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel="Search"
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.accent, opacity: !canSubmit ? 0.5 : pressed ? 0.8 : 1 },
          ]}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonLabel}>Search</Text>
          )}
        </Pressable>
      </View>

      {error ? <ErrorMessage error={error} onRetry={() => search(query)} /> : null}

      {recent.length > 0 ? (
        <View style={styles.recent}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>RECENT</Text>
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
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
                  pressed && { backgroundColor: theme.track },
                ]}>
                <Text style={[styles.recentLabel, { color: theme.text }]}>{login}</Text>
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
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  intro: {
    fontSize: 16,
  },
  form: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    fontSize: 17,
  },
  button: {
    minWidth: 96,
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  recent: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: Spacing.lg,
  },
  recentList: {
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
  },
  recentLabel: {
    fontSize: 16,
  },
});
