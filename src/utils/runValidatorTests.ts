type Validator = (value: string) => string | null;

export interface ValidatorTestConfig {
  name: string; // "validateEmail"
  valid: string[]; // "["test@example.com", "user+tag@domain.co.uk"]"
  invalid: { inputs: string[]; error?: string }[];
  // [{ inputs: [""], error: "Email is required" }

  boundaries?: {
    valid?: string[];
    invalid?: string[];
  };
  // {valid: ["a@b.c"],
  // invalid: ["a".repeat(65) + "@test.com"]
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
    if (config.boundaries?.valid) {
      it.each(config.boundaries.valid)("accepts boundary %s", (input) =>
        expect(validator(input)).toBeNull(),
      );
    }

    if (config.boundaries?.invalid) {
      it.each(config.boundaries.invalid)("rejects boundary %s", (input) =>
        expect(validator(input)).not.toBeNull(),
      );
    }
  });
}
