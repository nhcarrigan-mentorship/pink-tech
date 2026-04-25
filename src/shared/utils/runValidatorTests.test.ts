import { describe, expect, it, vi } from "vitest";
import { runValidatorTests, type ValidatorTestConfig } from "./runValidatorTests";

type RecordedCall =
  | { kind: "describe"; name: string }
  | { kind: "it"; name: string }
  | { kind: "it.each"; name: string; table: unknown[] };

function captureRun(config: ValidatorTestConfig, validatorImpl: (v: string) => string | null) {
  const calls: RecordedCall[] = [];
  const validator = vi.fn(validatorImpl);

  const originalDescribe = (globalThis as any).describe;
  const originalIt = (globalThis as any).it;
  const originalExpect = (globalThis as any).expect;

  const fakeDescribe = (name: string, fn: () => void) => {
    calls.push({ kind: "describe", name });
    fn();
  };

  const fakeIt: any = (name: string, fn?: () => void) => {
    calls.push({ kind: "it", name });
    fn?.();
  };
  fakeIt.each =
    (table: unknown[]) => (name: string, fn: (...args: any[]) => void) => {
      calls.push({ kind: "it.each", name, table });
      for (const row of table) {
        if (Array.isArray(row)) fn(...row);
        else fn(row);
      }
    };

  try {
    (globalThis as any).describe = fakeDescribe;
    (globalThis as any).it = fakeIt;
    (globalThis as any).expect = expect;

    runValidatorTests(validator, config);
  } finally {
    (globalThis as any).describe = originalDescribe;
    (globalThis as any).it = originalIt;
    (globalThis as any).expect = originalExpect;
  }

  return { calls, validator };
}

describe("runValidatorTests", () => {
  it("generates valid/invalid/boundary cases and runs the right assertions", () => {
    const config: ValidatorTestConfig = {
      name: "myValidator",
      valid: ["ok1", "ok2"],
      invalid: [
        { inputs: ["bad1"], error: "E1" },
        { inputs: ["bad2", "bad3"] }, // any non-null error is acceptable
        { inputs: ["bad4", "bad5"], error: "E2" },
      ],
      boundaries: { valid: ["bok"], invalid: ["bbad"] },
    };

    const resultByInput = new Map<string, string | null>([
      ["ok1", null],
      ["ok2", null],
      ["bok", null],
      ["bad1", "E1"],
      ["bad2", "some error"],
      ["bad3", "some error"],
      ["bad4", "E2"],
      ["bad5", "E2"],
      ["bbad", "boundary error"],
    ]);

    const { calls, validator } = captureRun(config, (v) => {
      const result = resultByInput.get(v);
      return result === undefined ? "unexpected input" : result;
    });

    expect(calls[0]).toEqual({ kind: "describe", name: "myValidator" });

    const eachCalls = calls.filter(
      (c): c is Extract<RecordedCall, { kind: "it.each" }> => c.kind === "it.each",
    );
    expect(eachCalls.map((c) => c.name)).toEqual([
      "accepts %s",
      "rejects %s",
      "accepts boundary %s",
      "rejects boundary %s",
    ]);

    const accepts = eachCalls.find((c) => c.name === "accepts %s")!;
    expect(accepts.table).toEqual([["ok1"], ["ok2"]]);

    const rejects = eachCalls.find((c) => c.name === "rejects %s")!;
    expect(rejects.table).toEqual([
      ["bad1", "E1"],
      ["bad2", undefined],
      ["bad3", undefined],
      ["bad4", "E2"],
      ["bad5", "E2"],
    ]);

    const boundaryAccepts = eachCalls.find((c) => c.name === "accepts boundary %s")!;
    expect(boundaryAccepts.table).toEqual(["bok"]);

    const boundaryRejects = eachCalls.find((c) => c.name === "rejects boundary %s")!;
    expect(boundaryRejects.table).toEqual(["bbad"]);

    // All cases should have been executed (fake it.each runs callbacks immediately).
    expect(validator).toHaveBeenCalledTimes(2 + 5 + 1 + 1);
    expect(validator.mock.calls.map(([v]) => v)).toEqual([
      "ok1",
      "ok2",
      "bad1",
      "bad2",
      "bad3",
      "bad4",
      "bad5",
      "bok",
      "bbad",
    ]);
  });

  it("does not generate boundary tests when boundaries are not provided", () => {
    const config: ValidatorTestConfig = {
      name: "noBoundaries",
      valid: ["ok"],
      invalid: [{ inputs: ["bad"], error: "E" }],
    };

    const { calls } = captureRun(config, (v) => (v === "ok" ? null : "E"));
    const eachCalls = calls.filter(
      (c): c is Extract<RecordedCall, { kind: "it.each" }> => c.kind === "it.each",
    );

    expect(eachCalls.map((c) => c.name)).toEqual(["accepts %s", "rejects %s"]);
  });
});
