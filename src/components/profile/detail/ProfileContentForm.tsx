import { useState } from "react";
import type { UserProfile } from "../../../types/UserProfile";

interface ProfileContentForm {
  profile: UserProfile;
}

export default function ProfileContentForm({ profile }: ProfileContentForm) {
  const [isSaving, setIsSaving] = useState(false);

  const content = `# Name
## Expertise
- Created...  
- Developed...   
- Built...  
- Explored...  
- Integrated...

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

  return (
    <form className="flex-1 flex flex-col">
      <label htmlFor="content" className="hidden">
        Profile Content
      </label>
      <textarea
        id="content"
        name="content"
        defaultValue={content}
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
