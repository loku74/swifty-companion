import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/card";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { ProjectUser } from "@/lib/ft-api";

/** Marks with their own badge color instead of the passed/failed one. */
const SPECIAL_MARKS: Record<number, { color: string }> = {
  // Darker than a normal fail, so cheating stands out.
  [-42]: { color: "#8B0A1A" },
  125: { color: "#FF75F6" },
};

type SortOrder = "recent" | "highest" | "lowest";

/** Tapping the sort button cycles through these, in order. */
const SORT_ORDERS: { order: SortOrder; label: string }[] = [
  { order: "recent", label: "Recent" },
  { order: "highest", label: "Highest mark" },
  { order: "lowest", label: "Lowest mark" },
];

/** `projects` is already sorted by date; unmarked projects always go last. */
function sortProjects(projects: ProjectUser[], order: SortOrder) {
  if (order === "recent") return projects;
  const direction = order === "highest" ? -1 : 1;
  return [...projects].sort((a, b) => {
    if (a.final_mark === null) return b.final_mark === null ? 0 : 1;
    if (b.final_mark === null) return -1;
    return (a.final_mark - b.final_mark) * direction;
  });
}

/** Finished projects (passed and failed) of a cursus, most recent first. */
export function getCompletedProjects(
  projects: ProjectUser[],
  cursusId: number | undefined,
) {
  return projects
    .filter((project) => project.status === "finished")
    .filter(
      (project) =>
        cursusId === undefined || project.cursus_ids.includes(cursusId),
    )
    .sort((a, b) => (b.marked_at ?? "").localeCompare(a.marked_at ?? ""));
}

export function ProjectsList({ projects }: { projects: ProjectUser[] }) {
  const theme = useTheme();
  const [sortIndex, setSortIndex] = useState(0);
  const { order, label } = SORT_ORDERS[sortIndex];
  const passed = projects.filter((project) => project["validated?"]).length;

  return (
    <Card>
      {projects.length > 0 ? (
        <View style={styles.toolbar}>
          <Text style={{ color: theme.textSecondary }}>
            {passed} passed · {projects.length - passed} failed
          </Text>
          {projects.length > 1 ? (
            <Pressable
              onPress={() =>
                setSortIndex((index) => (index + 1) % SORT_ORDERS.length)
              }
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Sorted by ${label.toLowerCase()}. Change sort order`}
              style={({ pressed }) => [
                styles.sortButton,
                { opacity: pressed ? 0.5 : 1 },
              ]}
            >
              <SymbolView
                name={{
                  ios: "arrow.up.arrow.down",
                  android: "swap_vert",
                  web: "swap_vert",
                }}
                size={13}
                tintColor={theme.accent}
              />
              <Text style={[styles.sortLabel, { color: theme.accent }]}>
                {label}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {projects.length === 0 ? (
        <Text style={{ color: theme.textSecondary }}>
          No completed projects for this cursus.
        </Text>
      ) : (
        sortProjects(projects, order).map((project, index) => {
          const validated = project["validated?"] === true;
          const color = validated ? theme.success : theme.danger;

          const special =
            project.final_mark === null
              ? undefined
              : SPECIAL_MARKS[project.final_mark];
          const markColor = special?.color ?? color;

          return (
            <View
              key={project.id}
              style={[
                styles.row,
                index > 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: theme.border,
                },
              ]}
              accessible
              accessibilityLabel={`${project.project.name}, ${validated ? "passed" : "failed"} with ${project.final_mark ?? 0}`}
            >
              <Text
                style={[styles.name, { color: theme.text }]}
                numberOfLines={2}
              >
                {project.project.name}
              </Text>
              <View
                style={[
                  styles.mark,
                  { borderColor: markColor, backgroundColor: markColor },
                ]}
              >
                <Text style={[styles.markText, { color: "#FFFFFF" }]}>
                  {project.final_mark ?? "–"}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingTop: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    flex: 1,
    fontSize: 15,
  },
  mark: {
    minWidth: 48,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    alignItems: "center",
  },
  markText: {
    fontSize: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  specialLabel: {
    fontWeight: "600",
    fontSize: 12,
    opacity: 0.67,
  },
});
