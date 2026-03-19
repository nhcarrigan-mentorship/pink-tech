import { describe, it, expect } from "vitest";
import { validateCompany } from "./validators";

describe("validateCompany", () => {
  it("accepts empty company", () => {
    expect(validateCompany("")).toBe(null);
  });
  it("accepts valid characters", () => {
    expect(validateCompany("John Doe")).toBeNull();
    expect(validateCompany("Café & Co.")).toBeNull();
    expect(validateCompany("Startup (2024)")).toBeNull();
  });
  it("rejects invalid characters", () => {
    expect(validateCompany("Hello@World")).not.toBeNull();
    expect(validateCompany("Bio#1")).not.toBeNull();
  });

  it("supports unicode letters", () => {
    expect(validateCompany("José")).toBeNull();
  });

  it("accepts company within max length", () => {
    expect(validateCompany("a".repeat(80))).toBe(null);
  });
  
  it("rejects company exceeding max length", () => {
    expect(validateCompany("a".repeat(81))).not.toBeNull;
  });
});
