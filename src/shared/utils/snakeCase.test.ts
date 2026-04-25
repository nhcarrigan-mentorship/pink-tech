import { describe, expect, it } from "vitest";
import toSnakeCaseObject from "./snakeCase";

describe("toSnakeCaseObject", () => {
  it("returns snake_case keys when given camelCase", () => {
    expect(
      toSnakeCaseObject({ userId: "12345", fullName: "Jane Doe" }),
    ).toEqual({ user_id: "12345", full_name: "Jane Doe" });
  });
  it("returns snake_case keys when given snake_case", () => {
    expect(
      toSnakeCaseObject({ user_id: "12345", full_name: "Jane Doe" }),
    ).toEqual({
      user_id: "12345",
      full_name: "Jane Doe",
    });
  });
  it("returns clean snake_case keys when given consecutive uppercase letters", () => {
    expect(
      toSnakeCaseObject({ userID: "12345", fullName: "Jane Doe" }),
    ).toEqual({
      user_id: "12345",
      full_name: "Jane Doe",
    });
  });
  it("returns snake_case keys when given a nested object", () => {
    expect(
      toSnakeCaseObject({
        userProfile: { userID: "12345", fullName: "Jane Doe" },
      }),
    ).toEqual({ user_profile: { user_id: "12345", full_name: "Jane Doe" } });
  });
  it("recursively converts objects inside arrays and leaves non-objects unchanged", () => {
    expect(
      toSnakeCaseObject({
        auditTrail: [
          { userID: "12345", fullName: "Jane Doe" },
          "raw-string",
          123,
          null,
          { nestedArray: [{ fooBar: "baz" }] },
        ],
      }),
    ).toEqual({
      audit_trail: [
        { user_id: "12345", full_name: "Jane Doe" },
        "raw-string",
        123,
        null,
        { nested_array: [{ foo_bar: "baz" }] },
      ],
    });
  });
  it("returns an empty object when given an empty object", () => {
    expect(toSnakeCaseObject({})).toEqual({});
  });
});
