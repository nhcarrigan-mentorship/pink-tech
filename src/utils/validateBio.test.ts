import { describe, it, expect } from "vitest";
import { validateBio } from "./validators";

describe("validateBio", () => {
  it("returns null for valid bio", () => {
    expect(validateBio("a".repeat(160))).toBe(null);
  });

  it("accepts empty bio", () => {
    expect(validateBio("")).toBe(null);
  });
  it("handles whitespace-only bio correctly", () => {
    expect(validateBio("   ")).toBe(null);
  });
  it("rejects bio exceeding max length", () => {
    expect(validateBio("a".repeat(161))).not.toBeNull();
  });
});
