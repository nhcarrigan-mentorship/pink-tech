export interface UserProfile {
  readonly id: string;
  name: string;
  username: string;
  lastUpdated: string;
  image?: string | null;
  bio?: string | null; // Short summary for cards/previews (1-2 sentences)
  role?: string | null;
  company?: string | null;
  location?: string;
  website?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  expertise?: string[] | null;
  content?: string | null; // Free-form markdown content for Wikipedia-style profile
}
