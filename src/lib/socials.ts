import type { LucideIcon } from "lucide-react";
import {
  AtSign,
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Pin,
  Send,
  Youtube,
} from "lucide-react";

export interface SocialPlatform {
  value: string;
  label: string;
  icon: LucideIcon;
  hint: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { value: "instagram", label: "Instagram", icon: Instagram, hint: "https://instagram.com/yourname" },
  { value: "facebook", label: "Facebook", icon: Facebook, hint: "https://facebook.com/yourpage" },
  { value: "tiktok", label: "TikTok", icon: Music2, hint: "https://tiktok.com/@yourname" },
  { value: "youtube", label: "YouTube", icon: Youtube, hint: "https://youtube.com/@yourchannel" },
  { value: "x", label: "X", icon: AtSign, hint: "https://x.com/yourname" },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, hint: "https://linkedin.com/in/yourname" },
  { value: "telegram", label: "Telegram", icon: Send, hint: "https://t.me/yourname" },
  { value: "snapchat", label: "Snapchat", icon: MessageCircle, hint: "https://snapchat.com/add/yourname" },
  { value: "pinterest", label: "Pinterest", icon: Pin, hint: "https://pinterest.com/yourname" },
  { value: "github", label: "GitHub", icon: Github, hint: "https://github.com/yourname" },
  { value: "threads", label: "Threads", icon: AtSign, hint: "https://threads.net/@yourname" },
];

export const SOCIAL_MAP: Record<string, SocialPlatform> = Object.fromEntries(
  SOCIAL_PLATFORMS.map((platform) => [platform.value, platform]),
);

export function socialIcon(platform: string): LucideIcon {
  return SOCIAL_MAP[platform]?.icon ?? Globe;
}

export function socialLabel(platform: string): string {
  return SOCIAL_MAP[platform]?.label ?? platform;
}
