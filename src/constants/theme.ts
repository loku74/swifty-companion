export const Colors = {
  light: {
    text: "#11181C",
    textSecondary: "#60646C",
    background: "#F2F2F7",
    card: "#FFFFFF",
    border: "#E0E1E6",
    track: "#E6E8EB",
    accent: "#ff976e",
    /** Text and icons drawn on top of `accent` or other strong colors. */
    onAccent: "#FFFFFF",
    success: "#2E9E5B",
    danger: "#D8404F",
    dangerBackground: "#FDECEE",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    background: "#000000",
    card: "#1C1C1E",
    border: "#2E3135",
    track: "#2E3135",
    accent: "#00BABC",
    onAccent: "#FFFFFF",
    success: "#4CC38A",
    danger: "#F2555A",
    dangerBackground: "#3B1219",
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

/** Content is centered and capped at this width on tablets / large screens. */
export const MaxContentWidth = 720;
