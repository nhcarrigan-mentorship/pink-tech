import type { UserProfile } from "../types/UserProfile";

// Helper: merge updated fields into an existing profile without
// overwriting properties with `undefined` values coming from updates.
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

export function removeProfileById(
  profiles: UserProfile[],
  id: string,
): UserProfile[] {
  return profiles.filter((p) => String(p.id) !== String(id));
}
