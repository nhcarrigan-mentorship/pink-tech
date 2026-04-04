import { runValidatorTests } from "./runValidatorTests";
import { ROLE_MAX, ROLE_MIN, validateRole } from "./validators";
runValidatorTests(validateRole, {
  name: "validateRole",

  valid: [
    "", // empty allowed
    "   ", // whitespace → trimmed → valid
    "A".repeat(ROLE_MIN), // min boundary
    "A".repeat(ROLE_MAX), // max boundary
    "Staff Engineer",
    "Senior Software Engineer",
    "QA Tester II",
    "Product Manager (Growth)",
    "R&D Engineer",
    "Sales & Marketing Lead",
    "DevOps Engineer - Platform",
    "Data Analyst, BI",
    "Éngineer", // unicode
  ],

  invalid: [
    // Min length
    {
      inputs: ["A"],
      error: `Role must be at least ${ROLE_MIN} characters.`,
    },

    // Max length
    {
      inputs: ["A".repeat(ROLE_MAX + 1)],
      error: `Role must be ${ROLE_MAX} characters or fewer.`,
    },

    // Invalid characters
    {
      inputs: [
        "Dev@Ops", // @
        "Engineer!", // !
        "QA/Test", // /
        "Backend\\Engineer", // \
      ],
      error:
        "Role should only include letters, numbers, spaces and . - , # & ( ).",
    },
  ],

  boundaries: {
    valid: [
      "A".repeat(ROLE_MIN), // exact min
      "A".repeat(ROLE_MAX), // exact max
    ],
    invalid: [
      "A", // below min
      "A".repeat(ROLE_MAX + 1), // above max
    ],
  },
});
