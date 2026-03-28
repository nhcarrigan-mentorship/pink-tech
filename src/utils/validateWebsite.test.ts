import { runValidatorTests } from "./runValidatorTests";
import { validateWebsite } from "./validators";

runValidatorTests(validateWebsite, {
  name: "validateWebsite",

  valid: [
    "", // empty allowed
    "   ", // whitespace → valid

    // Proper URLs
    "https://example.com",
    "http://example.com",
    "https://www.example.com",
    "example.com", // no protocol
    "www.example.com", // no protocol
    "example.co.uk", // multi-level domain
    "https://sub.example.com",
    "https://example.com/path", // URL with path
    "https://example.com?query=1", // URL with query
    "example.com/path", // URL without protocol
  ],

  invalid: [
    // Malformed URLs that throw
    {
      inputs: ["http//example.com", "https://"],
      error: "Please provide a valid website URL.",
    },

    // Host missing dot
    {
      inputs: [
        "localhost",
        "mywebsite",
        "https://localhost",
        "ht!tp://example.com",
      ],
      error: "Please provide a valid website URL or domain.",
    },
  ],

  boundaries: {
    valid: ["a.com", "example.io", "subdomain.example.org"],
    invalid: [
      "a", // too short, no dot
      "b", // no dot
      "https://a", // invalid host
    ],
  },
});
