import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/card";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { User } from "@/lib/ft-api";

type Detail = { label: string; value: string };

function getDetails(user: User): Detail[] {
  const details: Detail[] = [
    { label: "Email", value: user.email },
    { label: "Location", value: user.location ?? "Unavailable" },
    { label: "Wallet", value: `${user.wallet} ₳` },
    { label: "Evaluation points", value: String(user.correction_point) },
  ];

  // The API returns "hidden" when the student chose not to share their number.
  if (user.phone && user.phone !== "hidden") {
    details.push({ label: "Mobile", value: user.phone });
  }
  if (user.campus.length > 0) {
    details.push({
      label: "Campus",
      value: user.campus.map((campus) => campus.name).join(", "),
    });
  }
  if (user.pool_year) {
    details.push({ label: "Pool year", value: user.pool_year });
  }
  return details;
}

export function DetailsGrid({ user }: { user: User }) {
  const theme = useTheme();

  return (
    <Card title="Details">
      <View style={styles.grid}>
        {getDetails(user).map((detail) => (
          <View
            key={detail.label}
            style={[styles.cell, { backgroundColor: theme.background }]}
          >
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {detail.label}
            </Text>
            <Text
              style={[styles.value, { color: theme.text }]}
              selectable
              numberOfLines={2}
            >
              {detail.value}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  cell: {
    // Two columns on phones, more on wider screens.
    flexGrow: 1,
    flexBasis: 140,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderCurve: "continuous",
    gap: 2,
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
  },
});
