import { runValidatorTests } from "./runValidatorTests";
import { validateBio, BIO_MAX } from "./validators";

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
    `${"a".repeat(BIO_MAX)}`, // max boundary
  ],

  invalid: [
    {
      inputs: [
        "a".repeat(BIO_MAX + 1), // just over
        "a".repeat(200), // far over
        "🙂".repeat(161), // unicode overflow
      ],
      error: "Bio must be 160 characters or fewer.",
    },
  ],

  boundaries: {
    valid: [
      `${"a".repeat(BIO_MAX)}`, // exact max
    ],
    invalid: [
      `${"a".repeat(BIO_MAX + 1)}`, // just above max
    ],
  },
});
