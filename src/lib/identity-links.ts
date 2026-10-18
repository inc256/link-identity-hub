import { supabase } from "@/integrations/supabase/client";
import { BLOCK_MAP } from "./blocks";
import { DEFAULT_QR_OPTIONS } from "./qr";
import { defaultHours } from "./profile-types";
import type {
  CustomLink,
  PageBlockRow,
  Profile,
  ProfileBundle,
  ServiceItem,
  SocialLink,
} from "./profile-types";
import type { Json, JsonObject } from "./json";
import type { TemplateDefinition } from "./templates";

export interface IdentityLink {
  id: string;
  username: string;
  display_name: string;
  profile_data: JsonObject;
  created_at: string;
  updated_at: string;
}

function isJsonObject(value: Json | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: Json | undefined, name: string): string {
  if (typeof value !== "string") throw new Error(`The saved profile is missing ${name}.`);
  return value;
}

function optionalString(value: Json | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function parseIdentityLink(value: Json): IdentityLink {
  if (!isJsonObject(value) || !isJsonObject(value["profile_data"])) {
    throw new Error("Supabase returned an invalid profile record.");
  }
  return {
    id: requiredString(value["id"], "its ID"),
    username: requiredString(value["username"], "its username"),
    display_name: requiredString(value["display_name"], "its display name"),
    profile_data: value["profile_data"],
    created_at: requiredString(value["created_at"], "its creation date"),
    updated_at: requiredString(value["updated_at"], "its update date"),
  };
}

function generateEditToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createIdentityLink(input: {
  username: string;
  displayName: string;
  title: string;
  bio: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  profileImage?: string | null;
  template: TemplateDefinition;
  templateFields?: {
    description: string;
    linkTitle: string;
    linkUrl: string;
    serviceName: string;
    serviceDescription: string;
    servicePrice: string;
    imageUrls: string[];
    videoUrl: string;
    socialPlatform: string;
    socialUrl: string;
    openingHours: ReturnType<typeof defaultHours>;
    contactOptions: {
      call: boolean;
      whatsapp: boolean;
      email: boolean;
      website: boolean;
      location: boolean;
    };
  };
}): Promise<{ link: IdentityLink; editToken: string }> {
  const editToken = generateEditToken();
  const templateFields = input.templateFields;
  const profile = {
    title: input.title || null,
    bio: input.bio || null,
    description: templateFields?.description || null,
    profile_image: input.profileImage || null,
    cover_image: null,
    image_shape: "circle",
    show_cover: false,
    phone: input.phone || null,
    whatsapp: input.whatsapp || null,
    email: input.email || null,
    website: input.website || null,
    address: input.address || null,
    maps_url: input.address
      ? `https://maps.google.com/?q=${encodeURIComponent(input.address)}`
      : null,
    opening_hours: (templateFields?.openingHours ?? defaultHours()).map((hour) => ({
      day: hour.day,
      closed: hour.closed,
      open: hour.open,
      close: hour.close,
    })),
    template: input.template.id,
    theme: input.template.theme,
    layout: input.template.layout,
    button_style: input.template.buttonStyle,
    status: "published",
    analytics_enabled: false,
    onboarded: true,
  };
  const blocks = input.template.blocks.map((seed, position) => {
    const content: JsonObject = {
      ...(BLOCK_MAP[seed.type]?.defaults ?? {}),
      ...(seed.content ?? {}),
    };
    if (templateFields?.description && (seed.type === "text" || seed.type === "business_info")) {
      if (seed.type === "text" || content["useDescription"] !== true) {
        content["text"] = templateFields.description;
      }
    }
    if (seed.type === "contact" && templateFields) {
      Object.assign(content, templateFields.contactOptions);
    }
    if (seed.type === "gallery" && templateFields?.imageUrls.length) {
      content["images"] = templateFields.imageUrls;
    }
    if (seed.type === "video" && templateFields?.videoUrl) {
      content["url"] = templateFields.videoUrl;
    }
    return {
      id: crypto.randomUUID(),
      type: seed.type,
      content_json: content,
      visible: true,
      position,
    };
  });
  const profileData = {
    profile,
    blocks,
    socials:
      templateFields?.socialPlatform && templateFields.socialUrl
        ? [
            {
              id: crypto.randomUUID(),
              platform: templateFields.socialPlatform,
              url: templateFields.socialUrl,
              label: null,
              visible: true,
              position: 0,
            },
          ]
        : [],
    links:
      templateFields?.linkTitle && templateFields.linkUrl
        ? [
            {
              id: crypto.randomUUID(),
              title: templateFields.linkTitle,
              url: templateFields.linkUrl,
              icon: null,
              description: null,
              visible: true,
              position: 0,
            },
          ]
        : [],
    services: templateFields?.serviceName
      ? [
          {
            id: crypto.randomUUID(),
            name: templateFields.serviceName,
            description: templateFields.serviceDescription || null,
            price: templateFields.servicePrice || null,
            image: null,
            url: null,
            position: 0,
          },
        ]
      : [],
    products: [],
    qr: { ...DEFAULT_QR_OPTIONS },
    nfc: { enabled: true },
  };

  const { data, error } = await supabase.rpc("create_identity_link", {
    p_username: input.username,
    p_display_name: input.displayName,
    p_profile_data: profileData,
    p_edit_token: editToken,
  });
  if (error) throw error;
  if (!data) throw new Error("The profile could not be saved.");
  return { link: parseIdentityLink(data), editToken };
}

export async function getIdentityLink(username: string): Promise<IdentityLink | null> {
  const { data, error } = await supabase.rpc("get_identity_link", {
    p_username: username,
  });
  if (error) throw error;
  return data ? parseIdentityLink(data) : null;
}

function profileFromIdentityLink(link: IdentityLink): ProfileBundle {
  const profileData = link.profile_data;
  const rawProfile = profileData["profile"];
  if (!isJsonObject(rawProfile)) throw new Error("The saved profile details are invalid.");
  const hours = rawProfile["opening_hours"];

  const profile: Profile = {
    id: link.id,
    user_id: "",
    username: link.username,
    display_name: link.display_name,
    title: optionalString(rawProfile["title"]),
    bio: optionalString(rawProfile["bio"]),
    description: optionalString(rawProfile["description"]),
    profile_image: optionalString(rawProfile["profile_image"]),
    cover_image: optionalString(rawProfile["cover_image"]),
    image_shape: requiredString(rawProfile["image_shape"], "its image style"),
    show_cover: rawProfile["show_cover"] === true,
    phone: optionalString(rawProfile["phone"]),
    whatsapp: optionalString(rawProfile["whatsapp"]),
    email: optionalString(rawProfile["email"]),
    website: optionalString(rawProfile["website"]),
    address: optionalString(rawProfile["address"]),
    maps_url: optionalString(rawProfile["maps_url"]),
    opening_hours: Array.isArray(hours)
      ? hours.filter(isJsonObject).map((hour) => ({
          day: typeof hour["day"] === "string" ? hour["day"] : "",
          closed: hour["closed"] === true,
          open: typeof hour["open"] === "string" ? hour["open"] : "09:00",
          close: typeof hour["close"] === "string" ? hour["close"] : "18:00",
        }))
      : defaultHours(),
    template: optionalString(rawProfile["template"]),
    theme: requiredString(rawProfile["theme"], "its theme"),
    layout: requiredString(rawProfile["layout"], "its layout"),
    button_style: requiredString(rawProfile["button_style"], "its button style"),
    status: "published",
    analytics_enabled: false,
    onboarded: true,
    created_at: link.created_at,
    updated_at: link.updated_at,
  };

  const rows = (key: string): JsonObject[] => {
    const value = profileData[key];
    return Array.isArray(value) ? value.filter(isJsonObject) : [];
  };
  const strings = (record: JsonObject, key: string): string => {
    const value = record[key];
    return typeof value === "string" ? value : "";
  };
  const nullableStrings = (record: JsonObject, key: string): string | null => {
    const value = record[key];
    return typeof value === "string" ? value : null;
  };
  const bool = (record: JsonObject, key: string, fallback = true): boolean => {
    const value = record[key];
    return typeof value === "boolean" ? value : fallback;
  };
  const number = (record: JsonObject, key: string): number => {
    const value = record[key];
    return typeof value === "number" ? value : 0;
  };

  const blocks: PageBlockRow[] = rows("blocks").map((row) => ({
    id: strings(row, "id"),
    profile_id: link.id,
    type: strings(row, "type"),
    content_json: isJsonObject(row["content_json"]) ? row["content_json"] : {},
    visible: bool(row, "visible"),
    position: number(row, "position"),
  }));
  const socials: SocialLink[] = rows("socials").map((row) => ({
    id: strings(row, "id"),
    profile_id: link.id,
    platform: strings(row, "platform"),
    url: strings(row, "url"),
    label: nullableStrings(row, "label"),
    visible: bool(row, "visible"),
    position: number(row, "position"),
  }));
  const links: CustomLink[] = rows("links").map((row) => ({
    id: strings(row, "id"),
    profile_id: link.id,
    title: strings(row, "title"),
    url: strings(row, "url"),
    icon: nullableStrings(row, "icon"),
    description: nullableStrings(row, "description"),
    visible: bool(row, "visible"),
    position: number(row, "position"),
  }));
  const items = (key: string): ServiceItem[] =>
    rows(key).map((row) => ({
      id: strings(row, "id"),
      profile_id: link.id,
      name: strings(row, "name"),
      description: nullableStrings(row, "description"),
      price: nullableStrings(row, "price"),
      image: nullableStrings(row, "image"),
      url: nullableStrings(row, "url"),
      position: number(row, "position"),
    }));

  return {
    profile,
    blocks,
    socials,
    links,
    services: items("services"),
    products: items("products"),
  };
}

export async function getPublicIdentityProfile(username: string): Promise<ProfileBundle | null> {
  const link = await getIdentityLink(username);
  return link ? profileFromIdentityLink(link) : null;
}
