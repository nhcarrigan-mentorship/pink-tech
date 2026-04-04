import { runValidatorTests } from "./runValidatorTests";
import { validateLinkedin } from "./validators";

runValidatorTests(validateLinkedin, {
  name: "validateLinkedin",

  valid: [
    "", // empty allowed
    "   ", // whitespace → valid

    // Valid LinkedIn profiles
    "https://www.linkedin.com/in/johndoe",
    "https://linkedin.com/in/jane-doe",
    "linkedin.com/in/johndoe", // no protocol
    "www.linkedin.com/in/johndoe", // no protocol
    "https://www.linkedin.com/pub/john-doe", // legacy profile
  ],

  invalid: [
    // Invalid URL (parsing fails)
    {
      inputs: [
        "ht!tp://linkedin.com/in/john", // malformed protocol
        "://linkedin.com", // broken URL
        "http//linkedin.com", // missing colon
      ],
      error: "Please provide a valid LinkedIn URL.",
    },

    // Wrong domain
    {
      inputs: [
        "https://google.com/in/johndoe",
        "https://linkedin.org/in/johndoe",
        "https://notlinkedin.com/in/johndoe",
      ],
      error: "Please provide a valid LinkedIn URL.",
    },

    // Valid domain but wrong path
    {
      inputs: [
        "https://linkedin.com/company/google",
        "https://linkedin.com/jobs/view/123",
        "https://linkedin.com/feed/",
        "https://linkedin.com/profile/view?id=123",
      ],
      error:
        "LinkedIn profile URL should be a personal profile (e.g. /in/username).",
    },
  ],
});
