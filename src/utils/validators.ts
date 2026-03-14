export const NAME_MIN = 2;
export const NAME_MAX = 141;

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;

export const EMAIL_MAX = 320;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

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

export function validateName(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed.length < 1) return null;
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
