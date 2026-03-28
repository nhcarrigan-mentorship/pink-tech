import { runValidatorTests } from "./runValidatorTests";
import { validateName, NAME_MIN, NAME_MAX } from "./validators";

runValidatorTests(validateName, {
  name: "validateName",

  valid: [
    "Jane Doe",
    "Jane",
    "Maria Lòpez",
    "Dr. Amara Johnson",
    "Winnie Madikizela-Mandela",
    "O'Connor",
    "Jean-Luc Picard",
    "A B", // min valid (2 chars)
    "暗拿", // unicode
    "Élodie Dupont",
  ],

  invalid: [
    // Empty
    {
      inputs: ["", " ", "   "],
      error: "Name cannot be empty.",
    },

    // Length
    {
      inputs: ["J"],
      error: `Name must be between ${NAME_MIN} and ${NAME_MAX} characters.`,
    },

    // Invalid characters
    {
      inputs: ["John123", "Jane@Doe", "Mike#Smith"],
      error:
        "Name can only contain letters, spaces, hyphens, apostrophes, and periods.",
    },

    // Consecutive spaces
    {
      inputs: ["John  Doe"],
      error: "Name cannot contain consecutive spaces.",
    },

    // Consecutive punctuation
    {
      inputs: ["Jean--Luc", "O''Connor", "Dr..Smith"],
      error:
        "Name cannot contain consecutive hyphens, apostrophes, or periods.",
    },

    // Start / end punctuation
    {
      inputs: ["-John", "John-", ".Jane", "Jane.", "'Mike", "Mike'"],
      error: "Name cannot start or end with a hyphen, apostrophe, or period.",
    },
  ],

  boundaries: {
    valid: ["a".repeat(2), "a".repeat(141)], // min boundary (2) and max boundary
    invalid: ["J", "a".repeat(142)], // below min and above max
  },
});
