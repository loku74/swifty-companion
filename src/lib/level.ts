export function splitLevel(value: number) {
  const level = Math.floor(value);
  const progress = value - level;
  return {
    level,
    progress,
    percent: Math.round(progress * 100),
  };
}
