import { runValidatorTests } from "./runValidatorTests";
import { COMPANY_MAX, validateCompany } from "./validators";

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
