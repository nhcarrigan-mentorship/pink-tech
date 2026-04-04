import { runValidatorTests } from "./runValidatorTests";
import { validateGithub } from "./validators";

runValidatorTests(validateGithub, {
  name: "validateGithub",

  valid: [
    "", // empty allowed
    "   ", // whitespace → valid

    // Valid GitHub profiles
    "https://github.com/johndoe",
    "https://github.com/john-doe",
    "https://www.github.com/john-doe",
    "github.com/johndoe",
    "www.github.com/johndoe",
    "https://github.com/JohnDoe123",
    "https://github.com/john-doe/", // trailing slash
  ],

  invalid: [
    // Invalid URL (parsing fails)
    {
      inputs: ["://github.com", "http//github.com"],
      error: "Please provide a valid GitHub URL.",
    },

    // Wrong domain
    {
      inputs: [
        "ht!tp://github.com/john",
        "https://gitlab.com/johndoe",
        "https://github.org/johndoe",
        "https://notgithub.com/johndoe",
      ],
      error: "Please provide a GitHub profile URL.",
    },

    // Missing username
    {
      inputs: ["https://github.com", "https://github.com/", "github.com/"],
      error: "Please provide a GitHub profile URL (e.g. github.com/username).",
    },

    // Invalid username (rule coverage)
    {
      inputs: [
        "https://github.com/-john", // starts with hyphen
        "https://github.com/john-", // ends with hyphen
        "https://github.com/john--doe", // consecutive hyphens
        "https://github.com/john_doe", // underscore
        "https://github.com/john.doe", // dot
        "https://github.com/john@doe", // symbol
        "https://github.com/john doe", // space
      ],
      error:
        "GitHub username may only use letters, numbers, and single hyphens between characters.",
    },
  ],

  boundaries: {
    valid: [
      "https://github.com/a", // minimal valid
      "https://github.com/a-b", // single hyphen valid
    ],
    invalid: [
      "https://github.com/-a", // leading hyphen
      "https://github.com/a-", // trailing hyphen
    ],
  },
});
