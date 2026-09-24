import { ApiError } from "@/lib/api/errors";
import { normalizeLogin } from "@/lib/api/users";

describe("normalizeLogin", () => {
  it("trims and lowercases", () => {
    expect(normalizeLogin("  NormiNet ")).toBe("norminet");
  });

  it.each(["", "   ", "1abc", "a b", "a.b", "é"])("rejects %j", (input) => {
    expect(() => normalizeLogin(input)).toThrow(ApiError);
  });

  it("accepts digits, dashes and underscores after the first letter", () => {
    expect(normalizeLogin("a-b_c9")).toBe("a-b_c9");
  });
});
