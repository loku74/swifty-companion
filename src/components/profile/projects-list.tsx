import { SymbolView } from "expo-symbols";
import orderBy from "lodash/orderBy";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { PressableOpacity } from "@/components/pressable-opacity";
import { Radius, Spacing } from "@/constants/theme";
import { useSeparator } from "@/hooks/use-separator";
import { useTheme } from "@/hooks/use-theme";
import type { ProjectUser } from "@/lib/api";

/** Marks with their own badge color instead of the passed/failed one. */
const SPECIAL_MARK_COLORS: Record<number, string> = {
  // Darker than a normal fail, so cheating stands out.
  [-42]: "#8B0A1A",
  125: "#FF75F6",
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
  return orderBy(
    projects,
    [(project) => project.final_mark === null, "final_mark"],
    ["asc", order === "highest" ? "desc" : "asc"],
  );
}

/** Finished projects (passed and failed) of a cursus, most recent first. */
export function getCompletedProjects(
  projects: ProjectUser[],
  cursusId: number | undefined,
) {
  const completed = projects.filter(
    (project) =>
      project.status === "finished" &&
      (cursusId === undefined || project.cursus_ids.includes(cursusId)),
  );
  return orderBy(completed, (project) => project.marked_at ?? "", "desc");
}

export function ProjectsList({ projects }: { projects: ProjectUser[] }) {
  const theme = useTheme();
  const separator = useSeparator();
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
            <PressableOpacity
              onPress={() =>
                setSortIndex((index) => (index + 1) % SORT_ORDERS.length)
              }
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Sorted by ${label.toLowerCase()}. Change sort order`}
              style={styles.sortButton}
            >
              <SymbolView
                name={{
                  ios: "arrow.up.arrow.down",
                  android: "swap_vert",
                }}
                size={13}
                tintColor={theme.accent}
              />
              <Text style={[styles.sortLabel, { color: theme.accent }]}>
                {label}
              </Text>
            </PressableOpacity>
          ) : null}
        </View>
      ) : null}
      {projects.length === 0 ? (
        <EmptyState>No completed projects for this cursus.</EmptyState>
      ) : (
        sortProjects(projects, order).map((project, index) => {
          const validated = project["validated?"] === true;
          const markColor =
            (project.final_mark !== null &&
              SPECIAL_MARK_COLORS[project.final_mark]) ||
            (validated ? theme.success : theme.danger);

          return (
            <View
              key={project.id}
              style={[styles.row, index > 0 && separator]}
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
                <Text style={[styles.markText, { color: theme.onAccent }]}>
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
});
