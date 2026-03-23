type Validator = (value: string) => string | null;

export interface ValidatorTestConfig {
  name: string; // test suite name (e.g., "validateEmail")
  valid: string[]; // array of valid inputs to test (e.g., "["test@example.com", "user+tag@domain.co.uk"]")
  invalid: { inputs: string[]; error?: string }[]; // array of invalid inputs + optional specific error messages
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
    const invalidTestCases: [string, string | undefined][] =
      config.invalid.flatMap(({ inputs, error }) =>
        inputs.map<[string, string | undefined]>((input) => [input, error]),
      );
    it.each(invalidTestCases)("rejects %s", (input, error) => {
      const result = validator(input);
      if (error !== undefined) {
        expect(result).toBe(error);
      } else {
        expect(result).not.toBeNull();
      }
    });
  });
}
