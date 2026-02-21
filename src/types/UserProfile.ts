export interface UserProfile {
  readonly id: string;
  displayName: string;
  username: string;
  lastUpdated: string;
  featured: boolean;
  image?: string | null;
  bio?: string | null; // Short summary for cards/previews (1-2 sentences)
  role?: string | null;
  company?: string | null;
  location?: string;
  email?: string;
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
  expertise?: string[] | null;
  content?: string | null; // Free-form markdown content for Wikipedia-style profile
}
