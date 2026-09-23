import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/card";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { ProjectUser } from "@/lib/ft-api";

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
  const passed = projects.filter((project) => project["validated?"]).length;

  return (
    <Card
      title="Projects"
      accessory={
        projects.length > 0 ? (
          <Text style={{ color: theme.textSecondary }}>
            {passed} passed · {projects.length - passed} failed
          </Text>
        ) : null
      }
    >
      {projects.length === 0 ? (
        <Text style={{ color: theme.textSecondary }}>
          No completed projects for this cursus.
        </Text>
      ) : (
        projects.map((project, index) => {
          const validated = project["validated?"] === true;
          const color = validated ? theme.success : theme.danger;
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
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text
                style={[styles.name, { color: theme.text }]}
                numberOfLines={2}
              >
                {project.project.name}
              </Text>
              <View style={[styles.mark, { borderColor: color }]}>
                <Text style={[styles.markText, { color }]}>
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
});
