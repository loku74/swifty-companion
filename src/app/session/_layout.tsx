import { Stack } from "expo-router";

export default function SessionLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Session", headerLargeTitleEnabled: true }}
      />
    </Stack>
  );
}
