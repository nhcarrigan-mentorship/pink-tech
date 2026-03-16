export const BIO_MAX = 160;
export const BIO_MIN = 1;

export const EMAIL_MAX = 320;

export const NAME_MIN = 2;
export const NAME_MAX = 141;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;

export const PASSWORD_RULES = [
  {
    label: "At least 8 characters",
    test: (v: string) => v.length >= PASSWORD_MIN,
  },
  {
    label: "At most 128 characters",
    test: (v: string) => v.length <= PASSWORD_MAX,
  },
  {
    label: "One uppercase letter (A–Z)",
    test: (v: string) => /[A-Z]/.test(v),
  },
  {
    label: "One lowercase letter (a–z)",
    test: (v: string) => /[a-z]/.test(v),
  },
  { label: "One number (0–9)", test: (v: string) => /[0-9]/.test(v) },
  {
    label: "One special character (!@#$%^&*…)",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
];

export function getPasswordStrength(value: string): number {
  if (value.length === 0) return 0;
  return PASSWORD_RULES.filter((r) => r.test(value)).length;
}

export function validateBio(bio: string): string | null {
  if (bio.length < BIO_MIN || bio.length <= BIO_MAX) return null;
  return `Bio must be ${BIO_MAX} characters or fewer.`;
}

export function validateCompany(company: string): string | null {
  const trimmed = company.trim();
  if (!trimmed) return null;
  if (trimmed.length < 2) return `Company must be at least 2 characters.`;
  if (trimmed.length > 80) return `Company must be 80 characters or fewer.`;
  if (!/^[\p{L}0-9 .\-&,()]+$/u.test(trimmed))
    return `Company should only include letters, numbers, spaces and . - , & ( ).`;
  return null;
}

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed.length < 1) return null;
  if (trimmed.length > EMAIL_MAX)
    return "Email must be 320 characters or fewer.";
  if (/\s/.test(trimmed)) return "Email must not contain spaces.";

  const parts = trimmed.split("@");
  if (parts.length !== 2) return "Please provide a valid email address.";

  const [local, domain] = parts;

  // Local-part checks
  if (local.length < 1 || local.length > 64)
    return "Email local part should be 1–64 characters.";
  if (local.startsWith(".") || local.endsWith("."))
    return "Email local part must not start or end with a dot.";
  if (local.includes(".."))
    return "Email local part must not contain consecutive dots.";
  if (!/^[A-Za-z0-9._-]+$/.test(local))
    return "Email local part may only include letters, numbers, dots, underscores, and hyphens.";

  // Domain checks
  if (domain.length < 1 || domain.length > 255)
    return "Please provide a valid email domain.";
  const labels = domain.split(".").filter(Boolean);
  if (labels.length < 2)
    return "Email domain must include a top-level domain (e.g. .com).";
  for (const label of labels) {
    if (label.length < 1 || label.length > 63)
      return "Each domain label should be 1–63 characters.";
    if (!/^[A-Za-z0-9-]+$/.test(label))
      return "Email domain may only include letters, numbers, and hyphens.";
    if (label.startsWith("-") || label.endsWith("-"))
      return "Email domain labels must not start or end with a hyphen.";
  }
  const tld = labels[labels.length - 1];
  if (!/^[A-Za-z]{2,}$/.test(tld))
    return "Top-level domain should be at least 2 letters.";

  return null;
}

export function validateExpertise(
  expertise: string,
  profileExpertise: string[] | null | undefined,
) {
  const EXPERTISE_MIN = 2;
  const EXPERTISE_MAX = 40;
  const EXPERTISE_REGEX = /^[\p{L}0-9 .#\+\-\/&()]+$/u;

  const trimmed = expertise.trim();

  if (!trimmed.length) return null;
  if (trimmed.length < EXPERTISE_MIN)
    return `Expertise must be at least ${EXPERTISE_MIN} characters.`;
  if (trimmed.length > EXPERTISE_MAX)
    return `Expertise must be ${EXPERTISE_MAX} characters or fewer.`;
  if (profileExpertise?.includes(trimmed))
    return "This expertise is already added.";
  if (!EXPERTISE_REGEX.test(trimmed))
    return "Allowed characters: letters, numbers, spaces, and . # + - / & ( )";
  return null;
}

export function validateGithub(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
    );
    const host = parsed.hostname.toLowerCase();
    if (!host.includes("github.com"))
      return "Please provide a GitHub profile URL.";
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length < 1)
      return "Please provide a GitHub profile URL (e.g. github.com/username).";
    const username = segments[0];
    if (!/^[A-Za-z0-9-]+$/.test(username))
      return "GitHub username in the URL should only include letters, numbers, and hyphens.";
    return null;
  } catch (e) {
    return "Please provide a valid GitHub URL.";
  }
}

export function validateLinkedin(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
    );
    const host = parsed.hostname.toLowerCase();
    if (!host.includes("linkedin.com"))
      return "Please provide a LinkedIn profile URL.";
    const path = parsed.pathname || "";
    if (!path.startsWith("/in/") && !path.startsWith("/pub/"))
      return "LinkedIn profile URL should be a personal profile (e.g. /in/username).";
    return null;
  } catch (e) {
    return "Please provide a valid LinkedIn URL.";
  }
}

export function validateLinks(markdown: string) {
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

export function validateLocation(location: string): string | null {
  const trimmed = location.trim();
  if (!trimmed) return null;
  if (trimmed.length < 2) return `Location must be at least 2 characters.`;
  if (trimmed.length > 100) return `Location must be 100 characters or fewer.`;
  if (!/^[\p{L}0-9 .,'\-()]+$/u.test(trimmed))
    return `Location should only include letters, numbers, commas, and punctuation.`;
  return null;
}

export function validateName(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed.length < 1) return "Name cannot be empty.";
  if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX)
    return "Name must be between 2 and 141 characters.";
  if (!/^[\p{L}\p{M}'\-. ]+$/u.test(trimmed))
    return "Name can only contain letters, spaces, hyphens, apostrophes, and periods.";
  if (/\s{2,}/.test(trimmed)) return "Name cannot contain consecutive spaces.";
  if (/[-'.]{2,}/.test(trimmed))
    return "Name cannot contain consecutive hyphens, apostrophes, or periods.";
  if (/^[-'.]|[-'.]$/.test(trimmed))
    return "Name cannot start or end with a hyphen, apostrophe, or period.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (value.length < 1) return null;
  if (value.length > PASSWORD_MAX)
    return `Password must be at most ${PASSWORD_MAX} characters.`;
  if (value.length < PASSWORD_MIN)
    return `Password must be at least ${PASSWORD_MIN} characters.`;
  if (!/[A-Z]/.test(value))
    return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(value))
    return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(value)) return "Password must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(value))
    return "Password must contain at least one special character.";
  return null;
}

export function validateRole(role: string): string | null {
  const trimmed = role.trim();
  if (!trimmed) return null;
  if (trimmed.length < 2) return `Role must be at least 2 characters.`;
  if (trimmed.length > 60) return `Role must be 60 characters or fewer.`;
  if (!/^[\p{L}0-9 .\-,&()]+$/u.test(trimmed))
    return `Role should only include letters, numbers, spaces and . - , & ( ).`;
  return null;
}

export function validateUsername(value: string): string | null {
  if (value.length < 1) return null;
  if (value.length < USERNAME_MIN || value.length > USERNAME_MAX)
    return `Username must be between ${USERNAME_MIN} and ${USERNAME_MAX} characters.`;
  if (!/^[a-zA-Z0-9_-]+$/.test(value))
    return "Username can only contain letters, numbers, underscores, and hyphens.";
  if (/^[_-]|[_-]$/.test(value))
    return "Username cannot start or end with an underscore or hyphen.";
  if (/[_-]{2}/.test(value))
    return "Username cannot contain consecutive underscores or hyphens.";
  if (/^[0-9]/.test(value)) return "Username must start with a letter.";
  return null;
}

export function validateWebsite(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    // allow users to omit protocol by prefixing https:// when parsing
    const parsed = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
    );
    const host = parsed.hostname;
    if (!host || !host.includes("."))
      return "Please provide a valid website URL or domain.";
    return null;
  } catch (e) {
    return "Please provide a valid website URL.";
  }
}
