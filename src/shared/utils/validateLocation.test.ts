import { runValidatorTests } from "./runValidatorTests";
import { validateLocation, LOCATION_MIN, LOCATION_MAX } from "./validators";

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
    "A".repeat(LOCATION_MAX), // max boundary
  ],
  invalid: [
    // Min length
    {
      inputs: ["a"],
      error: `Location must be at least ${LOCATION_MIN} characters.`,
    },
    // Max length
    {
      inputs: ["a".repeat(LOCATION_MAX + 1)],
      error: `Location must be ${LOCATION_MAX} characters or fewer.`,
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
      "A".repeat(LOCATION_MAX), // exact max
    ],
    invalid: [
      "a", // below min
      "A".repeat(LOCATION_MAX + 1), // above max
    ],
  },
});
