import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, Copy, LoaderCircle } from "lucide-react";
import { createIdentityLink, type IdentityLink } from "@/lib/identity-links";
import { buildQrSvg } from "@/lib/qr-render";
import { DEFAULT_QR_OPTIONS } from "@/lib/qr";
import { TEMPLATES, TEMPLATE_MAP } from "@/lib/templates";

type NdefReaderCompat = new () => {
  write: (payload: { records: { recordType: string; data: string }[] }) => Promise<void>;
};

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [templateId, setTemplateId] = useState(TEMPLATES[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState<IdentityLink | null>(null);
  const [editToken, setEditToken] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [nfcStatus, setNfcStatus] = useState("");

  useEffect(() => {
    if (!link) return;
    const url = `${window.location.origin}/p/${encodeURIComponent(link.username)}`;
    setPublicUrl(url);
    try {
      const { svg } = buildQrSvg(url, { ...DEFAULT_QR_OPTIONS, frameText: "Scan to connect" });
      setQrCode(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
    } catch (qrError) {
      console.error(qrError);
      setError("Your profile was saved, but the QR code could not be created.");
    }
  }, [link]);

  const updateDisplayName = (value: string) => {
    setDisplayName(value);
    setUsername(
      value
        .normalize("NFKD")
        .toLowerCase()
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 30),
    );
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(normalizedUsername)) {
      setError(
        "Use 3–30 lowercase letters, numbers, or hyphens. Start and end with a letter or number.",
      );
      return;
    }
    const template = TEMPLATE_MAP[templateId];
    if (!template) {
      setError("Choose a valid page template.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const result = await createIdentityLink({
        username: normalizedUsername,
        displayName: displayName.trim(),
        title: title.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        website: website.trim(),
        address: address.trim(),
        template,
      });
      setLink(result.link);
      setEditToken(result.editToken);
      try {
        localStorage.setItem(`cytic-link-edit:${normalizedUsername}`, result.editToken);
      } catch (storageError) {
        console.error(storageError);
        setError(
          "Your link was created, but this browser couldn't save the edit key. Copy it now.",
        );
      }
    } catch (createError) {
      console.error(createError);
      const message =
        createError instanceof Error ? createError.message : "We couldn't create your link.";
      setError(
        message.includes("identity_links_username_key")
          ? "That link is already taken. Choose a different username."
          : message,
      );
    } finally {
      setBusy(false);
    }
  };

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (copyError) {
      console.error(copyError);
      setError(`Couldn't copy the ${label}. Select and copy it manually.`);
    }
  };

  const writeNfcCard = async () => {
    const NDEFReader = (navigator as Navigator & { NDEFReader?: NdefReaderCompat }).NDEFReader;
    if (!NDEFReader) {
      setNfcStatus("NFC writing is supported on compatible mobile devices and browsers.");
      return;
    }

    setNfcStatus("Hold an NFC card near your device.");
    try {
      await new NDEFReader().write({
        records: [{ recordType: "url", data: publicUrl }],
      });
      setNfcStatus("Your profile link was written to the NFC card.");
    } catch (nfcError) {
      console.error(nfcError);
      setNfcStatus("NFC access failed. Check browser permissions and try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F4F0] text-[#1F2A44]">
      <header className="border-b border-[#D9D9D2] bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1F2A44] text-xs font-semibold tracking-[0.14em] text-[#C6A75E]">
            CL
          </span>
          <span className="font-semibold tracking-tight">Cytic Link</span>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
        {link ? (
          <div className="rounded-xl border border-[#D9D9D2] bg-white p-6 sm:p-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F2EC] text-[#2E7D5B]">
              <Check className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Your link is live</h1>
            <p className="mt-2 text-sm text-[#49566d]">Your public profile is ready to share.</p>

            <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">
                  Public link
                </label>
                <div className="mt-2 flex gap-2">
                  <a
                    href={publicUrl}
                    className="min-w-0 flex-1 truncate rounded-md border border-[#D9D9D2] bg-[#F8F7F4] px-3 py-2.5 text-sm font-medium underline underline-offset-4"
                  >
                    {publicUrl}
                  </a>
                  <button
                    type="button"
                    onClick={() => void copyText(publicUrl, "profile link")}
                    aria-label="Copy public link"
                    className="rounded-md border border-[#D9D9D2] p-2.5 hover:bg-[#F5F5F3]"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {qrCode && (
                  <a
                    href={qrCode}
                    download={`${link.username}-qr.svg`}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#1F2A44] underline underline-offset-4"
                  >
                    Download QR code
                  </a>
                )}
                <div>
                  <button
                    type="button"
                    onClick={() => void writeNfcCard()}
                    className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#D9D9D2] px-3 py-2 text-sm font-medium hover:bg-[#F5F5F3]"
                  >
                    Write link to NFC card
                  </button>
                  {nfcStatus && (
                    <p role="status" className="mt-2 text-xs text-[#667085]">
                      {nfcStatus}
                    </p>
                  )}
                </div>
              </div>
              {qrCode && (
                <img
                  src={qrCode}
                  alt={`QR code for ${link.display_name}`}
                  className="h-40 w-40 rounded-md border border-[#E8E6E0] p-2"
                />
              )}
            </div>

            <div className="mt-6 rounded-lg border border-[#E8DCC8] bg-[#F9F6F1] p-4">
              <div className="text-sm font-semibold">Save your edit key</div>
              <p className="mt-1 text-xs leading-5 text-[#667085]">
                This key authorizes profile updates. Keep it private; there is no account recovery
                without sign-in.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  readOnly
                  value={editToken}
                  aria-label="Private profile edit key"
                  className="min-w-0 flex-1 rounded-md border border-[#D9D9D2] bg-white px-3 py-2 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => void copyText(editToken, "edit key")}
                  className="rounded-md bg-[#1F2A44] px-3 py-2 text-xs font-semibold text-white"
                >
                  Copy key
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-4 text-sm text-[#A33A32]">
                {error}
              </p>
            )}
            {copied && (
              <p role="status" className="mt-3 text-sm text-[#2E7D5B]">
                Copied.
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setLink(null);
                setEditToken("");
                setQrCode("");
                setError("");
              }}
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
            >
              Create another link <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow mb-2">No account needed</p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Create your link
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              Add your details, choose a template, and publish your profile.
            </p>

            <form
              onSubmit={handleCreate}
              className="mt-6 space-y-5 rounded-xl border border-[#D9D9D2] bg-white p-5 sm:p-7"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="display-name" className="mb-1.5 block text-sm font-medium">
                    Name or business
                  </label>
                  <input
                    id="display-name"
                    required
                    maxLength={80}
                    autoComplete="organization"
                    value={displayName}
                    onChange={(event) => updateDisplayName(event.target.value)}
                    className="w-full rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none focus:border-[#1F2A44]"
                    placeholder="e.g. Luna Restaurant"
                  />
                </div>
                <div>
                  <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
                    Custom link
                  </label>
                  <div className="flex rounded-md border border-[#D9D9D2] focus-within:border-[#1F2A44]">
                    <span className="shrink-0 border-r border-[#D9D9D2] bg-[#F8F7F4] px-2.5 py-2.5 text-xs text-[#667085]">
                      /p/
                    </span>
                    <input
                      id="username"
                      required
                      minLength={3}
                      maxLength={30}
                      pattern="[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])"
                      value={username}
                      onChange={(event) =>
                        setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                      }
                      className="min-w-0 flex-1 rounded-r-md px-3 py-2.5 text-sm outline-none"
                      aria-describedby="username-help"
                    />
                  </div>
                  <p id="username-help" className="mt-1.5 text-xs text-[#667085]">
                    3–30 lowercase letters, numbers, or hyphens.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
                    Title <span className="font-normal text-[#667085]">Optional</span>
                  </label>
                  <input
                    id="title"
                    maxLength={100}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none focus:border-[#1F2A44]"
                    placeholder="e.g. Restaurant & Café"
                  />
                </div>
                <div>
                  <label htmlFor="template" className="mb-1.5 block text-sm font-medium">
                    Template
                  </label>
                  <select
                    id="template"
                    value={templateId}
                    onChange={(event) => setTemplateId(event.target.value)}
                    className="w-full rounded-md border border-[#D9D9D2] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1F2A44]"
                  >
                    {TEMPLATES.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} — {template.audience}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="mb-1.5 block text-sm font-medium">
                  Short bio <span className="font-normal text-[#667085]">Optional</span>
                </label>
                <textarea
                  id="bio"
                  maxLength={500}
                  rows={3}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  className="w-full resize-y rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none focus:border-[#1F2A44]"
                  placeholder="A few words about you or your business"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                    Phone <span className="font-normal text-[#667085]">Optional</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none focus:border-[#1F2A44]"
                  />
                </div>
                <div>
                  <label htmlFor="whatsapp" className="mb-1.5 block text-sm font-medium">
                    WhatsApp <span className="font-normal text-[#667085]">Optional</span>
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(event) => setWhatsapp(event.target.value)}
                    className="w-full rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none focus:border-[#1F2A44]"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                    Contact email <span className="font-normal text-[#667085]">Optional</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none focus:border-[#1F2A44]"
                  />
                </div>
                <div>
                  <label htmlFor="website" className="mb-1.5 block text-sm font-medium">
                    Website <span className="font-normal text-[#667085]">Optional</span>
                  </label>
                  <input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    className="w-full rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none focus:border-[#1F2A44]"
                    placeholder="https://"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="mb-1.5 block text-sm font-medium">
                  Address <span className="font-normal text-[#667085]">Optional</span>
                </label>
                <input
                  id="address"
                  autoComplete="street-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="w-full rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none focus:border-[#1F2A44]"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-[#A33A32]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1F2A44] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#253455] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Creating your link…
                  </>
                ) : (
                  <>
                    Create my link <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
