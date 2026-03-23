import { runValidatorTests } from "./runValidatorTests";
import { validateBio } from "./validators";

runValidatorTests(validateBio, {
  name: "validateBio",
  valid: [
    "", // empty
    "   ", // whitespace
    "a", // min meaningful input
    "Hello world!", // simple sentence
    "Line 1\nLine 2", // multiline
    "🙂", // emoji
    "こんにちは", // unicode
    "Senior software engineer specialising in distributed systems.",
    `${"a".repeat(160)}`, // max boundary
  ],

  invalid: [
    {
      inputs: [
        "a".repeat(161), // just over
        "a".repeat(200), // far over
        "🙂".repeat(161), // unicode overflow
      ],
      error: "Bio must be 160 characters or fewer.",
    },
  ],

  boundaries: {
    valid: [
      `${"a".repeat(160)}`, // exact max
    ],
    invalid: [
      `${"a".repeat(161)}`, // just above max
    ],
  },
});
