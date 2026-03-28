import { validateLinks } from "./validators";

describe("validateLinks", () => {
  // === VALID ===
  it("returns true for text without links", () => {
    expect(validateLinks("Just plain text")).toBe(true);
  });

  it("allows http and https links", () => {
    expect(validateLinks("[Google](https://google.com)")).toBe(true);

    expect(validateLinks("[Site](http://example.com)")).toBe(true);
  });

  it("allows mailto and tel links", () => {
    expect(validateLinks("[Email](mailto:test@example.com)")).toBe(true);

    expect(validateLinks("[Call](tel:+123456789)")).toBe(true);
  });

  it("allows relative links", () => {
    expect(validateLinks("[Home](/home)")).toBe(true);

    expect(validateLinks("[Section](#section)")).toBe(true);
  });

  it("allows multiple valid links", () => {
    expect(
      validateLinks(
        "[Google](https://google.com) and [Email](mailto:test@example.com)",
      ),
    ).toBe(true);
  });

  // === INVALID ===
  it("rejects unsupported protocols", () => {
    expect(validateLinks("[Bad](ftp://example.com)")).toBe(false);

    expect(validateLinks("[JS](javascript:alert(1))")).toBe(false);
  });

  it("rejects malformed URLs", () => {
    expect(validateLinks("[Broken](https://)")).toBe(false);

    expect(validateLinks("[Broken](://example.com)")).toBe(false);
  });

  it("fails if any link is invalid", () => {
    expect(
      validateLinks("[Good](https://google.com) and [Bad](ftp://example.com)"),
    ).toBe(false);
  });

  it("ignores non-markdown links", () => {
    expect(validateLinks("https://google.com (not markdown)")).toBe(true);
  });

  // === EDGE CASES ===
  it("handles extra spaces in URL", () => {
    expect(validateLinks("[Google](  https://google.com  )")).toBe(true);
  });

  it("returns false for invalid URL inside markdown", () => {
    expect(validateLinks("[Bad](invalid-url)")).toBe(false);
  });
});
