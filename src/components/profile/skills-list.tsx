import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/card";
import { ProgressBar } from "@/components/progress-bar";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Skill } from "@/lib/ft-api";

export function SkillsList({ skills }: { skills: Skill[] }) {
  const theme = useTheme();
  const sorted = [...skills].sort((a, b) => b.level - a.level);

  return (
    <Card title="Skills">
      {sorted.length === 0 ? (
        <Text style={{ color: theme.textSecondary }}>
          No skills yet for this cursus.
        </Text>
      ) : (
        sorted.map((skill) => {
          const percent = Math.round((skill.level % 1) * 100);
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
                  Level {Math.floor(skill.level)} · {percent}%
                </Text>
              </View>
              <ProgressBar progress={skill.level % 1} />
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
