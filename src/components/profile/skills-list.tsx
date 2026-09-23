import orderBy from "lodash/orderBy";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/progress-bar";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Skill } from "@/lib/api";
import { splitLevel } from "@/lib/level";

export function SkillsList({ skills }: { skills: Skill[] }) {
  const theme = useTheme();
  const sorted = orderBy(skills, "level", "desc");

  return (
    <Card>
      {sorted.length === 0 ? (
        <EmptyState>No skills yet for this cursus.</EmptyState>
      ) : (
        sorted.map((skill) => {
          const { level, progress, percent } = splitLevel(skill.level);
          return (
            <View key={skill.id} style={styles.skill}>
              <View style={styles.row}>
                <Text
                  style={[styles.name, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {skill.name}
                </Text>
                <Text style={[styles.level, { color: theme.textSecondary }]}>
                  Level {level} · {percent}%
                </Text>
              </View>
              <ProgressBar progress={progress} />
            </View>
          );
        })
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  skill: {
    gap: Spacing.xs + 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: Spacing.sm,
  },
  name: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  level: {
    fontSize: 14,
    fontVariant: ["tabular-nums"],
  },
});
