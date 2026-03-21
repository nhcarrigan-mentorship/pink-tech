import { runValidatorTests } from "./runValidatorTests";
import { validateBio } from "./validators";

runValidatorTests(validateBio, {
  name: "validateBio",
  valid: [
    "",
    "   ",
    "a",
    "Senior software engineer specialising in distributed systems and cloud infrastructure.",
    `${"a".repeat(160)}`,
  ],
  invalid: [
    {
      input: `${"a".repeat(161)}`,
      error: "Bio must be 160 characters or fewer.",
    },
  ],
});
