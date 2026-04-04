import { describe, expect, it } from "vitest";
import type { UserProfile } from "../shared/types/UserProfile";
import { mergeProfile, removeProfileById, upsertProfile } from "./profileUtils";

describe("mergeProfile", () => {
  const baseProfile: UserProfile = {
    id: "1",
    displayName: "John Doe",
    username: "johndoe",
    lastUpdated: "2023-01-01",
    featured: false,
    bio: "Original bio",
    role: "Developer",
    company: "Tech Corp",
    location: "New York",
    email: "john@example.com",
    website: "https://johndoe.com",
    linkedin: "john-doe",
    github: "johndoe",
    expertise: ["JavaScript", "React"],
    content: "Original content",
  };

  it("returns base profile when updated is null or undefined", () => {
    expect(mergeProfile(baseProfile, null)).toEqual(baseProfile);
    expect(mergeProfile(baseProfile, undefined)).toEqual(baseProfile);
  });

  it("merges defined fields from updated object", () => {
    const updated = {
      displayName: "Jane Doe",
      bio: "Updated bio",
      role: undefined, // should not overwrite
    };
    const result = mergeProfile(baseProfile, updated);
    expect(result.displayName).toBe("Jane Doe");
    expect(result.bio).toBe("Updated bio");
    expect(result.role).toBe("Developer"); // unchanged
    expect(result.username).toBe("johndoe"); // unchanged
  });

  it("converts id to string if provided", () => {
    const updated = { id: 123 };
    const result = mergeProfile(baseProfile, updated);
    expect(result.id).toBe("123");
  });

  it("handles partial updates with various field types", () => {
    const updated = {
      featured: true,
      expertise: ["Python", "Django"],
      location: undefined, // should not overwrite
    };
    const result = mergeProfile(baseProfile, updated);
    expect(result.featured).toBe(true);
    expect(result.expertise).toEqual(["Python", "Django"]);
    expect(result.location).toBe("New York"); // unchanged
  });
});

describe("upsertProfile", () => {
  const existingProfiles: UserProfile[] = [
    {
      id: "1",
      displayName: "John Doe",
      username: "johndoe",
      lastUpdated: "2023-01-01",
      featured: false,
    },
    {
      id: "2",
      displayName: "Jane Smith",
      username: "janesmith",
      lastUpdated: "2023-01-02",
      featured: true,
    },
  ];

  it("adds new profile at the beginning when it doesn't exist", () => {
    const newProfile: UserProfile = {
      id: "3",
      displayName: "Bob Wilson",
      username: "bobwilson",
      lastUpdated: "2023-01-03",
      featured: false,
    };
    const result = upsertProfile(existingProfiles, newProfile);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ ...newProfile, id: "3" });
    expect(result[1]).toEqual(existingProfiles[0]);
    expect(result[2]).toEqual(existingProfiles[1]);
  });

  it("merges updates into existing profile", () => {
    const updatedProfile = {
      id: "1",
      displayName: "John Updated",
      username: "johndoe", // unchanged
      lastUpdated: "2023-01-04",
      featured: true,
    };
    const result = upsertProfile(existingProfiles, updatedProfile);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("1");
    expect(result[0].displayName).toBe("John Updated");
    expect(result[0].featured).toBe(true);
    expect(result[0].username).toBe("johndoe"); // unchanged
    expect(result[1]).toEqual(existingProfiles[1]);
  });

  it("handles id as number and converts to string", () => {
    const newProfile = {
      id: 4,
      displayName: "Alice Brown",
      username: "alicebrown",
      lastUpdated: "2023-01-05",
      featured: false,
    } as any;
    const result = upsertProfile(existingProfiles, newProfile);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe("4");
  });

  it("works with empty profiles array", () => {
    const newProfile: UserProfile = {
      id: "1",
      displayName: "New User",
      username: "newuser",
      lastUpdated: "2023-01-01",
      featured: false,
    };
    const result = upsertProfile([], newProfile);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(newProfile);
  });
});

describe("removeProfileById", () => {
  const profiles: UserProfile[] = [
    {
      id: "1",
      displayName: "John Doe",
      username: "johndoe",
      lastUpdated: "2023-01-01",
      featured: false,
    },
    {
      id: "2",
      displayName: "Jane Smith",
      username: "janesmith",
      lastUpdated: "2023-01-02",
      featured: true,
    },
    {
      id: "3",
      displayName: "Bob Wilson",
      username: "bobwilson",
      lastUpdated: "2023-01-03",
      featured: false,
    },
  ];

  it("removes profile with matching id", () => {
    const result = removeProfileById(profiles, "2");
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(["1", "3"]);
  });

  it("returns original array when id not found", () => {
    const result = removeProfileById(profiles, "999");
    expect(result).toHaveLength(3);
    expect(result).toEqual(profiles);
  });

  it("handles id as number", () => {
    const result = removeProfileById(profiles, "1");
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(["2", "3"]);
  });

  it("works with empty array", () => {
    const result = removeProfileById([], "1");
    expect(result).toHaveLength(0);
  });
});
