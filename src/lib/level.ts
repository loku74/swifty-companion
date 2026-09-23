/**
 * Splits a 42 level into its parts: 8.42 → level 8, 42% of the way to level 9.
 */
export function splitLevel(value: number) {
  const level = Math.floor(value);
  const progress = value - level;
  return {
    level,
    /** Between 0 and 1, for progress bars. */
    progress,
    percent: Math.round(progress * 100),
  };
}
