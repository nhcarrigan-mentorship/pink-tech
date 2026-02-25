import { useEffect, useState } from "react";
import type { UserProfile } from "../../../types/UserProfile";
import { getSupabase } from "../../../config/supabaseClient";
import { useProfilesContext } from "../../../contexts/ProfilesContext";
import camelcaseKeys from "camelcase-keys";
import DOMPurify from "dompurify";

interface ProfileContentForm {
  profile: UserProfile;
}

export default function ProfileContentForm({ profile }: ProfileContentForm) {
  const [isSaving, setIsSaving] = useState(false);
  const { updateProfileInContext } = useProfilesContext();

  const defaultContent = `# Name

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

  function validateLinks(markdown: string) {
    const LINK_REGEX = /\[[^\]]*\]\(([^)]+)\)/g;
    let m: RegExpExecArray | null;
    const allowed = ["http:", "https:", "mailto:", "tel:"];
    while ((m = LINK_REGEX.exec(markdown))) {
      try {
        const url = m[1].trim();
        // allow relative links
        if (url.startsWith("/") || url.startsWith("#")) continue;
        const parsed = new URL(url, "https://example.com");
        if (!allowed.includes(parsed.protocol)) return false;
      } catch {
        return false;
      }
    }
    return true;
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
    <form className="flex-1 flex flex-col">
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
      </div>
    </form>
  );
}
