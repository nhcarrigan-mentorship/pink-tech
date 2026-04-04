import { runValidatorTests } from "./runValidatorTests";
import { USERNAME_MAX, USERNAME_MIN, validateUsername } from "./validators";

runValidatorTests(validateUsername, {
  name: "validateUsername",

  // === VALID ===
  valid: [
    "johnDoe",
    "john_doe",
    "john-doe",
    "johndoe123",
    "a".repeat(USERNAME_MIN), // min boundary
    "a".repeat(USERNAME_MAX), // max boundary
  ],

  // === INVALID ===
  invalid: [
    // Empty
    {
      inputs: [""],
      error: "Username cannot be empty.",
    },

    // Length
    {
      inputs: ["a".repeat(USERNAME_MIN - 1)],
      error: `Username must be between ${USERNAME_MIN} and ${USERNAME_MAX} characters.`,
    },
    {
      inputs: ["a".repeat(USERNAME_MAX + 1)],
      error: `Username must be between ${USERNAME_MIN} and ${USERNAME_MAX} characters.`,
    },

    // Invalid characters
    {
      inputs: [
        "john.doe", // dot
        "john@doe", // symbol
        "john doe", // space
      ],
      error:
        "Username can only contain letters, numbers, underscores, and hyphens.",
    },

    // Start / end with _ or -
    {
      inputs: ["_johndoe", "-johndoe", "johndoe_", "johndoe-"],
      error: "Username cannot start or end with an underscore or hyphen.",
    },

    // Consecutive symbols
    {
      inputs: ["john__doe", "john--doe", "john_-doe", "john-_doe"],
      error: "Username cannot contain consecutive underscores or hyphens.",
    },

    // Starts with number
    {
      inputs: ["1johndoe", "9_user"],
      error: "Username must start with a letter.",
    },
  ],

  // === BOUNDARIES ===
  boundaries: {
    valid: ["a".repeat(USERNAME_MIN), "a".repeat(USERNAME_MAX)],
    invalid: ["a".repeat(USERNAME_MIN - 1), "a".repeat(USERNAME_MAX + 1)],
  },
});
