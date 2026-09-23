import type { JsonObject } from "./json";

export interface OpeningHour {
  day: string;
  closed: boolean;
  open: string;
  close: string;
}

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function defaultHours(): OpeningHour[] {
  return DAYS.map((day) => ({
    day,
    closed: day === "Sunday",
    open: "09:00",
    close: "18:00",
  }));
}

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  title: string | null;
  bio: string | null;
  description: string | null;
  profile_image: string | null;
  cover_image: string | null;
  image_shape: string;
  show_cover: boolean;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  maps_url: string | null;
  opening_hours: OpeningHour[];
  template: string | null;
  theme: string;
  layout: string;
  button_style: string;
  status: string;
  analytics_enabled: boolean;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  profile_id: string;
  platform: string;
  url: string;
  label: string | null;
  visible: boolean;
  position: number;
}

export interface CustomLink {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  icon: string | null;
  description: string | null;
  visible: boolean;
  position: number;
}

export interface ServiceItem {
  id: string;
  profile_id: string;
  name: string;
  description: string | null;
  price: string | null;
  image: string | null;
  url: string | null;
  position: number;
}

export type ProductItem = ServiceItem;

export interface PageBlockRow {
  id: string;
  profile_id: string;
  type: string;
  content_json: JsonObject;
  visible: boolean;
  position: number;
}

export interface ProfileBundle {
  profile: Profile;
  blocks: PageBlockRow[];
  socials: SocialLink[];
  links: CustomLink[];
  services: ServiceItem[];
  products: ProductItem[];
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `/api/public/media/${path.split("/").map(encodeURIComponent).join("/")}`;
}
