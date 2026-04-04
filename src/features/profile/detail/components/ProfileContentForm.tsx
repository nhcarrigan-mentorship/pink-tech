import { useEffect, useState } from "react";
import type { UserProfile } from "../../../../shared/types/UserProfile";
import { getSupabase } from "../../../../config/supabaseClient";
import { useProfilesContext } from "../../../../shared/hooks/useProfilesContext";
import camelcaseKeys from "camelcase-keys";
import DOMPurify from "dompurify";
import { validateLinks } from "../../../../shared/utils/validators";

interface ProfileContentForm {
  profile: UserProfile;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProfileContentForm({
  profile,
  setIsEditing,
}: ProfileContentForm) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const { updateProfileInContext } = useProfilesContext();

  const defaultContent = `# ${profile.displayName}

## Early Life & Education
- Explored...  
- Learned...  
- Built...

## Major Achievements
- Created...  
- Developed...  
- Focused on...

## Personal Approach & Philosophy
- Emphasizes...  
- Advocates...  
- Values...

## Fun Facts
- Enjoys...  
- Learns...  
- Passionate about...`;

  const [content, setContent] = useState<string | null>(
    profile.content ?? defaultContent,
  );

  function onContentChange(content: string) {
    setContent(content);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();

    // Skip saving when profile content remains the same
    if (content === profile.content) {
      setIsEditing(false);
    }

    let success;

    setIsSaving(true);
    setSaveError(null);

    try {
      const raw = content ?? "";

      // Strip any raw HTML tags from the markdown input
      const stripped = DOMPurify.sanitize(raw, { ALLOWED_TAGS: [] });

      // Basic link protocol validation
      if (!validateLinks(stripped)) {
        throw new Error("One or more links use a disallowed protocol.");
      }

      // Save to Supabase
      const supabase = await getSupabase();
      const updatedAt = new Date().toISOString();
      const { error, data } = await supabase
        .from("profiles")
        .update({
          content: stripped != "" ? stripped : null,
          last_updated: updatedAt,
        })
        .eq("id", profile.id)
        .select()
        .single();

      if (error) setSaveError(error);

      if (data) {
        const updated = camelcaseKeys(data, { deep: true });
        updateProfileInContext(updated);
      }

      success = true;
    } catch (err) {
      const normalized = err instanceof Error ? err : Error(String(err));
      setSaveError(normalized);
    } finally {
      setIsSaving(false);
      if (success) {
        setIsEditing(false);
      }
    }
  }

  function onCancel() {
    setIsEditing(false);
  }

  // Set profile content
  useEffect(() => {
    if (profile.content === null) {
      setContent(defaultContent);
    } else if (profile.content) {
      setContent(profile.content);
    }
  }, [profile.content]);

  return (
    <form className="flex-1 flex flex-col" onSubmit={onSave}>
      <label htmlFor="content" className="hidden">
        Profile Content
      </label>
      <textarea
        id="content"
        name="content"
        value={content ?? ""}
        onChange={(e) => onContentChange(e.target.value)}
        className="h-full px-4 py-3 border border-pink-300 font-mono rounded-lg outline-pink-500"
      ></textarea>
      {/* Action Buttons */}
      <div className="flex gap-3 pt-3 border-t border-pink-200">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 min-h-[44px] py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => onCancel()}
          className="flex-1 min-h-[44px] py-3 bg-white border border-gray-300 text-gray-900 font-bold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
      {saveError && (
        <p className="text-red-600 font-semibold mt-2">
          Error saving your changes. Please try again later.
        </p>
      )}
    </form>
  );
}
