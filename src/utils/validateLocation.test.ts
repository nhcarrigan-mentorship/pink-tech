import { runValidatorTests } from "./runValidatorTests";
import { validateLocation } from "./validators";

runValidatorTests(validateLocation, {
  name: "validateLocation",
  valid: [
    "", // empty allowed
    "  ", // whitespace → trimmed → valid
    "LA", // min boundary
    "Manila",
    "Manila, Philippines",
    "São Paulo, Brazil",
    "New York, NY",
    "Paris (Île-de-France)",
    "St. John's",
    "Quezon City",
    "A".repeat(100), // max boundary
  ],
  invalid: [
    // Min length
    { inputs: ["a"], error: "Location must be at least 2 characters." },
    // Max length
    {
      inputs: ["a".repeat(101)],
      error: "Location must be 100 characters or fewer.",
    },

    // Invalid characters
    {
      inputs: [
        "Manila@", // @
        "Tokyo#", // #
        "Berlin!", // !
        "Seoul/", // /
        "City\\Name", // \
        "Bangkok|Thailand", // |
      ],
      error:
        "Location should only include letters, numbers, commas, and punctuation.",
    },
  ],
  boundaries: {
    valid: [
      "LA", // exact min (2)
      "A".repeat(100), // exact max
    ],
    invalid: [
      "a", // below min
      "A".repeat(101), // above max
    ],
  },
});
