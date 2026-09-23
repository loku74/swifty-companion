import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Swifty Companion', headerLargeTitleEnabled: true }}
      />
      <Stack.Screen name="user/[login]" options={{ headerBackTitle: 'Search' }} />
    </Stack>
  );
}
