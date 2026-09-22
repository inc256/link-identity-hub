import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { ProfileBundle } from "./profile-types";

function publicClient() {
  return createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const usernameSchema = z.object({ username: z.string().min(1).max(60) });
const idSchema = z.object({ profileId: z.string().uuid() });
const eventSchema = z.object({
  profileId: z.string().uuid(),
  eventType: z.enum([
    "page_view",
    "qr_scan",
    "link_click",
    "contact_click",
    "website_click",
    "social_click",
  ]),
  label: z.string().max(80).optional(),
});

/** Public read of a published profile — no session required. */
export const getPublicProfile = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => usernameSchema.parse(data))
  .handler(async ({ data }): Promise<ProfileBundle | null> => {
    const supabase = publicClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", data.username.toLowerCase())
      .eq("status", "published")
      .maybeSingle();

    if (!profile) return null;

    const [blocks, socials, links, services, products] = await Promise.all([
      supabase.from("page_blocks").select("*").eq("profile_id", profile.id).order("position"),
      supabase.from("social_links").select("*").eq("profile_id", profile.id).order("position"),
      supabase.from("custom_links").select("*").eq("profile_id", profile.id).order("position"),
      supabase.from("services").select("*").eq("profile_id", profile.id).order("position"),
      supabase.from("products").select("*").eq("profile_id", profile.id).order("position"),
    ]);

    return {
      profile: profile as unknown as ProfileBundle["profile"],
      blocks: (blocks.data ?? []) as unknown as ProfileBundle["blocks"],
      socials: (socials.data ?? []) as unknown as ProfileBundle["socials"],
      links: (links.data ?? []) as unknown as ProfileBundle["links"],
      services: (services.data ?? []) as unknown as ProfileBundle["services"],
      products: (products.data ?? []) as unknown as ProfileBundle["products"],
    };
  });

/** Resolve a profile id to its username for QR redirects. */
export const resolveProfileUsername = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("username,status,analytics_enabled")
      .eq("id", data.profileId)
      .maybeSingle();
    if (!profile) return null;
    return profile as { username: string; status: string; analytics_enabled: boolean };
  });

/** Anonymous, privacy-conscious event recording. No device or personal data stored. */
export const recordEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => eventSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    await supabase.from("analytics_events").insert({
      profile_id: data.profileId,
      event_type: data.eventType,
      label: data.label ?? null,
    });
    return { ok: true };
  });
