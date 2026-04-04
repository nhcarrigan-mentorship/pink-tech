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
  it("returns an empty object when given an empty object", () => {
    expect(toSnakeCaseObject({})).toEqual({});
  });
});
