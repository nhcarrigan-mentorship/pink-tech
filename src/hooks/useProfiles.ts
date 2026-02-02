import camelcaseKeys from "camelcase-keys";
import { useState, useEffect } from "react";
import supabase from "../config/supabaseClient";
import type { UserProfile } from "../types/UserProfile";

export default function useProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) {
        setError(error);
        console.error(error);
      } else {
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

  return { profiles, loading, error };
}
