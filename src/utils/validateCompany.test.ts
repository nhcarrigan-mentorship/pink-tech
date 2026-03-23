import { validateCompany } from "./validators";
import { runValidatorTests } from "./runValidatorTests";

runValidatorTests(validateCompany, {
  name: "validateCompany",
  valid: [
    "",
    "John Doe",
    "Café & Co.",
    "Startup (2024)",
    "José",
    "a".repeat(80),
  ],
  invalid: [
    {
      inputs: ["Hello@World", "Bio#1"],
      error:
        "Company should only include letters, numbers, spaces and . - , & ( ).",
    },
  ],
});


//  "a".repeat(81);
