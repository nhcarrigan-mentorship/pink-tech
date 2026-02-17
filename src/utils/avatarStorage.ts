import { getSupabase } from "../config/supabaseClient";

export async function uploadAvatar(
  file: File,
  profileId: string,
): Promise<string> {
  const supabase = await getSupabase();
  const fileExt = file.name.split(".").pop() ?? "png";
  const filePath = `profiles/${profileId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: false });

  if (uploadError) throw uploadError;

  return filePath;
}

export async function getAvatarPublicUrl(
  path: string | null | undefined,
): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  const supabase = await getSupabase();
  const { data, error } = supabase.storage.from("avatars").getPublicUrl(path);
  if (error) {
    console.error("getAvatarPublicUrl error:", error);
    return null;
  }
  return (data as any)?.publicUrl ?? null;
}

export async function removeAvatar(
  path: string | null | undefined,
): Promise<void> {
  if (!path) return;
  if (path.startsWith("http")) return; // nothing to remove

  const supabase = await getSupabase();
  await supabase.storage.from("avatars").remove([path]);
}
