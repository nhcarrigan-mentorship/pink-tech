import { runValidatorTests } from "./runValidatorTests";
import { validateRole } from "./validators";
runValidatorTests(validateRole, {
  name: "validateRole",

  valid: [
    "", // empty allowed
    "   ", // whitespace → trimmed → valid
    "A".repeat(2), // min boundary
    "A".repeat(60), // max boundary
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
      error: "Role must be at least 2 characters.",
    },

    // Max length
    {
      inputs: ["A".repeat(61)],
      error: "Role must be 60 characters or fewer.",
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
      "A".repeat(2), // exact min
      "A".repeat(60), // exact max
    ],
    invalid: [
      "A", // below min
      "A".repeat(61), // above max
    ],
  },
});
