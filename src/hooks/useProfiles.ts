import camelcaseKeys from "camelcase-keys";
import { useState, useEffect, useCallback } from "react";
import supabase from "../config/supabaseClient";
import type { UserProfile } from "../types/UserProfile";

export default function useProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
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
    }
  };
  // Get profiles from Supabase
  useEffect(() => {
    fetchProfiles();
  }, []);

  const refetch = useCallback(fetchProfiles, []);

  return { profiles, loading, error, refetch };
}
