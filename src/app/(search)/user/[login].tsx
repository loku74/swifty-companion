import { Stack, useLocalSearchParams } from "expo-router";
import maxBy from "lodash/maxBy";
import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ErrorMessage } from "@/components/error-message";
import { CursusPicker } from "@/components/profile/cursus-picker";
import { EventsList } from "@/components/profile/events-list";
import { ProfileDetails } from "@/components/profile/profile-details";
import { ProfileHeader } from "@/components/profile/profile-header";
import {
  getCompletedProjects,
  ProjectsList,
} from "@/components/profile/projects-list";
import { SkillsList } from "@/components/profile/skills-list";
import { SegmentedTabs } from "@/components/segmented-tabs";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useUser } from "@/hooks/use-user";
import type { CursusUser } from "@/lib/api";

/** Prefers the main 42 cursus, otherwise the most recently started one. */
function getDefaultCursus(cursusUsers: CursusUser[]) {
  return (
    cursusUsers.find((cursusUser) => cursusUser.cursus.slug === "42cursus") ??
    maxBy(cursusUsers, "begin_at")
  );
}

type Section = "projects" | "skills" | "events";

export default function ProfileScreen() {
  const theme = useTheme();
  const { login } = useLocalSearchParams<{ login: string }>();
  const { status, user, error, refreshing, refresh } = useUser(login);
  const [selectedCursusId, setSelectedCursusId] = useState<number>();
  const [section, setSection] = useState<Section>("projects");

  const cursus = user
    ? (user.cursus_users.find(
        (cursusUser) => cursusUser.cursus_id === selectedCursusId,
      ) ?? getDefaultCursus(user.cursus_users))
    : undefined;
  const projects = user
    ? getCompletedProjects(user.projects_users, cursus?.cursus_id)
    : [];

  return (
    <>
      <Stack.Screen options={{ title: login }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.content}
        refreshControl={
          status !== "loading" ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={theme.accent}
            />
          ) : undefined
        }
      >
        {status === "loading" ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        ) : null}

        {status === "error" ? (
          <ErrorMessage error={error} onRetry={refresh} />
        ) : null}

        {status === "success" ? (
          <>
            <ProfileHeader user={user} cursus={cursus} />
            {user.cursus_users.length > 1 ? (
              <CursusPicker
                cursusUsers={user.cursus_users}
                selectedId={cursus?.cursus_id}
                onSelect={setSelectedCursusId}
              />
            ) : null}
            <ProfileDetails user={user} />
            <SegmentedTabs
              tabs={[
                { key: "projects", label: "Projects", count: projects.length },
                {
                  key: "skills",
                  label: "Skills",
                  count: cursus?.skills.length ?? 0,
                },
                {
                  key: "events",
                  label: "Events",
                  count: user.events.length,
                },
              ]}
              selected={section}
              onSelect={setSection}
            />
            {section === "projects" ? (
              <ProjectsList projects={projects} />
            ) : null}
            {section === "skills" ? (
              <SkillsList skills={cursus?.skills ?? []} />
            ) : null}
            {section === "events" ? <EventsList events={user.events} /> : null}
          </>
        ) : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  loading: {
    paddingVertical: Spacing.xl * 3,
    alignItems: "center",
  },
});
