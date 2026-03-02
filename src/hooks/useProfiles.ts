import camelcaseKeys from "camelcase-keys";
import { useState, useEffect, useCallback } from "react";
import { getPublicSupabase, getSupabase } from "../config/supabaseClient";
import type { UserProfile } from "../types/UserProfile";

// Module-level promise cache to deduplicate fetches across hook instances
const fullProfilePromiseCache: Map<
  string,
  Promise<UserProfile | null>
> = new Map();
// Module-level promise to deduplicate the initial profiles list fetch
let profilesListPromise: Promise<void> | null = null;
// Module-level cache so remounted hook instances (e.g. React StrictMode
// double-mount) immediately receive already-fetched profiles instead of
// seeing an empty list or having to refetch.
let profilesCache: UserProfile[] | null = null;

export default function useProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>(profilesCache ?? []);
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
    // If profiles are already cached (e.g. from a previous mount), skip the
    // network round-trip and just make sure local state is in sync.
    if (profilesCache) {
      setProfiles(profilesCache);
      return;
    }

    if (profilesListPromise) {
      // A fetch is already in-flight (e.g. React StrictMode double-mount).
      // Mirror the loading state on this instance and wait for it to finish.
      setLoading(true);
      try {
        await profilesListPromise;
        // Seed this instance's state from the module-level cache that the
        // original fetch will have populated.
        if (profilesCache) setProfiles(profilesCache);
      } catch (err) {
        // Swallow AbortErrors (session change cancelled the in-flight request).
        if ((err as any)?.name !== "AbortError") {
          setError(err as Error);
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);

    profilesListPromise = (async () => {
      // Use an AbortController so the timeout actually cancels the underlying
      // fetch request. Promise.race alone only ignores the result — the fetch
      // keeps running, holds Supabase's internal resources, and each successive
      // attempt adds another ghost request that piles up and causes lock
      // contention. Aborting via signal tears down the network request entirely.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        // Only fetch the fields needed for lists and cards to avoid
        // pulling large `content` blobs on initial app load.
        // Use the public (anon-only) client so this query is never blocked by
        // the GoTrue token-refresh lock that the standard client acquires.
        const supabase = await getPublicSupabase();

        const { data, error } = await supabase
          .from("profiles")
          .select(
            `id, display_name, username, image, bio, role, company, location, website, linkedin, github, expertise, featured, last_updated`,
          )
          .abortSignal(controller.signal);

        if (error) {
          // AbortError is returned (not thrown) by Supabase when signOut()
          // cancels in-flight requests. It's an expected cancellation, not a
          // real failure — swallow it silently.
          if (error.message?.includes("AbortError")) {
            console.debug("Profiles fetch aborted (session change):", error);
          } else {
            setError(error);
            console.error(error);
          }
        } else if (data) {
          const parsed = camelcaseKeys(data, { deep: true }) as UserProfile[];
          profilesCache = parsed;
          setProfiles(parsed);
        }
      } catch (err) {
        // AbortError is thrown by Supabase when it cancels in-flight requests
        // (e.g. during supabase.auth.signOut()). That's an expected cancellation,
        // not a real failure — swallow it silently instead of surfacing it as a
        // user-visible error.
        if ((err as any)?.name === "AbortError") {
          console.debug("Profiles fetch aborted (session change):", err);
        } else {
          setError(err as Error);
          console.error(err);
        }
      } finally {
        clearTimeout(timeoutId);
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
              setProfiles((prev) => {
                const next = prev.filter(
                  (p) => String(p.id) !== String(updated.id),
                );
                profilesCache = next;
                return next;
              });
            } else {
              setProfiles((prev) => {
                const exists = prev.some(
                  (p) => String(p.id) === String(updated.id),
                );
                let next: UserProfile[];
                if (exists) {
                  next = prev.map((p) =>
                    String(p.id) === String(updated.id)
                      ? mergeProfile(p, updated)
                      : p,
                  );
                } else {
                  // Insert new items at the front to keep list visible
                  next = [
                    {
                      ...(updated as any),
                      id: String((updated as any).id),
                    } as UserProfile,
                    ...prev,
                  ];
                }
                profilesCache = next;
                return next;
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

  const updateProfileInContext = useCallback((updated: UserProfile) => {
    setProfiles((prev) => {
      const exists = prev.some(
        (p) => String(p.id) === String((updated as any).id),
      );
      const next = exists
        ? prev.map((p) =>
            String(p.id) === String((updated as any).id)
              ? mergeProfile(p, updated)
              : p,
          )
        : [
            ...prev,
            {
              ...(updated as any),
              id: String((updated as any).id),
            } as UserProfile,
          ];
      profilesCache = next;
      return next;
    });
  }, []);

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
          const supabase = await getPublicSupabase();
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
