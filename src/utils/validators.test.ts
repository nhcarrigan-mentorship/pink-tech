import { describe, it, expect } from "vitest";
import { validateBio } from "./validators";

describe("validateBio", () => {
  it("accepts empty bio", () => {
    expect(validateBio("")).toBe(null);
  });
  it("handles whitespace-only bio correctly", () => {
    expect(validateBio("   ")).toBe(null);
  });
  it("accepts exactly max length", () => {
    expect(validateBio("a".repeat(160))).toBe(null);
  });
  it("rejects bio exceeding max length", () => {
    expect(validateBio("a".repeat(161))).not.toBeNull();
  });
});
