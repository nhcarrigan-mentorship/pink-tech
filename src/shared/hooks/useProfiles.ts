import camelcaseKeys from "camelcase-keys";
import { useCallback, useEffect, useState } from "react";
import { getPublicSupabase, getSupabase } from "../config/supabaseClient";
import type { UserProfile } from "../types/UserProfile";
import { removeProfileById, upsertProfile } from "../utils/profileUtils";

// Cache for full profile fetches to avoid duplicate requests
const fullProfilePromiseCache: Map<
  string,
  Promise<UserProfile | null>
> = new Map();
// Promise to avoid duplicate initial profile list fetches
let profilesListPromise: Promise<void> | null = null;
// Cache for profiles to share between hook instances
export let profilesCache: UserProfile[] | null = null;
// Flag to track if full list was fetched
let profilesListFetched = false;

export default function useProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>(profilesCache ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfiles = async () => {
    // Use cached data if available
    if (profilesCache && profilesListFetched) {
      setProfiles(profilesCache);
      return;
    }

    // Wait for ongoing fetch if any
    if (profilesListPromise) {
      setLoading(true);
      try {
        await profilesListPromise;
        if (profilesCache) setProfiles(profilesCache);
      } catch (err) {
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
      // Abort fetch after 15 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        // Fetch basic profile fields only
        const supabase = await getPublicSupabase();

        const { data, error } = await supabase
          .from("profiles")
          .select(
            `id, display_name, username, image, bio, role, company, location, website, linkedin, github, expertise, featured, last_updated`,
          )
          .abortSignal(controller.signal);

        if (error) {
          if (error.message?.includes("AbortError")) {
            console.debug("Profiles fetch aborted:", error);
          } else {
            setError(error);
            console.error(error);
          }
        } else if (data) {
          const parsed = camelcaseKeys(data, { deep: true }) as UserProfile[];
          // Merge with existing full profiles
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
        if ((err as any)?.name === "AbortError") {
          console.debug("Profiles fetch aborted:", err);
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

  // Fetch profiles on mount
  useEffect(() => {
    fetchProfiles();
  }, []);

  // Subscribe to realtime profile changes
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

            // Handle delete or upsert
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
            console.error("Realtime handler error:", err);
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

  // Update a profile in the list
  const updateProfile = useCallback((updated: UserProfile) => {
    setProfiles((prev) => {
      const next = upsertProfile(prev, updated);
      profilesCache = next;
      return next;
    });
  }, []);

  // Refetch all profiles
  const refetch = useCallback(fetchProfiles, []);

  // Remove a profile by ID
  const removeProfile = useCallback((id: string) => {
    setProfiles((prev) => {
      const next = removeProfileById(prev, id);
      profilesCache = next;
      return next;
    });
  }, []);

  // Fetch full profile data for a username
  const fetchFullProfile = useCallback(
    async (username: string) => {
      if (!username) return;
      const normalizedUsername = username.toLowerCase();

      // Skip if already have full content
      const existing = profiles.find(
        (p) => p.username.toLowerCase() === normalizedUsername,
      );
      if (existing && existing.content) return;

      // Use cached promise if available
      const cached = fullProfilePromiseCache.get(normalizedUsername);
      if (cached) {
        await cached;
        return;
      }

      // Fetch full profile
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

      // Cache the promise
      fullProfilePromiseCache.set(normalizedUsername, promise);

      // Clean up cache after
      promise.finally(() => {
        if (fullProfilePromiseCache.get(normalizedUsername) === promise) {
          fullProfilePromiseCache.delete(normalizedUsername);
        }
      });

      await promise;
    },
    [profiles, updateProfile],
  );

  // Return hook API
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
