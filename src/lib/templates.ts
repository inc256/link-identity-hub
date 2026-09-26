import type { BlockContent, BlockType } from "./blocks";

export type ProfileKind =
  | "business"
  | "professional"
  | "creator"
  | "personal"
  | "restaurant"
  | "portfolio"
  | "company"
  | "services"
  | "event"
  | "real-estate"
  | "wellness"
  | "studio"
  | "clinic";

export interface TemplateBlockSeed {
  type: BlockType;
  content?: BlockContent;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  audience: string;
  kind: ProfileKind;
  theme: "light" | "dark" | "warm" | "navy";
  layout: "centered" | "left" | "card" | "minimal";
  buttonStyle: "rectangle" | "rounded" | "pill" | "outline";
  blocks: TemplateBlockSeed[];
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "classic-business",
    name: "Classic Business",
    audience: "Businesses, shops and services",
    kind: "business",
    theme: "light",
    layout: "centered",
    buttonStyle: "rounded",
    blocks: [
      { type: "profile" },
      { type: "text", content: { heading: "About", text: "" } },
      { type: "contact" },
      { type: "services", content: { heading: "What we offer" } },
      { type: "links", content: { heading: "Quick links" } },
      { type: "social" },
      { type: "location" },
      { type: "hours" },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    audience: "Doctors, lawyers, consultants, freelancers",
    kind: "professional",
    theme: "light",
    layout: "left",
    buttonStyle: "rectangle",
    blocks: [
      { type: "profile" },
      { type: "text", content: { heading: "About me", text: "" } },
      { type: "services", content: { heading: "Services" } },
      {
        type: "business_info",
        content: { heading: "Experience", useDescription: false, text: "" },
      },
      { type: "gallery", content: { heading: "Selected work", images: [] } },
      { type: "contact" },
      { type: "social", content: { style: "rows" } },
    ],
  },
  {
    id: "creator",
    name: "Creator",
    audience: "YouTubers, TikTok creators, influencers",
    kind: "creator",
    theme: "dark",
    layout: "centered",
    buttonStyle: "pill",
    blocks: [
      { type: "profile" },
      { type: "video", content: { heading: "Featured video", url: "" } },
      { type: "social", content: { style: "icons" } },
      { type: "links", content: { heading: "Latest links" } },
      {
        type: "contact",
        content: { call: false, whatsapp: true, email: true, website: true, location: false },
      },
    ],
  },
  {
    id: "personal",
    name: "Personal",
    audience: "A minimal personal profile",
    kind: "personal",
    theme: "light",
    layout: "minimal",
    buttonStyle: "rounded",
    blocks: [
      { type: "profile" },
      { type: "social" },
      { type: "links", content: { heading: "Links" } },
      {
        type: "contact",
        content: { call: false, whatsapp: false, email: true, website: true, location: false },
      },
    ],
  },
  {
    id: "restaurant",
    name: "Restaurant",
    audience: "Restaurants, cafés and bars",
    kind: "restaurant",
    theme: "warm",
    layout: "card",
    buttonStyle: "rounded",
    blocks: [
      { type: "profile" },
      {
        type: "contact",
        content: { call: true, whatsapp: true, email: false, website: true, location: true },
      },
      { type: "links", content: { heading: "Menu" } },
      { type: "gallery", content: { heading: "From our kitchen", images: [] } },
      { type: "hours" },
      { type: "location" },
      { type: "social" },
    ],
  },
  {
    id: "services",
    name: "Services",
    audience: "Service providers and trades",
    kind: "services",
    theme: "light",
    layout: "card",
    buttonStyle: "rectangle",
    blocks: [
      { type: "profile" },
      { type: "text", content: { heading: "About", text: "" } },
      { type: "services", content: { heading: "Services and pricing" } },
      { type: "contact" },
      { type: "location" },
      { type: "social" },
    ],
  },
  {
    id: "portfolio",
    name: "Portfolio",
    audience: "Designers, developers, photographers",
    kind: "portfolio",
    theme: "light",
    layout: "left",
    buttonStyle: "outline",
    blocks: [
      { type: "profile" },
      { type: "text", content: { heading: "About", text: "" } },
      { type: "gallery", content: { heading: "Work", images: [] } },
      { type: "services", content: { heading: "What I do" } },
      { type: "social", content: { style: "rows" } },
      { type: "contact_form" },
    ],
  },
  {
    id: "company",
    name: "Company",
    audience: "Corporate and organisation pages",
    kind: "company",
    theme: "navy",
    layout: "card",
    buttonStyle: "rectangle",
    blocks: [
      { type: "profile" },
      {
        type: "business_info",
        content: { heading: "About the company", useDescription: true, text: "" },
      },
      { type: "services", content: { heading: "Our services" } },
      { type: "contact" },
      { type: "location" },
      { type: "hours" },
      { type: "social", content: { style: "rows" } },
    ],
  },
  {
    id: "event-showcase",
    name: "Event Showcase",
    audience: "Events, festivals and launches",
    kind: "event",
    theme: "dark",
    layout: "card",
    buttonStyle: "pill",
    blocks: [
      { type: "profile" },
      { type: "text", content: { heading: "Event story", text: "" } },
      { type: "gallery", content: { heading: "Highlights", images: [] } },
      { type: "links", content: { heading: "Tickets & info" } },
      {
        type: "contact",
        content: { call: true, whatsapp: true, email: true, website: true, location: true },
      },
    ],
  },
  {
    id: "wellness-studio",
    name: "Wellness Studio",
    audience: "Gyms, clinics, salons and treatment spaces",
    kind: "wellness",
    theme: "warm",
    layout: "minimal",
    buttonStyle: "rounded",
    blocks: [
      { type: "profile" },
      { type: "services", content: { heading: "Treatments" } },
      { type: "text", content: { heading: "Our approach", text: "" } },
      {
        type: "contact",
        content: { call: true, whatsapp: true, email: true, website: true, location: true },
      },
      { type: "hours" },
      { type: "social" },
    ],
  },
  {
    id: "real-estate",
    name: "Real Estate",
    audience: "Agents, developers and property listings",
    kind: "real-estate",
    theme: "navy",
    layout: "left",
    buttonStyle: "rounded",
    blocks: [
      { type: "profile" },
      { type: "gallery", content: { heading: "Featured properties", images: [] } },
      { type: "services", content: { heading: "Properties & services" } },
      {
        type: "business_info",
        content: { heading: "Why choose us", useDescription: false, text: "" },
      },
      { type: "contact" },
      { type: "location" },
    ],
  },
  {
    id: "clinic",
    name: "Clinic Care",
    audience: "Clinics, dental and health professionals",
    kind: "clinic",
    theme: "light",
    layout: "centered",
    buttonStyle: "rectangle",
    blocks: [
      { type: "profile" },
      { type: "text", content: { heading: "Who we help", text: "" } },
      { type: "services", content: { heading: "Care services" } },
      {
        type: "contact",
        content: { call: true, whatsapp: false, email: true, website: true, location: true },
      },
      { type: "hours" },
      { type: "social" },
    ],
  },
  {
    id: "studio-showcase",
    name: "Studio Showcase",
    audience: "Photographers, designers and creative agencies",
    kind: "studio",
    theme: "dark",
    layout: "card",
    buttonStyle: "outline",
    blocks: [
      { type: "profile" },
      { type: "gallery", content: { heading: "Selected work", images: [] } },
      { type: "text", content: { heading: "What we create", text: "" } },
      { type: "services", content: { heading: "Creative packages" } },
      { type: "contact" },
      { type: "social", content: { style: "icons" } },
    ],
  },
];

export const TEMPLATE_MAP: Record<string, TemplateDefinition> = Object.fromEntries(
  TEMPLATES.map((template) => [template.id, template]),
);

export const PROFILE_KINDS: { value: ProfileKind; label: string; template: string }[] = [
  { value: "business", label: "Business", template: "classic-business" },
  { value: "professional", label: "Professional profile", template: "professional" },
  { value: "creator", label: "Creator profile", template: "creator" },
  { value: "personal", label: "Personal profile", template: "personal" },
  { value: "restaurant", label: "Restaurant", template: "restaurant" },
  { value: "portfolio", label: "Portfolio", template: "portfolio" },
  { value: "company", label: "Company", template: "company" },
  { value: "event", label: "Event", template: "event-showcase" },
  { value: "wellness", label: "Wellness studio", template: "wellness-studio" },
  { value: "real-estate", label: "Real estate", template: "real-estate" },
  { value: "clinic", label: "Clinic", template: "clinic" },
  { value: "studio", label: "Studio", template: "studio-showcase" },
  { value: "services", label: "Services", template: "services" },
];
