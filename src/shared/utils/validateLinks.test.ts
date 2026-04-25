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

  it("accepts bare domains by adding https", () => {
    expect(validateLinks("[OK](google.com)")).toBe(true);
  });

  // === INVALID ===
  it("rejects URLs without domain dot", () => {
    expect(validateLinks("[Bad](https://localhost)")).toBe(false);
  });

  it("rejects URLs with empty hostname", () => {
    expect(validateLinks("[Bad](https://)")).toBe(false);
    expect(validateLinks("[Bad](http://)")).toBe(false);
  });

  it("covers the extra guard for weird cases like https:// (hostname becomes empty)", () => {
    // validateLinks reads `parsed.hostname` twice in the earlier strict check:
    // 1) `!parsed.hostname`
    // 2) `!parsed.hostname.includes(".")`
    // Then it reads it again for the dedicated `parsed.hostname === ""` guard.
    // We return a normal hostname for the first two reads, and "" on the third.
    const OriginalURL = (globalThis as any).URL;

    class FlakyURL {
      protocol = "https:";
      private reads = 0;

      constructor(_raw: string) {}

      get hostname() {
        this.reads += 1;
        if (this.reads <= 2) return "example.com";
        return "";
      }
    }

    try {
      (globalThis as any).URL = FlakyURL;
      expect(validateLinks("[Bad](https://example.com)")).toBe(false);
    } finally {
      (globalThis as any).URL = OriginalURL;
    }
  });

  it("rejects slash-only URLs", () => {
    expect(validateLinks("[Bad](https:///)")).toBe(false);
    expect(validateLinks("[Bad](http:///)")).toBe(false);
  });

  it("covers malformed protocol URLs", () => {
    expect(validateLinks("[Bad](https://:)")).toBe(false);
  });

  it("rejects bare invalid domains", () => {
    expect(validateLinks("[Bad](invalid)")).toBe(false);
  });

  it("rejects empty hostname URLs", () => {
    expect(validateLinks("[Bad](https://)")).toBe(false);
  });
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
