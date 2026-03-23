import { validateEmail } from "./validators";
import { runValidatorTests } from "./runValidatorTests";

runValidatorTests(validateEmail, {
  name: "validateEmail",

  valid: [
    "test@example.com",
    "user+tag@domain.co.uk",
    "john.doe_123@sub.domain.com",
    "a@b.cd",
  ],

  invalid: [
    // Empty / format
    { inputs: [""], error: "Email cannot be empty." },
    { inputs: ["invalid.com"], error: "Please provide a valid email address." },
    {
      inputs: ["a@b"],
      error: "Email domain must include a top-level domain (e.g. .com).",
    },

    // Spaces
    {
      inputs: ["a b@email.com"],
      error: "Email must not contain spaces.",
    },

    // Local part rules
    {
      inputs: ["@email.com"],
      error: "Email local part should be 1–64 characters.",
    },
    {
      inputs: [".a@email.com"],
      error: "Email local part must not start or end with a dot.",
    },
    {
      inputs: ["a..b@email.com"],
      error: "Email local part must not contain consecutive dots.",
    },
    {
      inputs: ["john#doe@email.com"],
      error:
        "Email local part may only include letters, numbers, dots, underscores, hyphens, and plus signs.",
    },

    // Domain rules
    {
      inputs: ["a@-domain.com"],
      error: "Email domain labels must not start or end with a hyphen.",
    },
    {
      inputs: ["a@do,main.com"],
      error: "Email domain may only include letters, numbers, and hyphens.",
    },

    // Domain length
    {
      inputs: [`a@${"a".repeat(256)}.com`],
      error: "Please provide a valid email domain.",
    },

    // Label length
    {
      inputs: [`a@${"a".repeat(64)}.com`],
      error: "Each domain label should be 1–63 characters.",
    },

    // TLD rules
    {
      inputs: ["a@email.c"],
      error: "Top-level domain should be at least 2 letters.",
    },
  ],

  boundaries: {
    valid: [
      "a".repeat(64) + "@email.com", // max local
    ],
    invalid: [
      "a".repeat(65) + "@email.com", // local too long
      "a".repeat(309) + "@email.com", // total too long
    ],
  },
});
