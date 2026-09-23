import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/card";
import { ProgressBar } from "@/components/progress-bar";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { CursusUser, User } from "@/lib/ft-api";

const AVATAR_SIZE = 104;

type ProfileHeaderProps = {
  user: User;
  cursus: CursusUser | undefined;
};

export function ProfileHeader({ user, cursus }: ProfileHeaderProps) {
  const theme = useTheme();
  const avatar = user.image?.versions?.medium ?? user.image?.link;
  const level = cursus?.level ?? 0;

  return (
    <Card style={styles.card}>
      {avatar ? (
        <Image
          source={avatar}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
          accessibilityLabel={`Profile picture of ${user.login}`}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            styles.placeholder,
            { backgroundColor: theme.track },
          ]}
        >
          <Text style={[styles.initials, { color: theme.textSecondary }]}>
            {user.login.slice(0, 2).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.identity}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
          {user.displayname}
        </Text>
        <Text style={[styles.login, { color: theme.textSecondary }]}>
          @{user.login}
        </Text>
        {cursus?.grade ? (
          <Text style={[styles.grade, { color: theme.accent }]}>
            {cursus.grade}
          </Text>
        ) : null}
      </View>

      {cursus ? (
        <View style={styles.level}>
          <View style={styles.levelLabels}>
            <Text style={[styles.levelText, { color: theme.text }]}>
              Level {Math.floor(level)}
            </Text>
            <Text style={[styles.levelText, { color: theme.textSecondary }]}>
              {Math.round((level % 1) * 100)}%
            </Text>
          </View>
          <ProgressBar progress={level % 1} height={10} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    gap: Spacing.lg,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 32,
    fontWeight: "600",
  },
  identity: {
    alignItems: "center",
    gap: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  login: {
    fontSize: 16,
  },
  grade: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
  level: {
    alignSelf: "stretch",
    gap: Spacing.xs + 2,
  },
  levelLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  levelText: {
    fontSize: 15,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
