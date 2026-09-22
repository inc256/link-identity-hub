export const RESERVED_USERNAMES = new Set([
  "login",
  "register",
  "signup",
  "sign-up",
  "auth",
  "dashboard",
  "settings",
  "admin",
  "api",
  "templates",
  "features",
  "qr",
  "p",
  "analytics",
  "onboarding",
  "my-page",
  "about",
  "privacy",
  "terms",
  "cytic",
  "cytic-link",
  "support",
  "help",
  "static",
  "assets",
]);

export const USERNAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

export function validateUsername(value: string): string | null {
  if (!value) return "Choose a username for your link.";
  if (value.length < 3) return "Usernames need at least 3 characters.";
  if (value.length > 40) return "Usernames can be at most 40 characters.";
  if (!USERNAME_PATTERN.test(value))
    return "Use lowercase letters, numbers and hyphens only — no spaces.";
  if (RESERVED_USERNAMES.has(value)) return "That name is reserved. Please pick another.";
  return null;
}

/** Only http(s) links are allowed to protect visitors. */
export function safeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function isValidUrlInput(raw: string): boolean {
  return safeUrl(raw) !== null;
}

export function telHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : null;
}

export function whatsappHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

export function mailHref(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? `mailto:${trimmed}` : null;
}

export function youtubeEmbed(raw: string | null | undefined): string | null {
  const url = safeUrl(raw ?? "");
  if (!url) return null;
  try {
    const parsed = new URL(url);
    let id = "";
    if (parsed.hostname.includes("youtu.be")) id = parsed.pathname.slice(1);
    else if (parsed.pathname.startsWith("/shorts/")) id = parsed.pathname.split("/")[2] ?? "";
    else if (parsed.pathname.startsWith("/embed/")) id = parsed.pathname.split("/")[2] ?? "";
    else id = parsed.searchParams.get("v") ?? "";
    if (!/^[\w-]{6,20}$/.test(id)) return null;
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return null;
  }
}

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return "Please choose a JPG, PNG or WebP image.";
  if (file.size > MAX_IMAGE_BYTES) return "Images must be smaller than 5 MB.";
  return null;
}
