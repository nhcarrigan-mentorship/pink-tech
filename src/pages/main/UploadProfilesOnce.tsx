import { getSupabase } from "../../config/supabaseClient";
import { profiles } from "../../data/profiles";

export default function UploadProfilesOnce() {
  const camelToSnakeMap: Record<string, string> = {
    createdAt: "created_at",
    lastLogin: "last_login",
    lastUpdated: "last_updated",
    // Add more mappings as needed
  };

  function toSnakeCaseProfile(profile: Record<string, any>) {
    return Object.entries(profile).reduce(
      (acc, [key, value]) => {
        const snakeKey = camelToSnakeMap[key] || key;
        if (value !== undefined) acc[snakeKey] = value;
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  const snakeCaseProfiles = profiles.map(toSnakeCaseProfile);
  async function upload() {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .insert(snakeCaseProfiles);
    if (error) {
      console.error("Insert error:", JSON.stringify(error, null, 2));
    } else {
      console.log("Inserted profiles:", data);
    }
  }
  upload();

  return null;
}
