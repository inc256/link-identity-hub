import { useMemo, useState } from "react";
import {
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ExternalLink,
  FileDown,
} from "lucide-react";
import { socialIcon, socialLabel } from "@/lib/socials";
import type { JsonObject, JsonValue } from "@/lib/json";
import type { ProfileBundle } from "@/lib/profile-types";
import { mediaUrl } from "@/lib/profile-types";
import { mailHref, safeUrl, telHref, whatsappHref, youtubeEmbed } from "@/lib/validation";

export type EventType =
  | "page_view"
  | "qr_scan"
  | "link_click"
  | "contact_click"
  | "website_click"
  | "social_click";

interface ViewProps {
  bundle: ProfileBundle;
  onEvent?: (type: EventType, label?: string) => void;
  /** Editor preview hides outbound navigation. */
  preview?: boolean;
}

function str(content: JsonObject, key: string, fallback = ""): string {
  const value: JsonValue | undefined = content[key];
  return typeof value === "string" ? value : fallback;
}

function bool(content: JsonObject, key: string, fallback = true): boolean {
  const value: JsonValue | undefined = content[key];
  return typeof value === "boolean" ? value : fallback;
}

function list(content: JsonObject, key: string): string[] {
  const value = content[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function buttonClasses(style: string): string {
  const base =
    "inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90";
  if (style === "pill") return `${base} rounded-full`;
  if (style === "rectangle") return `${base} rounded-none`;
  if (style === "outline") return `${base} rounded-md border`;
  return `${base} rounded-md`;
}

function SectionHeading({ children }: { children: string }) {
  if (!children) return null;
  return (
    <h2
      className="mb-3 text-xs font-semibold uppercase tracking-[0.14em]"
      style={{ color: "var(--page-muted)" }}
    >
      {children}
    </h2>
  );
}

export function ProfileView({ bundle, onEvent, preview = false }: ViewProps) {
  const { profile, blocks, socials, links, services, products } = bundle;
  const theme = ["light", "dark", "warm", "navy"].includes(profile.theme) ? profile.theme : "light";
  const align = profile.layout === "left" ? "text-left" : "text-center";
  const btn = buttonClasses(profile.button_style);

  const visibleBlocks = useMemo(
    () => blocks.filter((block) => block.visible).sort((a, b) => a.position - b.position),
    [blocks],
  );

  const track = (type: EventType, label?: string) => {
    if (preview) return;
    onEvent?.(type, label);
  };

  const linkProps = (href: string) =>
    preview
      ? { href: undefined, onClick: (event: React.MouseEvent) => event.preventDefault() }
      : { href, target: "_blank", rel: "noopener noreferrer nofollow" };

  const solidButtonStyle = {
    background: profile.button_style === "outline" ? "transparent" : "var(--page-btn)",
    color: profile.button_style === "outline" ? "var(--page-fg)" : "var(--page-btn-fg)",
    borderColor: "var(--page-border)",
  };

  const renderBlock = (type: string, content: JsonObject, key: string) => {
    switch (type) {
      case "profile": {
        const image = mediaUrl(profile.profile_image);
        const cover = profile.show_cover ? mediaUrl(profile.cover_image) : null;
        const shape = profile.image_shape === "square" ? "rounded-lg" : "rounded-full";
        return (
          <div key={key}>
            {cover ? (
              <img
                src={cover}
                alt=""
                className="mb-4 h-32 w-full rounded-lg object-cover sm:h-40"
                loading="eager"
              />
            ) : null}
            <div className={align}>
              {bool(content, "showImage") && image ? (
                <img
                  src={image}
                  alt={profile.display_name}
                  width={96}
                  height={96}
                  className={`mb-4 h-24 w-24 object-cover ${shape} ${
                    profile.layout === "left" ? "" : "mx-auto"
                  }`}
                  loading="eager"
                />
              ) : null}
              <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
                {profile.display_name || profile.username}
              </h1>
              {bool(content, "showTitle") && profile.title ? (
                <p className="mt-1 text-sm font-medium" style={{ color: "var(--page-muted)" }}>
                  {profile.title}
                </p>
              ) : null}
              {bool(content, "showBio") && profile.bio ? (
                <p
                  className="mx-auto mt-3 max-w-prose text-sm leading-relaxed"
                  style={{ color: "var(--page-muted)" }}
                >
                  {profile.bio}
                </p>
              ) : null}
            </div>
          </div>
        );
      }

      case "heading": {
        const size = str(content, "size", "md");
        const classes =
          size === "lg" ? "text-xl font-semibold" : size === "sm" ? "text-sm font-semibold" : "text-lg font-semibold";
        return (
          <h2 key={key} className={`${classes} ${align}`}>
            {str(content, "text")}
          </h2>
        );
      }

      case "text":
      case "business_info": {
        const body =
          type === "business_info" && bool(content, "useDescription", true)
            ? profile.description ?? ""
            : str(content, "text");
        if (!body && !str(content, "heading")) return null;
        return (
          <section key={key}>
            <SectionHeading>{str(content, "heading")}</SectionHeading>
            {body ? (
              <div className="space-y-3 text-sm leading-relaxed">
                {body.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : null}
          </section>
        );
      }

      case "image": {
        const url = mediaUrl(str(content, "url")) ?? safeUrl(str(content, "url"));
        if (!url) return null;
        return (
          <figure key={key}>
            <img src={url} alt={str(content, "alt")} className="w-full rounded-lg object-cover" loading="lazy" />
            {str(content, "caption") ? (
              <figcaption className="mt-2 text-xs" style={{ color: "var(--page-muted)" }}>
                {str(content, "caption")}
              </figcaption>
            ) : null}
          </figure>
        );
      }

      case "gallery": {
        const images = list(content, "images");
        if (!images.length) return null;
        return (
          <section key={key}>
            <SectionHeading>{str(content, "heading")}</SectionHeading>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {images.map((path, index) => {
                const url = mediaUrl(path) ?? safeUrl(path);
                if (!url) return null;
                return (
                  <img
                    key={`${path}-${index}`}
                    src={url}
                    alt=""
                    className="aspect-square w-full rounded-md object-cover"
                    loading="lazy"
                  />
                );
              })}
            </div>
          </section>
        );
      }

      case "video": {
        const embed = youtubeEmbed(str(content, "url"));
        if (!embed) return null;
        return (
          <section key={key}>
            <SectionHeading>{str(content, "heading")}</SectionHeading>
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={embed}
                title={str(content, "heading", "Video")}
                className="h-full w-full"
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        );
      }

      case "divider":
        return <hr key={key} style={{ borderColor: "var(--page-border)" }} />;

      case "spacer": {
        const size = str(content, "size", "md");
        const height = size === "lg" ? "h-10" : size === "sm" ? "h-2" : "h-5";
        return <div key={key} className={height} aria-hidden="true" />;
      }

      case "contact": {
        const items: { label: string; href: string; icon: typeof Phone; event: EventType }[] = [];
        const tel = telHref(profile.phone);
        const wa = whatsappHref(profile.whatsapp);
        const mail = mailHref(profile.email);
        const web = safeUrl(profile.website);
        const maps = safeUrl(profile.maps_url);
        if (bool(content, "call") && tel)
          items.push({ label: "Call", href: tel, icon: Phone, event: "contact_click" });
        if (bool(content, "whatsapp") && wa)
          items.push({ label: "WhatsApp", href: wa, icon: MessageCircle, event: "contact_click" });
        if (bool(content, "email") && mail)
          items.push({ label: "Email", href: mail, icon: Mail, event: "contact_click" });
        if (bool(content, "website") && web)
          items.push({ label: "Website", href: web, icon: Globe, event: "website_click" });
        if (bool(content, "location") && maps)
          items.push({ label: "Directions", href: maps, icon: MapPin, event: "contact_click" });
        if (!items.length) return null;
        return (
          <section key={key} className="grid gap-2 sm:grid-cols-2">
            {items.map((item) => (
              <a
                key={item.label}
                {...linkProps(item.href)}
                onClick={() => track(item.event, item.label)}
                className={btn}
                style={solidButtonStyle}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </a>
            ))}
          </section>
        );
      }

      case "social": {
        const visible = socials.filter((social) => social.visible);
        if (!visible.length) return null;
        const rows = str(content, "style", "icons") === "rows";
        return (
          <section key={key}>
            <SectionHeading>{str(content, "heading")}</SectionHeading>
            {rows ? (
              <div className="grid gap-2">
                {visible.map((social) => {
                  const href = safeUrl(social.url);
                  if (!href) return null;
                  const Icon = socialIcon(social.platform);
                  return (
                    <a
                      key={social.id}
                      {...linkProps(href)}
                      onClick={() => track("social_click", social.platform)}
                      className={`${btn} justify-start`}
                      style={{ ...solidButtonStyle, background: "var(--page-surface)", color: "var(--page-fg)" }}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {social.label || socialLabel(social.platform)}
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className={`flex flex-wrap gap-2 ${profile.layout === "left" ? "" : "justify-center"}`}>
                {visible.map((social) => {
                  const href = safeUrl(social.url);
                  if (!href) return null;
                  const Icon = socialIcon(social.platform);
                  return (
                    <a
                      key={social.id}
                      {...linkProps(href)}
                      onClick={() => track("social_click", social.platform)}
                      aria-label={social.label || socialLabel(social.platform)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border transition-opacity hover:opacity-80"
                      style={{ borderColor: "var(--page-border)", background: "var(--page-surface)" }}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            )}
          </section>
        );
      }

      case "links": {
        const visible = links.filter((link) => link.visible);
        if (!visible.length) return null;
        return (
          <section key={key}>
            <SectionHeading>{str(content, "heading")}</SectionHeading>
            <div className="grid gap-2">
              {visible.map((link) => {
                const href = safeUrl(link.url);
                if (!href) return null;
                return (
                  <a
                    key={link.id}
                    {...linkProps(href)}
                    onClick={() => track("link_click", link.title)}
                    className={`${btn} flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between`}
                    style={{ ...solidButtonStyle, background: "var(--page-surface)", color: "var(--page-fg)" }}
                  >
                    <span className="font-medium">{link.title}</span>
                    {link.description ? (
                      <span className="text-xs" style={{ color: "var(--page-muted)" }}>
                        {link.description}
                      </span>
                    ) : (
                      <ExternalLink className="hidden h-4 w-4 sm:block" aria-hidden="true" />
                    )}
                  </a>
                );
              })}
            </div>
          </section>
        );
      }

      case "services":
      case "products": {
        const items = type === "services" ? services : products;
        if (!items.length) return null;
        return (
          <section key={key}>
            <SectionHeading>{str(content, "heading")}</SectionHeading>
            <div className={type === "products" ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"}>
              {items.map((item) => {
                const image = mediaUrl(item.image);
                const href = safeUrl(item.url);
                const body = (
                  <>
                    {image ? (
                      <img
                        src={image}
                        alt=""
                        className="mb-2 aspect-[4/3] w-full rounded-md object-cover"
                        loading="lazy"
                      />
                    ) : null}
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-sm font-semibold">{item.name}</h3>
                      {item.price ? <span className="text-sm font-medium">{item.price}</span> : null}
                    </div>
                    {item.description ? (
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--page-muted)" }}>
                        {item.description}
                      </p>
                    ) : null}
                  </>
                );
                return href ? (
                  <a
                    key={item.id}
                    {...linkProps(href)}
                    onClick={() => track("link_click", item.name)}
                    className="block rounded-lg border p-4 text-left transition-opacity hover:opacity-90"
                    style={{ borderColor: "var(--page-border)", background: "var(--page-surface)" }}
                  >
                    {body}
                  </a>
                ) : (
                  <div
                    key={item.id}
                    className="rounded-lg border p-4"
                    style={{ borderColor: "var(--page-border)", background: "var(--page-surface)" }}
                  >
                    {body}
                  </div>
                );
              })}
            </div>
          </section>
        );
      }

      case "hours": {
        const hours = profile.opening_hours ?? [];
        if (!hours.length) return null;
        return (
          <section key={key}>
            <SectionHeading>{str(content, "heading")}</SectionHeading>
            <ul
              className="divide-y rounded-lg border text-sm"
              style={{ borderColor: "var(--page-border)", background: "var(--page-surface)" }}
            >
              {hours.map((hour) => (
                <li
                  key={hour.day}
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderColor: "var(--page-border)" }}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                    {hour.day}
                  </span>
                  <span style={{ color: "var(--page-muted)" }}>
                    {hour.closed ? "Closed" : `${hour.open} – ${hour.close}`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      }

      case "location": {
        if (!profile.address && !profile.maps_url) return null;
        const maps = safeUrl(profile.maps_url);
        return (
          <section key={key}>
            <SectionHeading>{str(content, "heading")}</SectionHeading>
            <div
              className="rounded-lg border p-4 text-sm"
              style={{ borderColor: "var(--page-border)", background: "var(--page-surface)" }}
            >
              {profile.address ? <p className="whitespace-pre-line">{profile.address}</p> : null}
              {maps ? (
                <a
                  {...linkProps(maps)}
                  onClick={() => track("contact_click", "Directions")}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium underline"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Open in maps
                </a>
              ) : null}
            </div>
          </section>
        );
      }

      case "file": {
        const href = mediaUrl(str(content, "url")) ?? safeUrl(str(content, "url"));
        if (!href) return null;
        return (
          <section key={key}>
            <SectionHeading>{str(content, "heading")}</SectionHeading>
            <a
              {...linkProps(href)}
              onClick={() => track("link_click", str(content, "label", "File"))}
              className={btn}
              style={solidButtonStyle}
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              {str(content, "label", "Download file")}
            </a>
          </section>
        );
      }

      case "contact_form":
        return (
          <ContactFormBlock
            key={key}
            heading={str(content, "heading", "Send a message")}
            buttonLabel={str(content, "buttonLabel", "Send message")}
            email={profile.email}
            name={profile.display_name}
            buttonClass={btn}
            buttonStyle={solidButtonStyle}
            preview={preview}
            onSend={() => track("contact_click", "Message")}
          />
        );

      default:
        return null;
    }
  };

  const wrapperWidth = profile.layout === "minimal" ? "max-w-md" : "max-w-xl";
  const card = profile.layout === "card";

  return (
    <div
      className={`page-theme-${theme} min-h-screen w-full`}
      style={{ background: "var(--page-bg)", color: "var(--page-fg)" }}
    >
      <div className={`mx-auto w-full ${wrapperWidth} px-4 py-10 sm:py-14`}>
        <div
          className={
            card
              ? "rounded-xl border p-5 sm:p-7"
              : ""
          }
          style={card ? { borderColor: "var(--page-border)", background: "var(--page-surface)" } : undefined}
        >
          <div className="space-y-7">
            {visibleBlocks.map((block) => renderBlock(block.type, block.content_json, block.id))}
          </div>
        </div>

        <footer className="mt-10 text-center">
          <a
            href={preview ? undefined : "/"}
            className="text-[11px] tracking-wide opacity-60 transition-opacity hover:opacity-100"
            style={{ color: "var(--page-muted)" }}
          >
            Powered by Cytic Link
          </a>
        </footer>
      </div>
    </div>
  );
}

function ContactFormBlock({
  heading,
  buttonLabel,
  email,
  name,
  buttonClass,
  buttonStyle,
  preview,
  onSend,
}: {
  heading: string;
  buttonLabel: string;
  email: string | null;
  name: string;
  buttonClass: string;
  buttonStyle: React.CSSProperties;
  preview: boolean;
  onSend: () => void;
}) {
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const mail = mailHref(email);

  if (!mail) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (preview) return;
    onSend();
    const subject = encodeURIComponent(`Message for ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${from}`);
    window.location.href = `${mail}?subject=${subject}&body=${body}`;
  };

  return (
    <section>
      <SectionHeading>{heading}</SectionHeading>
      <form onSubmit={submit} className="space-y-2">
        <input
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          placeholder="Your name"
          maxLength={80}
          required
          className="w-full rounded-md border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--page-border)", background: "var(--page-surface)", color: "var(--page-fg)" }}
        />
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Your message"
          rows={4}
          maxLength={1000}
          required
          className="w-full rounded-md border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--page-border)", background: "var(--page-surface)", color: "var(--page-fg)" }}
        />
        <button type="submit" className={buttonClass} style={buttonStyle}>
          {buttonLabel}
        </button>
        <p className="text-[11px]" style={{ color: "var(--page-muted)" }}>
          This opens your own email app — nothing is stored here.
        </p>
      </form>
    </section>
  );
}
