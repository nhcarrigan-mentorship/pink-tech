import type { UserProfile } from "../../shared/types/UserProfile";

export const mockProfile: UserProfile = {
  id: "1",
  displayName: "Jane Doe",
  username: "janedoe",
  lastUpdated: "2026-04-27T10:15:30.000Z",
  featured: false,

  // optional / nullable fields
  authEmail: "jane.auth@email.com",
  image:
    "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop",
  bio: "Frontend engineer passionate about building accessible UI.",
  role: "Frontend Engineer",
  company: "Tech Co",
  location: "Manila, Philippines",
  email: "jane@email.com",
  website: "https://janedoe.dev",
  linkedin: "https://linkedin.com/in/janedoe",
  github: "https://github.com/janedoe",
  expertise: ["React", "TypeScript", "Accessibility"],
  content:
    "# Jane Doe\n ## About Jane\n\nJane is a frontend engineer specializing in React and modern web technologies.",
};
