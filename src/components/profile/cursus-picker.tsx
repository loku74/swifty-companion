import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { CursusUser } from "@/lib/ft-api";

type CursusPickerProps = {
  cursusUsers: CursusUser[];
  selectedId: number | undefined;
  onSelect: (cursusId: number) => void;
};

export function CursusPicker({
  cursusUsers,
  selectedId,
  onSelect,
}: CursusPickerProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {cursusUsers.map(({ cursus }) => {
        const selected = cursus.id === selectedId;
        return (
          <Pressable
            key={cursus.id}
            onPress={() => onSelect(cursus.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.chip,
              { backgroundColor: selected ? theme.accent : theme.card },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? "#FFFFFF" : theme.text },
              ]}
            >
              {cursus.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
