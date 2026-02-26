import camelcaseKeys from "camelcase-keys";
import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../config/supabaseClient";
import type { UserProfile } from "../types/UserProfile";

// Module-level promise cache to deduplicate fetches across hook instances
const fullProfilePromiseCache: Map<
  string,
  Promise<UserProfile | null>
> = new Map();
// Module-level promise to deduplicate the initial profiles list fetch
let profilesListPromise: Promise<void> | null = null;

export default function useProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Helper: merge updated fields into an existing profile without
  // overwriting properties with `undefined` values coming from updates.
  function mergeProfile(
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

  const fetchProfiles = async () => {
    if (profilesListPromise) return profilesListPromise;

    setLoading(true);

    profilesListPromise = (async () => {
      try {
        // Only fetch the fields needed for lists and cards to avoid
        // pulling large `content` blobs on initial app load.
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `id, display_name, username, image, bio, role, company, location, website, linkedin, github, expertise, featured, last_updated`,
          );

        if (error) {
          setError(error);
          console.error(error);
        } else if (data) {
          setProfiles(camelcaseKeys(data, { deep: true }));
        }
      } catch (err) {
        setError(err as Error);
        console.error(err);
      } finally {
        setLoading(false);
        profilesListPromise = null;
      }
    })();

    return profilesListPromise;
  };

  // Get profiles from Supabase
  useEffect(() => {
    fetchProfiles();
  }, []);

  // Subscribe to realtime changes for `profiles` so external updates
  // (from other tabs, users, or server-side edits) are reflected in UI.
  useEffect(() => {
    let mounted = true;
    let channel: any;

    (async () => {
      try {
        const supabase = await getSupabase();
        const handleChange = (payload: any) => {
          if (!mounted) return;
          try {
            const raw = payload.new || payload.old;
            const updated = camelcaseKeys(raw || {}, {
              deep: true,
            }) as unknown as UserProfile;

            // DELETE: remove from list; otherwise upsert into list
            const isDelete = !payload.new && payload.old;
            if (isDelete) {
              setProfiles((prev) =>
                prev.filter((p) => String(p.id) !== String(updated.id)),
              );
            } else {
              setProfiles((prev) => {
                const exists = prev.some(
                  (p) => String(p.id) === String(updated.id),
                );
                if (exists) {
                  return prev.map((p) =>
                    String(p.id) === String(updated.id)
                      ? mergeProfile(p, updated)
                      : p,
                  );
                }
                // Insert new items at the front to keep list visible
                return [
                  {
                    ...(updated as any),
                    id: String((updated as any).id),
                  } as UserProfile,
                  ...prev,
                ];
              });
            }
          } catch (err) {
            console.error("profiles realtime handler error:", err);
          }
        };

        channel = supabase
          .channel("public:profiles")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "profiles" },
            handleChange,
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "profiles" },
            handleChange,
          )
          .on(
            "postgres_changes",
            { event: "DELETE", schema: "public", table: "profiles" },
            handleChange,
          )
          .subscribe();
      } catch (err) {
        console.error("Failed to subscribe to profiles realtime:", err);
      }
    })();

    return () => {
      mounted = false;
      try {
        if (channel && typeof channel.unsubscribe === "function")
          channel.unsubscribe();
      } catch (e) {
        /* ignore */
      }
    };
  }, []);

  const refetch = useCallback(fetchProfiles, []);

  const updateProfileInContext = (updated: UserProfile) => {
    setProfiles((prev) =>
      prev.map((p) =>
        String(p.id) === String((updated as any).id)
          ? mergeProfile(p, updated)
          : p,
      ),
    );
  };

  const fetchFullProfile = useCallback(
    async (username: string) => {
      if (!username) return;

      // If a profile already exists with full content, skip.
      const existing = profiles.find((p) => p.username === username);
      if (existing && existing.content) return;

      // Deduplicate across hook instances and renders by using a module-level
      // promise cache. This avoids duplicate requests caused by StrictMode
      // double-mounts or multiple components requesting the same profile.
      if (fullProfilePromiseCache.has(username)) {
        await fullProfilePromiseCache.get(username);
        return;
      }

      const promise = (async () => {
        try {
          const supabase = await getSupabase();
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("username", username)
            .single();

          if (error) {
            console.error("fetchFullProfile error:", error);
            return null;
          }

          if (data) {
            const full = camelcaseKeys(data, {
              deep: true,
            }) as unknown as UserProfile;
            updateProfileInContext(full);
            return full;
          }
          return null;
        } catch (err) {
          console.error(err);
          return null;
        }
      })();

      fullProfilePromiseCache.set(username, promise);
      await promise;
    },
    [profiles, updateProfileInContext],
  );

  return {
    profiles,
    loading,
    error,
    refetch,
    updateProfileInContext,
    fetchFullProfile,
  };
}
