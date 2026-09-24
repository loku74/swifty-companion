import * as Clipboard from "expo-clipboard";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/card";
import { PressableOpacity } from "@/components/pressable-opacity";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { User } from "@/lib/api";

const UNAVAILABLE = "Unavailable";

type Stat = { label: string; value: string };

type InfoRow = {
  label: string;
  icon: SymbolViewProps["name"];
  value: string | null;
  /** Shows a button to copy the value. */
  copyable?: boolean;
  /** Shows a green dot after the value. */
  online?: boolean;
};

function getStats(user: User): Stat[] {
  const stats: Stat[] = [
    { label: "Wallet", value: `${user.wallet} ₳` },
    { label: "Eval points", value: String(user.correction_point) },
  ];
  if (user.pool_year) {
    stats.push({ label: "Pool", value: user.pool_year });
  }
  return stats;
}

function getInfoRows(user: User): InfoRow[] {
  const rows: InfoRow[] = [
    {
      label: "Email",
      icon: { ios: "envelope", android: "mail" },
      value: user.email,
      copyable: true,
    },
    {
      label: "Location",
      icon: { ios: "desktopcomputer", android: "computer" },
      value: user.location ?? UNAVAILABLE,
      // The API only sets a location while the student is logged in on a
      // campus computer.
      online: user.location !== null,
    },
  ];
  if (user.campus.length > 0) {
    rows.push({
      label: "Campus",
      icon: { ios: "building.2", android: "apartment" },
      value: user.campus.map((campus) => campus.name).join(", "),
    });
  }
  // The API returns "hidden" when the student chose not to share their number.
  if (user.phone && user.phone !== "hidden") {
    rows.push({
      label: "Mobile",
      icon: { ios: "phone", android: "call" },
      value: user.phone,
    });
  }
  return rows;
}

/** How long the checkmark stays visible after copying. */
const COPIED_FEEDBACK_MS = 1500;

function CopyButton({ value, label }: { value: string; label: string }) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <PressableOpacity
      onPress={async () => {
        await Clipboard.setStringAsync(value);
        setCopied(true);
      }}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={copied ? `${label} copied` : `Copy ${label}`}
    >
      <SymbolView
        name={
          copied
            ? { ios: "checkmark", android: "check" }
            : {
                ios: "doc.on.doc",
                android: "content_copy",
              }
        }
        size={16}
        tintColor={copied ? theme.success : theme.accent}
      />
    </PressableOpacity>
  );
}

export function ProfileDetails({ user }: { user: User }) {
  const theme = useTheme();

  return (
    <Card title="Details">
      <View style={styles.stats}>
        {getStats(user).map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.rows}>
        {getInfoRows(user).map((row) => (
          <View
            key={row.label}
            style={styles.row}
            // Grouping the row would hide its copy button from screen readers.
            accessible={!row.copyable}
            accessibilityLabel={`${row.label}: ${row.value} ${row.online ? ", online" : ""}`}
          >
            <SymbolView
              name={row.icon}
              size={16}
              tintColor={theme.textSecondary}
            />
            <View style={styles.valueContainer}>
              <Text
                style={[
                  styles.value,
                  {
                    color:
                      row.value !== UNAVAILABLE
                        ? theme.text
                        : theme.textSecondary,
                  },
                ]}
                selectable
              >
                {row.value}
              </Text>
              {row.online ? (
                <View
                  style={[styles.onlineDot, { backgroundColor: theme.success }]}
                />
              ) : null}
            </View>
            {row.copyable && row.value ? (
              <CopyButton value={row.value} label={row.label.toLowerCase()} />
            ) : null}
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: "row",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  rows: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  valueContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  value: {
    fontSize: 14,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
