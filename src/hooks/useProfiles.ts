import camelcaseKeys from "camelcase-keys";
import { useState, useEffect, useCallback } from "react";
import supabase from "../config/supabaseClient";
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

  const fetchProfiles = async () => {
    if (profilesListPromise) {
      return profilesListPromise;
    }

    setLoading(true);

    profilesListPromise = (async () => {
      try {
        // Only fetch the fields needed for lists and cards to avoid
        // pulling large `content` blobs on initial app load.
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `id, display_name, username, image, bio, role, company, location, website, linkedin, twitter, expertise, featured, last_updated`,
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

  const refetch = useCallback(fetchProfiles, []);

  const updateProfileInContext = (updated: UserProfile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const fetchFullProfile = useCallback(
    async (username: string) => {
      if (!username) return;

      // If a profile already exists with full content, skip.
      const existing = profiles.find((p) => p.username === username);
      if (existing && existing.content) {
        return;
      }

      // Deduplicate across hook instances and renders by using a module-level
      // promise cache. This avoids duplicate requests caused by StrictMode
      // double-mounts or multiple components requesting the same profile.
      if (fullProfilePromiseCache.has(username)) {
        await fullProfilePromiseCache.get(username);
        return;
      }

      const promise = (async () => {
        try {
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
