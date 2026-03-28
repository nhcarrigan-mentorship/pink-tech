import { PASSWORD_MAX, PASSWORD_MIN } from "./validators";
import { runValidatorTests } from "./runValidatorTests";
import { validatePassword } from "./validators";

runValidatorTests(validatePassword, {
  name: "validatePassword",

  // === VALID ===
  valid: [
    "", // empty allowed
    "Aa1!aaaa", // minimal valid
    "StrongPass123!",
    "P@ssw0rd123",
    "A1!a".repeat(2), // longer valid
    "A".repeat(1) + "a".repeat(1) + "1!" + "a".repeat(PASSWORD_MIN - 4), // exact min
  ],

  // === INVALID ===
  invalid: [
    // Too long
    {
      inputs: ["A".repeat(PASSWORD_MAX + 1) + "a1!"],
      error: `Password must be at most ${PASSWORD_MAX} characters.`,
    },

    // Too short
    {
      inputs: ["Aa1!"],
      error: `Password must be at least ${PASSWORD_MIN} characters.`,
    },

    // Missing uppercase
    {
      inputs: ["aa1!aaaa"],
      error: "Password must contain at least one uppercase letter.",
    },

    // Missing lowercase
    {
      inputs: ["AA1!AAAA"],
      error: "Password must contain at least one lowercase letter.",
    },

    // Missing number
    {
      inputs: ["AAa!aaaa"],
      error: "Password must contain at least one number.",
    },

    // Missing special character
    {
      inputs: ["AAa1aaaa"],
      error: "Password must contain at least one special character.",
    },
  ],

  // === BOUNDARIES ===
  boundaries: {
    valid: [
      "Aa1!" + "a".repeat(PASSWORD_MIN - 4), // exact min
      "Aa1!" + "a".repeat(PASSWORD_MAX - 4), // exact max
    ],
    invalid: [
      "Aa1!" + "a".repeat(PASSWORD_MIN - 5), // below min
      "Aa1!" + "a".repeat(PASSWORD_MAX - 3), // above max
    ],
  },
});
