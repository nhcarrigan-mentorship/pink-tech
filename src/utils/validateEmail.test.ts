import { validateEmail } from "./validators";
import {
  runValidatorTests,
  type ValidatorTestConfig,
} from "./runValidatorTests";

const emailConfig: ValidatorTestConfig = {
  name: "validateEmail",

  valid: [
    "test@example.com",
    "user+tag@domain.co.uk",
    "john.doe_123@sub.domain.com",
    "a@b.cd", // shortest valid
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
      inputs: ["a b@email.com", "a  b@email.com"],
      error: "Email must not contain spaces.",
    },

    // Local part length
    {
      inputs: ["@email.com"],
      error: "Email local part should be 1–64 characters.",
    },
    {
      inputs: [
        `${"a".repeat(65)}@email.com`,
        `${"a".repeat(100)}@email.com`,
        `${"a".repeat(120)}@email.com`,
      ],
      error: "Email local part should be 1–64 characters.",
    },

    // Local part rules
    {
      inputs: [".a@email.com", "a.@email.com"],
      error: "Email local part must not start or end with a dot.",
    },
    {
      inputs: ["a..b@email.com"],
      error: "Email local part must not contain consecutive dots.",
    },
    {
      inputs: [
        "john#doe@email.com", // #
        "john!doe@email.com", // !
        "john$doe@email.com", // $
        "john%doe@email.com", // %
        "john^doe@email.com", // ^
        "john&doe@email.com", // &
        "john*doe@email.com", // *
      ],
      error:
        "Email local part may only include letters, numbers, dots, underscores, hyphens, and plus signs.",
    },

    // Domain length
    {
      inputs: [`a@${"a".repeat(256)}.com`, `a@${"a".repeat(300)}.com`],
      error: "Please provide a valid email domain.",
    },

    // Domain label rules
    {
      inputs: ["a@-domain.com", "a@domain-.com"],
      error: "Email domain labels must not start or end with a hyphen.",
    },
    {
      inputs: [
        "a@do,main.com", // ,
        "a@do;main.com", // ;
        "a@do:main.com", // :
        "a@do/main.com", // /
        "a@do\\main.com", // \\
        "a@do🙂main.com", // 🙂
        "a@dómáin.com", // ó, á
        "a@do©main.com", // ©
      ],
      error: "Email domain may only include letters, numbers, and hyphens.",
    },

    // Label length
    {
      inputs: [
        `a@${"a".repeat(64)}.com`,
        `a@${"a".repeat(80)}.com`,
        `a@${"a".repeat(100)}.com`,
      ],
      error: "Each domain label should be 1–63 characters.",
    },

    // Top Level Domain rules
    {
      inputs: ["a@email.c", "a@email.123", "a@email.12a"],
      error: "Top-level domain should be at least 2 letters.",
    },
  ],

  // Boundary Tests
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
