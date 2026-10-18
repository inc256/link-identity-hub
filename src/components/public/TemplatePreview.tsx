import { BLOCK_MAP } from "@/lib/blocks";
import type { OpeningHour, ProfileBundle } from "@/lib/profile-types";
import type { TemplateDefinition } from "@/lib/templates";
import { ProfileView } from "./ProfileView";

export interface TemplatePreviewValues {
  displayName: string;
  title: string;
  bio: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  linkTitle: string;
  linkUrl: string;
  serviceName: string;
  serviceDescription: string;
  servicePrice: string;
  profileImageUrl: string;
  imageUrls: string[];
  videoUrl: string;
  socialPlatform: string;
  socialUrl: string;
  hours: OpeningHour[];
  showHours: boolean;
}

export function TemplatePreview({
  template,
  values,
  contactFields,
}: {
  template: TemplateDefinition;
  values: TemplatePreviewValues;
  contactFields?: {
    phone: boolean;
    whatsapp: boolean;
    email: boolean;
    website: boolean;
    location: boolean;
  };
}) {
  const profileId = "template-preview";
  const displayName = values.displayName || template.name;
  const blocks = template.blocks.map((seed, position) => {
    const content = {
      ...(BLOCK_MAP[seed.type]?.defaults ?? {}),
      ...(seed.content ?? {}),
    };

    if (seed.type === "text" || seed.type === "business_info") {
      if ("text" in content) {
        content["text"] =
          values.description || `A thoughtful ${template.audience.toLowerCase()} experience.`;
      }
    }
    if (seed.type === "gallery") {
      content["images"] = values.imageUrls;
    }
    if (seed.type === "video") {
      content["url"] = values.videoUrl;
    }

    return {
      id: `${profileId}-${position}`,
      profile_id: profileId,
      type: seed.type,
      content_json: content,
      visible: true,
      position,
    };
  });

  const bundle: ProfileBundle = {
    profile: {
      id: profileId,
      user_id: "",
      username: "preview",
      display_name: displayName,
      title: values.title || "A great first impression",
      bio: values.bio || `A preview of your ${template.name.toLowerCase()} page.`,
      description: values.description || null,
      profile_image: values.profileImageUrl || null,
      cover_image: null,
      image_shape: "circle",
      show_cover: false,
      phone: contactFields?.phone === false ? null : values.phone || "+1 555 010 0123",
      whatsapp: contactFields?.whatsapp === false ? null : values.whatsapp || "+1 555 010 0123",
      email: contactFields?.email === false ? null : values.email || "hello@example.com",
      website: contactFields?.website === false ? null : values.website || "https://example.com",
      address:
        contactFields?.location === false ? null : values.address || "123 Market Street, Your City",
      maps_url:
        contactFields?.location === false ? null : "https://maps.google.com/?q=123+Market+Street",
      opening_hours: values.showHours ? values.hours : [],
      template: template.id,
      theme: template.theme,
      layout: template.layout,
      button_style: template.buttonStyle,
      status: "published",
      analytics_enabled: false,
      onboarded: true,
      created_at: "",
      updated_at: "",
    },
    blocks,
    socials: template.blocks.some((block) => block.type === "social")
      ? [
          {
            id: `${profileId}-social`,
            profile_id: profileId,
            platform: values.socialPlatform || "instagram",
            url: values.socialUrl || "https://instagram.com",
            label: null,
            visible: true,
            position: 0,
          },
        ]
      : [],
    links: template.blocks.some((block) => block.type === "links")
      ? [
          {
            id: `${profileId}-link`,
            profile_id: profileId,
            title: values.linkTitle || "Explore more",
            url: values.linkUrl || "https://example.com",
            icon: null,
            description: null,
            visible: true,
            position: 0,
          },
        ]
      : [],
    services: template.blocks.some((block) => block.type === "services")
      ? [
          {
            id: `${profileId}-service`,
            profile_id: profileId,
            name: values.serviceName || "Featured service",
            description: values.serviceDescription || "A personal, thoughtful experience.",
            price: values.servicePrice || null,
            image: null,
            url: null,
            position: 0,
          },
        ]
      : [],
    products: [],
  };

  return <ProfileView bundle={bundle} preview />;
}

const themeClass = {
  light: "page-theme-light",
  dark: "page-theme-dark",
  warm: "page-theme-warm",
  navy: "page-theme-navy",
} as const;

export function TemplateThumbnail({ template }: { template: TemplateDefinition }) {
  const contentBlocks = template.blocks.filter((block) =>
    ["text", "business_info", "services", "gallery", "links", "video", "contact"].includes(
      block.type,
    ),
  );

  return (
    <div
      className={`${themeClass[template.theme]} h-28 overflow-hidden rounded-md border p-3`}
      style={{
        background: "var(--page-bg)",
        borderColor: "var(--page-border)",
        color: "var(--page-fg)",
      }}
      aria-hidden="true"
    >
      <div
        className={`flex items-center gap-2 ${template.layout === "centered" || template.layout === "minimal" ? "flex-col text-center" : ""}`}
      >
        <span
          className={`h-7 w-7 shrink-0 rounded-full ${template.layout === "left" ? "" : "mx-auto"}`}
          style={{ background: "var(--page-border)" }}
        />
        <div
          className={
            template.layout === "centered" || template.layout === "minimal" ? "" : "flex-1"
          }
        >
          <div
            className="h-2 w-20 rounded"
            style={{ background: "var(--page-fg)", opacity: 0.8 }}
          />
          <div
            className="mt-1.5 h-1.5 w-28 rounded"
            style={{ background: "var(--page-muted)", opacity: 0.55 }}
          />
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {contentBlocks.slice(0, 4).map((block, index) =>
          block.type === "gallery" ? (
            <div
              key={`${block.type}-${index}`}
              className="h-5 rounded"
              style={{ background: "var(--page-border)" }}
            />
          ) : (
            <div
              key={`${block.type}-${index}`}
              className={`h-5 ${template.buttonStyle === "pill" ? "rounded-full" : template.buttonStyle === "rectangle" ? "rounded-none" : "rounded"}`}
              style={{
                border:
                  template.buttonStyle === "outline" ? "1px solid var(--page-border)" : "none",
                background: template.buttonStyle === "outline" ? "transparent" : "var(--page-btn)",
                opacity: 0.82,
              }}
            />
          ),
        )}
      </div>
    </div>
  );
}
