import { SymbolView } from "expo-symbols";
import lowerCase from "lodash/lowerCase";
import upperFirst from "lodash/upperFirst";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { Radius, Spacing } from "@/constants/theme";
import { useSeparator } from "@/hooks/use-separator";
import { useTheme } from "@/hooks/use-theme";
import type { FtEvent } from "@/lib/api";

/** "meet_up" → "Meet up" */
function formatKind(kind: string) {
  return upperFirst(lowerCase(kind));
}

export function EventsList({ events }: { events: FtEvent[] }) {
  const theme = useTheme();
  const separator = useSeparator();
  const now = new Date().toISOString();

  return (
    <Card>
      {events.length === 0 ? (
        <EmptyState>No event subscriptions yet.</EmptyState>
      ) : (
        events.map((event, index) => {
          const date = new Date(event.begin_at);
          const upcoming = event.begin_at > now;
          const location = event.location.trim();
          return (
            <View
              key={event.id}
              style={[styles.row, index > 0 && [separator, styles.nextRow]]}
              accessible
              accessibilityLabel={`${event.name}, ${date.toLocaleDateString()}, ${event.nbr_subscribers} subscribed${upcoming ? ", upcoming" : ""}`}
            >
              <View
                style={[styles.date, { backgroundColor: theme.background }]}
              >
                <Text style={[styles.day, { color: theme.text }]}>
                  {date.getDate()}
                </Text>
                <Text style={[styles.month, { color: theme.textSecondary }]}>
                  {date.toLocaleDateString(undefined, { month: "short" })}
                </Text>
                <Text style={[styles.year, { color: theme.textSecondary }]}>
                  {date.getFullYear()}
                </Text>
              </View>
              <View style={styles.info}>
                <View style={styles.header}>
                  <Text
                    style={[styles.name, { color: theme.text }]}
                    numberOfLines={2}
                  >
                    {event.name}
                  </Text>
                  <View style={styles.subscribers}>
                    <SymbolView
                      name={{
                        ios: "person",
                        android: "person",
                        web: "person",
                      }}
                      size={10}
                      tintColor={theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.subscribersText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {event.nbr_subscribers}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.meta, { color: theme.textSecondary }]}
                  numberOfLines={1}
                >
                  {[formatKind(event.kind), location]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
                {upcoming ? (
                  <Text style={[styles.upcoming, { color: theme.accent }]}>
                    Upcoming
                  </Text>
                ) : null}
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
  },
  nextRow: {
    paddingTop: Spacing.md,
  },
  date: {
    width: 52,
    alignItems: "center",
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderCurve: "continuous",
  },
  day: {
    fontSize: 18,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  month: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  year: {
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  info: {
    flex: 1,
    gap: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  subscribers: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingTop: 2,
  },
  subscribersText: {
    fontSize: 10,
    fontVariant: ["tabular-nums"],
  },
  meta: {
    fontSize: 13,
  },
  upcoming: {
    fontSize: 12,
    fontWeight: "700",
  },
});
