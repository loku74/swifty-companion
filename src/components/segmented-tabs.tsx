import { Pressable, StyleSheet, Text, View } from "react-native";

import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type SegmentedTab<T extends string> = {
  key: T;
  label: string;
  /** Shown next to the label, once known. */
  count?: number;
};

type SegmentedTabsProps<T extends string> = {
  tabs: SegmentedTab<T>[];
  selected: T;
  onSelect: (key: T) => void;
};

/** A minimalist segmented control to switch between sections of a screen. */
export function SegmentedTabs<T extends string>({
  tabs,
  selected,
  onSelect,
}: SegmentedTabsProps<T>) {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.track }]}
      accessibilityRole="tablist"
    >
      {tabs.map((tab) => {
        const isSelected = tab.key === selected;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.tab,
              isSelected && [styles.selected, { backgroundColor: theme.card }],
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: isSelected ? theme.text : theme.textSecondary },
              ]}
              numberOfLines={1}
            >
              {tab.label}
              {tab.count !== undefined ? (
                <Text style={{ color: theme.textSecondary }}>
                  {` ${tab.count}`}
                </Text>
              ) : null}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: Radius.md,
    borderCurve: "continuous",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md - 4,
    borderCurve: "continuous",
  },
  selected: {
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
