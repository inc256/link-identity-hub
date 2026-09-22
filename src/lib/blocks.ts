import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  CalendarClock,
  Contact,
  FileDown,
  Heading,
  Image as ImageIcon,
  Images,
  Info,
  Link2,
  List,
  MapPin,
  Minus,
  Package,
  Phone,
  Share2,
  Sparkle,
  SquareStack,
  Type,
  UserSquare2,
  Video,
} from "lucide-react";

export type BlockType =
  | "profile"
  | "heading"
  | "text"
  | "contact"
  | "social"
  | "links"
  | "services"
  | "products"
  | "hours"
  | "location"
  | "business_info"
  | "image"
  | "gallery"
  | "video"
  | "divider"
  | "spacer"
  | "contact_form"
  | "file";

export type BlockContent = Record<string, unknown>;

export interface PageBlock {
  id: string;
  profile_id: string;
  type: string;
  content_json: BlockContent;
  visible: boolean;
  position: number;
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  description: string;
  group: "Profile" | "Contact" | "Social" | "Content" | "Business" | "Links" | "Media" | "Advanced";
  icon: LucideIcon;
  defaults: BlockContent;
  duplicable: boolean;
  /** Only one instance makes sense on a page */
  single?: boolean;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: "profile",
    label: "Profile header",
    description: "Photo, name, professional title and short bio.",
    group: "Profile",
    icon: UserSquare2,
    defaults: { showImage: true, showTitle: true, showBio: true },
    duplicable: false,
    single: true,
  },
  {
    type: "contact",
    label: "Contact buttons",
    description: "Call, WhatsApp, email, website and location buttons.",
    group: "Contact",
    icon: Phone,
    defaults: { call: true, whatsapp: true, email: true, website: true, location: true },
    duplicable: false,
  },
  {
    type: "social",
    label: "Social links",
    description: "Icons or rows linking to your social profiles.",
    group: "Social",
    icon: Share2,
    defaults: { style: "icons", heading: "" },
    duplicable: false,
  },
  {
    type: "heading",
    label: "Heading",
    description: "Section title.",
    group: "Content",
    icon: Heading,
    defaults: { text: "Section title", size: "md" },
    duplicable: true,
  },
  {
    type: "text",
    label: "Text",
    description: "Paragraph of text.",
    group: "Content",
    icon: AlignLeft,
    defaults: { heading: "About", text: "" },
    duplicable: true,
  },
  {
    type: "image",
    label: "Image",
    description: "A single image with optional caption.",
    group: "Content",
    icon: ImageIcon,
    defaults: { url: "", alt: "", caption: "" },
    duplicable: true,
  },
  {
    type: "gallery",
    label: "Image gallery",
    description: "A grid of images.",
    group: "Content",
    icon: Images,
    defaults: { heading: "Gallery", images: [] },
    duplicable: true,
  },
  {
    type: "video",
    label: "Video",
    description: "Embed a YouTube video.",
    group: "Media",
    icon: Video,
    defaults: { heading: "", url: "" },
    duplicable: true,
  },
  {
    type: "divider",
    label: "Divider",
    description: "A thin separating line.",
    group: "Content",
    icon: Minus,
    defaults: {},
    duplicable: true,
  },
  {
    type: "spacer",
    label: "Spacer",
    description: "Vertical breathing room.",
    group: "Content",
    icon: SquareStack,
    defaults: { size: "md" },
    duplicable: true,
  },
  {
    type: "services",
    label: "Services",
    description: "What you offer, with optional prices.",
    group: "Business",
    icon: List,
    defaults: { heading: "Services" },
    duplicable: false,
  },
  {
    type: "products",
    label: "Products",
    description: "Showcase products people can enquire about.",
    group: "Business",
    icon: Package,
    defaults: { heading: "Products" },
    duplicable: false,
  },
  {
    type: "hours",
    label: "Opening hours",
    description: "Your weekly opening times.",
    group: "Business",
    icon: CalendarClock,
    defaults: { heading: "Opening hours" },
    duplicable: false,
  },
  {
    type: "location",
    label: "Location",
    description: "Address with a link to maps.",
    group: "Business",
    icon: MapPin,
    defaults: { heading: "Find us" },
    duplicable: false,
  },
  {
    type: "business_info",
    label: "Business information",
    description: "Longer description of the business.",
    group: "Business",
    icon: Info,
    defaults: { heading: "About", useDescription: true, text: "" },
    duplicable: true,
  },
  {
    type: "links",
    label: "Link collection",
    description: "Your custom links as buttons.",
    group: "Links",
    icon: Link2,
    defaults: { heading: "Links" },
    duplicable: false,
  },
  {
    type: "contact_form",
    label: "Contact form",
    description: "Visitors write a message that opens in their email app.",
    group: "Advanced",
    icon: Contact,
    defaults: { heading: "Send a message", buttonLabel: "Send message" },
    duplicable: false,
  },
  {
    type: "file",
    label: "Downloadable file",
    description: "A file visitors can open or download.",
    group: "Advanced",
    icon: FileDown,
    defaults: { heading: "Download", label: "Download file", url: "" },
    duplicable: true,
  },
];

export const BLOCK_MAP: Record<string, BlockDefinition> = Object.fromEntries(
  BLOCK_DEFINITIONS.map((definition) => [definition.type, definition]),
) as Record<string, BlockDefinition>;

export function blockLabel(type: string): string {
  return BLOCK_MAP[type]?.label ?? type;
}

export function blockIcon(type: string): LucideIcon {
  return BLOCK_MAP[type]?.icon ?? Type;
}

export const BLOCK_GROUPS: BlockDefinition["group"][] = [
  "Profile",
  "Contact",
  "Social",
  "Content",
  "Business",
  "Links",
  "Media",
  "Advanced",
];

export const FALLBACK_ICON = Sparkle;
