import { describe, expect, it } from "vitest";
import { getPasswordStrength } from "./validators";

const cases = [
  {
    name: "empty string returns 0",
    input: "",
    expected: 0,
  },
  {
    name: "only lowercase contributes 2",
    input: "a",
    expected: 2,
  },
  {
    name: "lowercase + number contributes 3",
    input: "a1",
    expected: 3,
  },
  {
    name: "lowercase + uppercase + number contributes 4",
    input: "aA1",
    expected: 4,
  },
  {
    name: "adds special character rule",
    input: "aA1!",
    expected: 5,
  },
  {
    name: "all rules satisfied",
    input: "aA1!aaaa",
    expected: 6,
  },
];

describe("getPasswordStrength", () => {
  cases.forEach(({ name, input, expected }) => {
    it(name, () => {
      expect(getPasswordStrength(input)).toBe(expected);
    });
  });
});
