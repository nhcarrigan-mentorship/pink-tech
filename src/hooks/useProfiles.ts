import camelcaseKeys from "camelcase-keys";
import { useState, useEffect, useCallback } from "react";
import { getPublicSupabase, getSupabase } from "../config/supabaseClient";
import type { UserProfile } from "../types/UserProfile";
import { upsertProfile, removeProfileById } from "../utils/profileUtils";

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
export let profilesCache: UserProfile[] | null = null;
// Tracks whether profilesCache was populated by a full list fetch (as opposed
// to a single-profile update from updateProfileInContext/fetchFullProfile).
// fetchProfiles must only short-circuit on a full-list cache, not a partial one.
let profilesListFetched = false;

export default function useProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>(profilesCache ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfiles = async () => {
    // If the full profiles list was already fetched (e.g. from a previous mount),
    // skip the network round-trip and just make sure local state is in sync.
    // Note: profilesCache may be set by updateProfileInContext with only a single
    // profile — we must not short-circuit on that partial cache.
    if (profilesCache && profilesListFetched) {
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
          // Preserve `content` from any profiles already fully fetched
          // (e.g. fetchFullProfile completed before this list fetch).
          // IMPORTANT: set profilesCache synchronously here (not inside the
          // setProfiles callback) so that the profilesListPromise branch in
          // any concurrent fetchProfiles call reads the correct full-list cache
          // immediately after awaiting, rather than a stale single-profile cache.
          const currentCache = profilesCache ?? [];
          const merged = parsed.map((p) => {
            const existing = currentCache.find(
              (e) => String(e.id) === String(p.id),
            );
            return existing?.content ? { ...p, content: existing.content } : p;
          });
          profilesCache = merged;
          profilesListFetched = true;
          setProfiles(merged);
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
                const next = removeProfileById(prev, String(updated.id));
                profilesCache = next;
                return next;
              });
            } else {
              setProfiles((prev) => {
                const next = upsertProfile(prev, updated);
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

  const updateProfile = useCallback((updated: UserProfile) => {
    setProfiles((prev) => {
      const next = upsertProfile(prev, updated);
      profilesCache = next;
      return next;
    });
  }, []);

  const refetch = useCallback(fetchProfiles, []);

  const removeProfile = useCallback((id: string) => {
    setProfiles((prev) => {
      const next = removeProfileById(prev, id);
      profilesCache = next;
      return next;
    });
  }, []);

  const fetchFullProfile = useCallback(
    async (username: string) => {
      if (!username) return;
      const normalizedUsername = username.toLowerCase();

      // If a profile already exists with full content, skip.
      const existing = profiles.find(
        (p) => p.username.toLowerCase() === normalizedUsername,
      );
      if (existing && existing.content) return;

      // Reuse in-flight promise
      const cached = fullProfilePromiseCache.get(normalizedUsername);
      if (cached) {
        await cached;
        return;
      }

      // Create promise
      const promise = (async () => {
        try {
          const supabase = await getPublicSupabase();
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .ilike("username", normalizedUsername)
            .single();

          if (error) {
            console.error("fetchFullProfile error:", error);
            return null;
          }

          if (data) {
            const full = camelcaseKeys(data, {
              deep: true,
            }) as unknown as UserProfile;
            updateProfile(full);
            return full;
          }
          return null;
        } catch (err) {
          console.error(err);
          return null;
        }
      })();

      // Store first
      fullProfilePromiseCache.set(normalizedUsername, promise);

      // Attach cleanup
      promise.finally(() => {
        if (fullProfilePromiseCache.get(normalizedUsername) === promise) {
          fullProfilePromiseCache.delete(normalizedUsername);
        }
      });

      await promise;
    },
    [profiles, updateProfile],
  );

  return {
    profiles,
    loading,
    error,
    refetch,
    updateProfile,
    removeProfile,
    fetchFullProfile,
  };
}
