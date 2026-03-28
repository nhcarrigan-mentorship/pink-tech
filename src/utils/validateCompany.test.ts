import { validateCompany, COMPANY_MAX } from "./validators";
import { runValidatorTests } from "./runValidatorTests";

runValidatorTests(validateCompany, {
  name: "validateCompany",
  valid: [
    "",
    "John Doe",
    "Café & Co.",
    "Startup (2024)",
    "José",
    "a".repeat(COMPANY_MAX),
  ],
  invalid: [
    {
      inputs: ["Hello@World", "Bio#1"],
      error:
        "Company should only include letters, numbers, spaces and . - , & ( ).",
    },
  ],
});

//  "a".repeat(COMPANY_MAX + 1);
