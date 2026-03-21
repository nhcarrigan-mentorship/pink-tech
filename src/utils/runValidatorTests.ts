type Validator = (value: string) => string | null;

interface ValidatorTestConfig {
  name: string; // test suite name (e.g., "validateEmail")
  valid: string[]; // array of valid inputs to test (e.g., "["test@example.com", "user+tag@domain.co.uk"]")
  invalid: { input: string; error?: string }[]; // array of invalid inputs + optional specific error messages
  // (e.g., [{ input: "", error: "Email is required" },
  // { input: "invalid.com" }],  // no specific error)

  boundaries?: {
    valid?: string[];
    invalid?: string[];
  };
  // optional boundary test cases
  // (e.g.,  {valid: ["a@b.c"],  // shortest valid
  // invalid: ["a".repeat(65) + "@test.com"]  // too long)
}

export function runValidatorTests(
  validator: Validator,
  config: ValidatorTestConfig,
) {
  describe(config.name, () => {
    // Valid inputs
    it.each(config.valid.map((valid) => [valid]))("accepts %s", (input) =>
      expect(validator(input)).toBeNull(),
    );

    // Invalid inputs
    it.each(config.invalid.map(({ input, error }) => [input, error]))(
      "rejects %s",
      (input, error) => {
        const result = validator(input);
        error ? expect(result).toBe(error) : expect(result).not.toBeNull();
      },
    );
  });
}
