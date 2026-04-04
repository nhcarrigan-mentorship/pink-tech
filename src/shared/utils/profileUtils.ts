import type { UserProfile } from "../shared/types/UserProfile";

/**
 * Merges updated fields into an existing profile.
 * Only overwrites fields that are not undefined.
 */
export function mergeProfile(
  base: UserProfile,
  updated: Partial<UserProfile> | any,
): UserProfile {
  const result: any = { ...base };
  if (!updated) return result as UserProfile;
  for (const key of Object.keys(updated)) {
    const v = (updated as any)[key];
    if (v !== undefined) result[key] = v;
  }
  if ((updated as any).id !== undefined)
    result.id = String((updated as any).id);
  return result as UserProfile;
}

/**
 * Adds or updates a profile in the array.
 * If the profile exists (by ID), it merges the updates.
 * If not, it adds the new profile at the beginning.
 */
export function upsertProfile(
  profiles: UserProfile[],
  updated: UserProfile,
): UserProfile[] {
  const exists = profiles.some((p) => String(p.id) === String(updated.id));
  if (exists) {
    return profiles.map((p) =>
      String(p.id) === String(updated.id) ? mergeProfile(p, updated) : p,
    );
  } else {
    return [
      {
        ...(updated as any),
        id: String((updated as any).id),
      } as UserProfile,
      ...profiles,
    ];
  }
}

/**
 * Removes a profile from the array by ID.
 */
export function removeProfileById(
  profiles: UserProfile[],
  id: string,
): UserProfile[] {
  return profiles.filter((p) => String(p.id) !== String(id));
}
