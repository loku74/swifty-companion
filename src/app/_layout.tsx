import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const baseTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const colors = Colors[scheme];

  return (
    <ThemeProvider
      value={{
        ...baseTheme,
        colors: { ...baseTheme.colors, primary: colors.accent, background: colors.background },
      }}>
      <NativeTabs tintColor={colors.accent}>
        <NativeTabs.Trigger name="(search)">
          <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="session">
          <NativeTabs.Trigger.Label>Session</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: 'key', selected: 'key.fill' }} md="key" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
