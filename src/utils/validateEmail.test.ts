import { validateEmail } from "./validators";
import {
  runValidatorTests,
  type ValidatorTestConfig,
} from "./runValidatorTests";

const emailConfig: ValidatorTestConfig = {
  name: "validateEmail",

  // ✅ VALID CASES
  valid: [
    "test@example.com",
    "user+tag@domain.co.uk",
    "john.doe_123@sub.domain.com",
    "a@b.cd", // shortest valid
  ],

  // ❌ INVALID CASES (with exact errors when important)
  invalid: [
    // Empty / format
    { input: "", error: "Email cannot be empty." },
    { input: "invalid.com", error: "Please provide a valid email address." },
    {
      input: "a@b",
      error: "Email domain must include a top-level domain (e.g. .com).",
    },

    // Spaces
    { input: "a b@email.com", error: "Email must not contain spaces." },

    // Local part length
    {
      input: "@email.com",
      error: "Email local part should be 1–64 characters.",
    },
    {
      input: `${"a".repeat(65)}@email.com`,
      error: "Email local part should be 1–64 characters.",
    },

    // Local part rules
    {
      input: ".a@email.com",
      error: "Email local part must not start or end with a dot.",
    },
    {
      input: "a.@email.com",
      error: "Email local part must not start or end with a dot.",
    },
    {
      input: "a..b@email.com",
      error: "Email local part must not contain consecutive dots.",
    },
    {
      input: "john#doe@email.com",
      error:
        "Email local part may only include letters, numbers, dots, underscores, hyphens, and plus signs.",
    },

    // Domain length
    {
      input: `a@${"a".repeat(256)}.com`,
      error: "Please provide a valid email domain.",
    },

    // Domain label rules
    {
      input: "a@-domain.com",
      error: "Email domain labels must not start or end with a hyphen.",
    },
    {
      input: "a@domain-.com",
      error: "Email domain labels must not start or end with a hyphen.",
    },
    {
      input: "a@do_main.com",
      error: "Email domain may only include letters, numbers, and hyphens.",
    },

    // Label length
    {
      input: `a@${"a".repeat(64)}.com`,
      error: "Each domain label should be 1–63 characters.",
    },

    // TLD rules
    {
      input: "a@email.c",
      error: "Top-level domain should be at least 2 letters.",
    },
    {
      input: "a@email.123",
      error: "Top-level domain should be at least 2 letters.",
    },
  ],

  // ⚖️ BOUNDARY TESTS (critical)
  boundaries: {
    valid: [
      `${"a".repeat(308)}@email.com`, // 320 chars total
      `${"a".repeat(64)}@email.com`, // max local
    ],
    invalid: [
      `${"a".repeat(309)}@email.com`, // 321 total
      `${"a".repeat(65)}@email.com`, // local too long
    ],
  },
};

runValidatorTests(validateEmail, emailConfig);
