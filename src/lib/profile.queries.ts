import { supabase } from "@/integrations/supabase/client";
import type { BlockContent } from "./blocks";
import { BLOCK_MAP } from "./blocks";
import { defaultHours } from "./profile-types";
import type {
  CustomLink,
  PageBlockRow,
  Profile,
  ProfileBundle,
  ServiceItem,
  SocialLink,
} from "./profile-types";
import { TEMPLATE_MAP, type TemplateDefinition } from "./templates";

export type OwnerBundle = ProfileBundle;

function asProfile(row: unknown): Profile {
  const profile = row as Profile & { opening_hours: unknown };
  return {
    ...profile,
    opening_hours: Array.isArray(profile.opening_hours)
      ? (profile.opening_hours as Profile["opening_hours"])
      : defaultHours(),
  };
}

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? asProfile(data) : null;
}

export async function fetchBundle(profileId: string): Promise<Omit<OwnerBundle, "profile">> {
  const [blocks, socials, links, services, products] = await Promise.all([
    supabase.from("page_blocks").select("*").eq("profile_id", profileId).order("position"),
    supabase.from("social_links").select("*").eq("profile_id", profileId).order("position"),
    supabase.from("custom_links").select("*").eq("profile_id", profileId).order("position"),
    supabase.from("services").select("*").eq("profile_id", profileId).order("position"),
    supabase.from("products").select("*").eq("profile_id", profileId).order("position"),
  ]);
  return {
    blocks: (blocks.data ?? []) as unknown as PageBlockRow[],
    socials: (socials.data ?? []) as unknown as SocialLink[],
    links: (links.data ?? []) as unknown as CustomLink[],
    services: (services.data ?? []) as unknown as ServiceItem[],
    products: (products.data ?? []) as unknown as ServiceItem[],
  };
}

export async function fetchMyBundle(userId: string): Promise<OwnerBundle | null> {
  const profile = await fetchMyProfile(userId);
  if (!profile) return null;
  const rest = await fetchBundle(profile.id);
  return { profile, ...rest };
}

export async function isUsernameAvailable(username: string, ignoreProfileId?: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .limit(1);
  if (error) throw error;
  const rows = (data ?? []) as { id: string }[];
  if (!rows.length) return true;
  return Boolean(ignoreProfileId) && rows[0]?.id === ignoreProfileId;
}

export async function createProfile(input: {
  userId: string;
  username: string;
  displayName: string;
  template: TemplateDefinition;
  title?: string;
  email?: string | null;
}): Promise<Profile> {
  const { template } = input;
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id: input.userId,
      username: input.username,
      display_name: input.displayName,
      title: input.title ?? null,
      email: input.email ?? null,
      template: template.id,
      theme: template.theme,
      layout: template.layout,
      button_style: template.buttonStyle,
      opening_hours: defaultHours(),
      status: "draft",
    })
    .select("*")
    .single();
  if (error) throw error;
  const profile = asProfile(data);
  await applyTemplateBlocks(profile.id, template);
  return profile;
}

/** Templates only seed editable blocks — nothing is locked afterwards. */
export async function applyTemplateBlocks(profileId: string, template: TemplateDefinition) {
  await supabase.from("page_blocks").delete().eq("profile_id", profileId);
  const rows = template.blocks.map((seed, index) => ({
    profile_id: profileId,
    type: seed.type,
    content_json: { ...(BLOCK_MAP[seed.type]?.defaults ?? {}), ...(seed.content ?? {}) },
    visible: true,
    position: index,
  }));
  const { error } = await supabase.from("page_blocks").insert(rows);
  if (error) throw error;
}

export async function switchTemplate(profile: Profile, templateId: string) {
  const template = TEMPLATE_MAP[templateId];
  if (!template) throw new Error("Unknown template");
  await applyTemplateBlocks(profile.id, template);
  const { error } = await supabase
    .from("profiles")
    .update({
      template: template.id,
      theme: template.theme,
      layout: template.layout,
      button_style: template.buttonStyle,
    })
    .eq("id", profile.id);
  if (error) throw error;
}

export async function updateProfile(profileId: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", profileId);
  if (error) throw error;
}

export async function addBlock(profileId: string, type: string, position: number) {
  const { data, error } = await supabase
    .from("page_blocks")
    .insert({
      profile_id: profileId,
      type,
      content_json: BLOCK_MAP[type]?.defaults ?? {},
      visible: true,
      position,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as PageBlockRow;
}

export async function updateBlock(
  blockId: string,
  patch: { content_json?: BlockContent; visible?: boolean; position?: number },
) {
  const { error } = await supabase.from("page_blocks").update(patch).eq("id", blockId);
  if (error) throw error;
}

export async function deleteBlock(blockId: string) {
  const { error } = await supabase.from("page_blocks").delete().eq("id", blockId);
  if (error) throw error;
}

export async function duplicateBlock(block: PageBlockRow, position: number) {
  const { data, error } = await supabase
    .from("page_blocks")
    .insert({
      profile_id: block.profile_id,
      type: block.type,
      content_json: block.content_json,
      visible: block.visible,
      position,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as PageBlockRow;
}

export async function reorderBlocks(blocks: PageBlockRow[]) {
  await Promise.all(
    blocks.map((block, index) =>
      supabase.from("page_blocks").update({ position: index }).eq("id", block.id),
    ),
  );
}

type Table = "social_links" | "custom_links" | "services" | "products";

export async function insertRow<T>(table: Table, row: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.from(table).insert(row).select("*").single();
  if (error) throw error;
  return data as unknown as T;
}

export async function updateRow(table: Table, id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from(table).update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteRow(table: Table, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

export async function reorderRows(table: Table, ids: string[]) {
  await Promise.all(
    ids.map((id, index) => supabase.from(table).update({ position: index }).eq("id", id)),
  );
}

/** Uploads land in the user's own folder; only paths are stored so storage stays swappable. */
export async function uploadMedia(userId: string, file: File): Promise<string> {
  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("profile-media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}

export interface AnalyticsEvent {
  event_type: string;
  label: string | null;
  created_at: string;
}

export async function fetchAnalytics(profileId: string, sinceDays: number) {
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("analytics_events")
    .select("event_type,label,created_at")
    .eq("profile_id", profileId)
    .gte("created_at", since)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as AnalyticsEvent[];
}
