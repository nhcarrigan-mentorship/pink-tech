import LazyIcon from "../../ui/LazyIcon";
import type { UserProfile } from "../../../types/UserProfile";
import { useEffect, useState, type ReactNode } from "react";
import { Edit } from "lucide-react";
import ProfileContentForm from "./ProfileContentForm";

// ReactMarkdown and remark-gfm are moderately large; lazy-load them when
// profile content is actually needed to avoid adding them to the initial bundle.
type ReactMarkdownType = any;
type RemarkGfmType = any;

interface ProfileContentProps {
  isOwner: boolean;
  profile?: UserProfile;
}

export default function ProfileContent({
  profile,
  isOwner,
}: ProfileContentProps) {
  const [ReactMarkdown, setReactMarkdown] = useState<ReactMarkdownType | null>(
    null,
  );
  const [remarkGfm, setRemarkGfm] = useState<RemarkGfmType | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!profile?.content) return;
    // Load on-demand
    Promise.all([import("react-markdown"), import("remark-gfm")]).then(
      ([rm, gfm]) => {
        if (mounted) {
          setReactMarkdown(() => rm.default || rm);
          setRemarkGfm(() => gfm.default || gfm);
        }
      },
    );
    return () => {
      mounted = false;
    };
  }, [profile?.content]);
  const isoString = profile?.lastUpdated;

  const formattedDate = isoString
    ? new Date(isoString).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      })
    : undefined;

  return isEditing ? (
    <ProfileContentForm />
  ) : (
    <article className="prose prose-gray max-w-none">
      {/* Profile Last Updated */}
      <div className="flex items-center gap-1.5 mb-4 text-sm text-gray-600 italic font-medium">
        <LazyIcon name="Clock" className="w-3.5 h-3.5" />
        <span>Last updated: {formattedDate}</span>
      </div>
      {/* Profile Content */}
      {profile?.content ? (
        ReactMarkdown && remarkGfm ? (
          <div className="relative">
            {isOwner && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute right-0 inline-flex items-center justify-center min-w-[44px] min-h-[44px] bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors cursor-pointer flex-shrink-0 z-10"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Styling for H1 (profile name)
                h1: ({ children }: { children?: ReactNode }) => (
                  <h1 className="pb-2 border-b-2 border-pink-200 mb-6 text-4xl text-gray-900 font-bold">
                    {children}
                  </h1>
                ),
                h2: ({ children }: { children?: ReactNode }) => (
                  <h2 className="pb-1 border-b border-pink-200 pb-1 mb-4 mt-8 text-2xl text-gray-900 font-bold">
                    {children}
                  </h2>
                ),
                h3: ({ children }: { children?: ReactNode }) => (
                  <h3 className="pb-1 mt-6 mb-3 text-xl text-gray-900 font-bold">
                    {children}
                  </h3>
                ),
                p: ({ children }: { children?: ReactNode }) => (
                  <p className="mb-4 text-gray-900 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }: { children?: ReactNode }) => (
                  <ul className="space-y-2 mb-4 ml-6">{children}</ul>
                ),
                li: ({ children }: { children?: ReactNode }) => (
                  <li className="text-gray-900">
                    <span className="text-pink-600 mr-2">•</span>
                    <span>{children}</span>
                  </li>
                ),
                a: ({
                  href,
                  children,
                }: {
                  href?: string;
                  children?: ReactNode;
                }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700 underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {profile?.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-gray-900">Profile content coming soon...</p>
        )
      ) : null}
    </article>
  );
}
