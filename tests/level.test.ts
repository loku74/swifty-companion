import { splitLevel } from "@/lib/level";

describe("splitLevel", () => {
  it("splits a level into its integer part and progress", () => {
    const { level, progress, percent } = splitLevel(8.42);
    expect(level).toBe(8);
    expect(progress).toBeCloseTo(0.42);
    expect(percent).toBe(42);
  });

  it("handles whole levels", () => {
    expect(splitLevel(0)).toEqual({ level: 0, progress: 0, percent: 0 });
    expect(splitLevel(12)).toEqual({ level: 12, progress: 0, percent: 0 });
  });
});
