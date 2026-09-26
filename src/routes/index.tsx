import { Link, createFileRoute } from "@tanstack/react-router";
import QRCode from "qrcode";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Globe,
  LayoutTemplate,
  Link2,
  MapPin,
  QrCode,
  Smartphone,
  Star,
  Wand2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const steps = [
  {
    number: "01",
    title: "Create your page",
    description: "Set up your profile with your name, title and business details.",
  },
  {
    number: "02",
    title: "Customize it",
    description: "Choose a template and fine-tune blocks, links, contact buttons and theme.",
  },
  {
    number: "03",
    title: "Share your link",
    description: "Publish once, then share your personal page or QR code anywhere.",
  },
];

const templates = [
  {
    name: "Classic Business",
    audience: "Businesses and services",
    accent: "bg-[#1F2A44] text-white",
    purpose: "Retail, clinics and local teams",
  },
  {
    name: "Professional",
    audience: "Consultants and freelancers",
    accent: "bg-[#E8DCC8] text-[#1F2A44]",
    purpose: "High-trust service and portfolio work",
  },
  {
    name: "Creator",
    audience: "Influencers and media brands",
    accent: "bg-[#C6A75E] text-[#1F2A44]",
    purpose: "Personal brand, media and content",
  },
  {
    name: "Restaurant",
    audience: "Shops, cafés and dining",
    accent: "bg-[#F5F5F3] text-[#1F2A44]",
    purpose: "Menu, hours and reservation-ready",
  },
  {
    name: "Event Showcase",
    audience: "Launches and experiences",
    accent: "bg-[#3A2B68] text-white",
    purpose: "Tickets, agenda and social proof",
  },
  {
    name: "Wellness Studio",
    audience: "Clinics, salons and care spaces",
    accent: "bg-[#DCE7D8] text-[#1F2A44]",
    purpose: "Bookings and treatment packages",
  },
  {
    name: "Real Estate",
    audience: "Properties and property agents",
    accent: "bg-[#D9E3F0] text-[#1F2A44]",
    purpose: "Listings, location and trust signals",
  },
  {
    name: "Studio Showcase",
    audience: "Designers and creative teams",
    accent: "bg-[#211F1F] text-white",
    purpose: "Portfolio, case studies and results",
  },
];

const features = [
  {
    icon: Globe,
    title: "Digital profile",
    text: "Create a polished public page that reflects your identity and business.",
  },
  {
    icon: Wand2,
    title: "Custom page",
    text: "Arrange blocks, edit content and shape your layout without a template lock-in.",
  },
  {
    icon: QrCode,
    title: "QR codes",
    text: "Generate a profile QR that stays valid even as you update your content.",
  },
  {
    icon: Link2,
    title: "Social links",
    text: "Add contact, social and custom links with clear actions for visitors.",
  },
  {
    icon: Smartphone,
    title: "Contact buttons",
    text: "Drive calls, WhatsApp chats, email contact and map directions in one click.",
  },
  {
    icon: LayoutTemplate,
    title: "Templates",
    text: "Start from a polished layout, then customize it however you need.",
  },
];

const useCases = [
  "Businesses",
  "Professionals",
  "Creators",
  "Freelancers",
  "Restaurants",
  "Organizations",
  "Personal profiles",
];

type NdefReaderCompat = new () => {
  write: (payload: { records: { recordType: string; data: string }[] }) => Promise<void>;
  scan: () => Promise<void>;
};

function NfcCardDemo() {
  const [mode, setMode] = useState<"write" | "read">("write");
  const [status, setStatus] = useState("Ready to connect");
  const [profileUrl, setProfileUrl] = useState("https://cytic.link/p/luna-restaurant");

  const supportsNfc =
    typeof navigator !== "undefined" &&
    typeof (navigator as Navigator & { NDEFReader?: NdefReaderCompat }).NDEFReader !== "undefined";

  const handleNfc = async () => {
    if (!profileUrl.trim()) {
      setStatus("Add a URL before writing it to an NFC card.");
      return;
    }

    if (!supportsNfc) {
      setStatus("NFC is available on supported mobile devices and NFC-enabled cards.");
      return;
    }

    try {
      const NDEFReader = (navigator as Navigator & { NDEFReader: NdefReaderCompat }).NDEFReader;
      const reader = new NDEFReader();

      if (mode === "write") {
        setStatus("Hold the card near the device to write the URL…");
        await reader.write({
          records: [{ recordType: "url", data: profileUrl }],
        });
        setStatus("URL written to the NFC card.");
      } else {
        setStatus("Scanning card for a saved URL…");
        await reader.scan();
        setStatus("Card detected. Tap again when the browser prompts for the stored URL.");
      }
    } catch (error) {
      console.error(error);
      setStatus("NFC access is unavailable right now. Try again on an NFC-enabled device.");
    }
  };

  return (
    <div className="rounded-[28px] border border-[#D9D9D2] bg-[#F9F6F1] p-6 shadow-[0_16px_40px_rgba(31,42,68,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#667085]">
            NFC card
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#1F2A44]">
            Share your page by tap
          </h3>
        </div>
        <div className="rounded-full border border-[#D9D9D2] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1F2A44]">
          {mode === "write" ? "Write" : "Read"}
        </div>
      </div>

      <div className="mt-5 flex gap-2 rounded-full border border-[#D9D9D2] bg-white p-1">
        {(["write", "read"] as const).map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => setMode(action)}
            className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${
              mode === action ? "bg-[#1F2A44] text-white" : "text-[#1F2A44]"
            }`}
          >
            {action === "write" ? "Write URL" : "Read card"}
          </button>
        ))}
      </div>

      <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#667085]">
        profile url
      </label>
      <input
        value={profileUrl}
        onChange={(event) => setProfileUrl(event.target.value)}
        className="mt-2 w-full rounded-xl border border-[#D9D9D2] bg-white px-3 py-3 text-sm text-[#1F2A44] outline-none ring-0 placeholder:text-[#98A2B3] focus:border-[#1F2A44]"
        placeholder="https://cytic.link/p/your-profile"
      />

      <button
        type="button"
        onClick={handleNfc}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C6A75E] px-4 py-3 text-sm font-semibold text-[#1F2A44] transition hover:bg-[#b99d4c]"
      >
        <QrCode className="h-4 w-4" />
        {mode === "write" ? "Write to NFC card" : "Scan NFC card"}
      </button>

      <div className="mt-4 rounded-xl border border-dashed border-[#D9D9D2] bg-white/70 p-4 text-sm text-[#49566d]">
        {status}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-[18px] border border-[#D9D9D2] bg-white p-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#667085]">
            Card ready
          </div>
          <div className="mt-1 text-sm font-medium text-[#1F2A44]">
            cytic.link/p/luna-restaurant
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1F2A44] text-[#C6A75E]">
          <Smartphone className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function QrCodeGenerator() {
  const [value, setValue] = useState("https://cytic.link/p/luna-restaurant");

  const qrDataUrl = useMemo(() => {
    try {
      return QRCode.toDataURL(value, {
        errorCorrectionLevel: "M",
        width: 240,
        margin: 1,
        color: {
          dark: "#1F2A44",
          light: "#FFFFFF",
        },
      });
    } catch {
      return "";
    }
  }, [value]);

  return (
    <div className="rounded-[28px] border border-[#D9D9D2] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#667085]">
            QR code
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#1F2A44]">
            Make your own
          </h3>
        </div>
        <div className="rounded-full border border-[#D9D9D2] bg-[#F5F5F3] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1F2A44]">
          Live
        </div>
      </div>

      <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#667085]">
        URL
      </label>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="mt-2 w-full rounded-xl border border-[#D9D9D2] bg-[#F5F5F3] px-3 py-3 text-sm text-[#1F2A44] outline-none focus:border-[#1F2A44]"
        placeholder="https://cytic.link/p/your-profile"
      />

      <div className="mt-5 flex items-center justify-center rounded-[22px] bg-[#1F2A44] p-4">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="Generated QR code"
            className="h-44 w-44 rounded-xl bg-white p-2"
          />
        ) : (
          <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-white text-xs text-[#1F2A44]">
            Invalid URL
          </div>
        )}
      </div>
    </div>
  );
}

function Index() {
  return (
    <main className="min-h-screen bg-[#F5F4F0] text-[#1F2A44]">
      <header className="border-b border-[#D9D9D2] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1F2A44] text-sm font-semibold tracking-[0.18em] text-[#C6A75E]">
              CL
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">Cytic Link</div>
            </div>
          </div>

          <nav className="hidden items-center gap-7 text-sm font-medium text-[#1F2A44]/80 md:flex">
            <a href="#features" className="transition hover:text-[#1F2A44]">
              Features
            </a>
            <a href="#templates" className="transition hover:text-[#1F2A44]">
              Templates
            </a>
            <a href="#how-it-works" className="transition hover:text-[#1F2A44]">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden rounded-md border border-[#D9D9D2] px-4 py-2 text-sm font-medium text-[#1F2A44] transition hover:bg-[#F5F5F3] sm:inline-flex">
              Log in
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md bg-[#1F2A44] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#253455]"
            >
              Create your page
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D9D9D2] bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#1F2A44]">
              <BadgeCheck className="h-3.5 w-3.5 text-[#C6A75E]" />
              Your identity. One link. One scan.
            </div>

            <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.06em] text-[#1F2A44] sm:text-5xl lg:text-6xl">
              Your identity.
              <br />
              One link.
              <br />
              One scan.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#49566d]">
              Create a professional digital page for your business, profession, brand or personal
              identity. Share everything through one simple link or QR code.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-md bg-[#1F2A44] px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-[#253455]"
              >
                Create your page
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#templates"
                className="inline-flex items-center gap-2 rounded-md border border-[#D9D9D2] bg-white px-6 py-3 text-base font-medium text-[#1F2A44] transition hover:bg-[#F5F5F3]"
              >
                View templates
              </a>
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm text-[#49566d]">
              <CheckCircle2 className="h-4 w-4 text-[#2E7D5B]" />
              No payment. No subscription.
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[28px] border border-[#D9D9D2] bg-[#F9F6F1] p-4 shadow-[0_16px_40px_rgba(31,42,68,0.08)]">
              <div className="rounded-[20px] border border-[#E8DCC8] bg-white p-4">
                <div className="mb-4 flex items-center justify-between border-b border-[#EFEAE0] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F2A44] text-xs font-semibold text-[#C6A75E]">
                      LR
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#1F2A44]">Luna Restaurant</div>
                      <div className="text-xs text-[#667085]">Restaurant &amp; Café</div>
                    </div>
                  </div>
                  <div className="rounded-full border border-[#D9D9D2] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#1F2A44]">
                    Live
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-[#F8F5F0] p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 rounded-full bg-[radial-gradient(circle_at_30%_30%,_#d8c49d,_#b89b4d_40%,_#7f692e)]" />
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-[#1F2A44]">
                          Fresh meals, great coffee.
                        </div>
                        <div className="mt-1 text-sm text-[#667085]">Kampala, Uganda</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button className="rounded-md bg-[#1F2A44] px-3 py-2 text-xs font-medium text-white">
                      Call
                    </button>
                    <button className="rounded-md bg-[#C6A75E] px-3 py-2 text-xs font-medium text-[#1F2A44]">
                      WhatsApp
                    </button>
                  </div>

                  <div className="rounded-xl border border-[#E8DCC8] bg-[#E8DCC8]/50 p-3">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1F2A44]/70">
                      Our menu
                    </div>
                    <div className="space-y-2 text-sm text-[#1F2A44]">
                      <div className="flex items-center justify-between">
                        <span>Signature grill</span>
                        <span>$18</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Chef specials</span>
                        <span>$22</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#D9D9D2] bg-white p-3">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#667085]">
                      Hours
                    </div>
                    <div className="space-y-1 text-sm text-[#1F2A44]">
                      <div className="flex items-center justify-between">
                        <span>Mon–Sat</span>
                        <span>8:00 AM – 10:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-[18px] border border-[#D9D9D2] bg-white p-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#667085]">
                    Scan me
                  </div>
                  <div className="mt-1 text-sm font-medium text-[#1F2A44]">
                    cytic.link/p/luna-restaurant
                  </div>
                </div>
                <div className="grid h-16 w-16 grid-cols-4 gap-1 rounded-md bg-[#1F2A44] p-2">
                  {Array.from({ length: 16 }).map((_, index) => (
                    <div
                      key={index}
                      className={
                        (index + 1) % 3 === 0 || index % 5 === 0 || index % 7 === 0
                          ? "rounded-[2px] bg-[#C6A75E]"
                          : "rounded-[2px] bg-white/90"
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-[#D9D9D2] bg-[#F8F5F0] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <div className="eyebrow mb-3">How it works</div>
            <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[#1F2A44]">
              A polished page in three simple steps.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-[22px] border border-[#D9D9D2] bg-white p-6 shadow-sm"
              >
                <div className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#C6A75E]">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-[#1F2A44]">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#49566d]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="eyebrow mb-3">Templates</div>
            <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[#1F2A44]">
              Choose a strong starting point.
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {templates.map((template) => (
            <div
              key={template.name}
              className="overflow-hidden rounded-[22px] border border-[#D9D9D2] bg-white shadow-sm"
            >
              <div className={`flex h-36 items-end p-4 ${template.accent}`}>
                <div className="w-full rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="h-2.5 w-2.5 rounded-full bg-current/80" />
                    <div className="h-2.5 w-12 rounded-full bg-current/60" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-2 w-20 rounded-full bg-current/70" />
                    <div className="h-2 w-32 rounded-full bg-current/50" />
                    <div className="h-2 w-28 rounded-full bg-current/50" />
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-[#1F2A44]">{template.name}</h3>
                <p className="mt-1 text-sm text-[#667085]">{template.audience}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#C6A75E]">
                  {template.purpose}
                </p>
                <button className="mt-5 inline-flex items-center gap-2 rounded-md border border-[#D9D9D2] px-3 py-2 text-sm font-medium text-[#1F2A44] transition hover:bg-[#F5F5F3]">
                  Use template
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <div className="eyebrow mb-3">NFC cards</div>
            <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[#1F2A44]">
              Make your profile tap-ready.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-[#49566d]">
              Put your Cytic Link URL on a physical NFC card so people can tap to open your page,
              share your profile, or read the card back on a compatible device.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[#1F2A44]">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#2E7D5B]" /> Write your public URL onto a
                compatible card
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#2E7D5B]" /> Read an existing card to confirm
                the stored link
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#2E7D5B]" /> Works best on devices with NFC
                support and modern mobile browsers
              </li>
            </ul>
          </div>

          <NfcCardDemo />
        </div>
      </section>

      <section id="features" className="border-y border-[#D9D9D2] bg-[#1F2A44] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <div className="eyebrow mb-3 text-[#C6A75E]">Features</div>
            <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white">
              Everything you need to build a credible digital identity.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[20px] border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-[#C6A75E] text-[#1F2A44]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/75">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="eyebrow mb-3">Use cases</div>
            <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[#1F2A44]">
              Built for people and organizations with real-world needs.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((useCase) => (
              <div
                key={useCase}
                className="rounded-xl border border-[#D9D9D2] bg-[#F5F5F3] px-4 py-3 text-sm font-medium text-[#1F2A44]"
              >
                {useCase}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8F5F0] py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div className="rounded-[28px] border border-[#D9D9D2] bg-white p-6 sm:p-8">
            <div className="eyebrow mb-3">QR codes</div>
            <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[#1F2A44]">
              Your QR code stays valid as your profile evolves.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-[#49566d]">
              Link your public page to a dynamic QR code and update your page without reprinting or
              replacing the code. That keeps your digital presence consistent while you keep
              refining your details.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[#1F2A44]">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#2E7D5B]" /> Custom colors, framing and logo
                options
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#2E7D5B]" /> Download PNG or SVG for print or
                digital sharing
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#2E7D5B]" /> Safe, readable code with
                contrast and quiet-zone checks
              </li>
            </ul>
          </div>

          <QrCodeGenerator />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-[#D9D9D2] bg-[#F9F6F1] px-6 py-12 sm:px-10">
          <div className="eyebrow mb-3">Get started</div>
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-[#1F2A44] sm:text-4xl">
            Your information deserves one simple home.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[#49566d]">
            Build your public page, customize it and start sharing the right people to your work
            with confidence.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md bg-[#1F2A44] px-6 py-3 text-base font-medium text-white transition hover:bg-[#253455]"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#D9D9D2] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[#49566d] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1F2A44] text-xs font-semibold tracking-[0.18em] text-[#C6A75E]">
              CL
            </div>
            <span className="font-medium text-[#1F2A44]">Cytic Link</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="transition hover:text-[#1F2A44]">
              Features
            </a>
            <a href="#templates" className="transition hover:text-[#1F2A44]">
              Templates
            </a>
            <a href="#how-it-works" className="transition hover:text-[#1F2A44]">
              How it works
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
