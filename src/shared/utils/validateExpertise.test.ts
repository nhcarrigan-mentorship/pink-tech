import { EXPERTISE_MAX, EXPERTISE_MIN } from "./validators";
import { runValidatorTests } from "./runValidatorTests";
import { validateExpertise } from "./validators";

const existing = ["React", "JavaScript"];
const wrapper = (expertise: string) => validateExpertise(expertise, existing);

runValidatorTests(wrapper, {
  name: "validateExpertise",

  // === VALID CASES ===
  valid: [
    "", // empty string allowed
    "C#", // valid short input
    "TypeScript", // typical valid input
    "A".repeat(EXPERTISE_MAX), // max boundary valid
    "Node.js", // valid with dot
    "C++", // valid with plus
    "Python / Django", // valid with slash and space
  ],

  // === INVALID CASES ===
  invalid: [
    // Too short
    {
      inputs: ["A"],
      error: `Expertise must be at least ${EXPERTISE_MIN} characters.`,
    },
    // Too long
    {
      inputs: ["A".repeat(EXPERTISE_MAX + 1)],
      error: `Expertise must be ${EXPERTISE_MAX} characters or fewer.`,
    },
    // Duplicate entries
    {
      inputs: ["React", "JavaScript"],
      error: "This expertise is already added.",
    },
    // Invalid characters
    {
      inputs: ["C!"],
      error:
        "Allowed characters: letters, numbers, spaces, and . # + - / & ( )",
    },
    {
      inputs: ["Python@3"],
      error:
        "Allowed characters: letters, numbers, spaces, and . # + - / & ( )",
    },
    {
      inputs: ["Go_Lang"],
      error:
        "Allowed characters: letters, numbers, spaces, and . # + - / & ( )",
    },
  ],

  // === BOUNDARY TESTS ===
  boundaries: {
    valid: [
      "A".repeat(EXPERTISE_MIN), // min boundary valid
      "A".repeat(EXPERTISE_MAX), // max boundary valid
    ],
    invalid: [
      "A".repeat(EXPERTISE_MIN - 1), // below min
      "A".repeat(EXPERTISE_MAX + 1), // above max
    ],
  },
});
