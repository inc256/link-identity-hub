import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Check, Copy, LoaderCircle } from "lucide-react";
import {
  TemplatePreview,
  TemplateThumbnail,
  type TemplatePreviewValues,
} from "@/components/public/TemplatePreview";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createIdentityLink, type IdentityLink } from "@/lib/identity-links";
import { uploadIdentityPhoto } from "@/lib/identity-photo-storage";
import { defaultHours, mediaUrl, type OpeningHour } from "@/lib/profile-types";
import { buildQrSvg } from "@/lib/qr-render";
import { DEFAULT_QR_OPTIONS } from "@/lib/qr";
import { SOCIAL_PLATFORMS } from "@/lib/socials";
import { TEMPLATES, TEMPLATE_MAP, type TemplateDefinition } from "@/lib/templates";
import { validateImageFile } from "@/lib/validation";

type NdefReaderCompat = new () => {
  write: (
    message: { records: { recordType: string; data: string }[] },
    options?: { signal?: AbortSignal },
  ) => Promise<void>;
  scan: (options?: { signal?: AbortSignal }) => Promise<void>;
  onreading: ((event: NdefReadingEventCompat) => void) | null;
  onreadingerror: ((event: Event) => void) | null;
};

type NdefReadingEventCompat = Event & {
  message: { records: { recordType: string; data: DataView | null }[] };
};

type ContactField = "phone" | "whatsapp" | "email" | "website" | "location";
type ContactFieldOptions = Record<ContactField, boolean>;

function getContactFieldDefaults(template: TemplateDefinition): ContactFieldOptions {
  const contact = template.blocks.find((block) => block.type === "contact");
  const content = contact?.content;
  return {
    phone: contact ? content?.["call"] !== false : false,
    whatsapp: contact ? content?.["whatsapp"] !== false : false,
    email: contact
      ? content?.["email"] !== false
      : template.blocks.some((block) => block.type === "contact_form"),
    website: contact ? content?.["website"] !== false : false,
    location: contact ? content?.["location"] === true : false,
  };
}

function hasTemplateBlock(template: TemplateDefinition, ...types: string[]): boolean {
  return template.blocks.some((block) => types.includes(block.type));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUsernameConflict(error: unknown): boolean {
  if (!isRecord(error)) return false;
  const message = [error["message"], error["details"], error["constraint"]]
    .filter((value): value is string => typeof value === "string")
    .join(" ");
  return (
    error["code"] === "23505" ||
    error["status"] === 409 ||
    message.includes("identity_links_username_key")
  );
}

function decodeNdefRecord(record: { recordType: string; data: DataView | null }): {
  value: string;
  url: string | null;
} | null {
  if (!record.data) return null;
  const bytes = new Uint8Array(record.data.buffer, record.data.byteOffset, record.data.byteLength);

  if (record.recordType === "url") {
    const prefixes = ["", "http://www.", "https://www.", "http://", "https://"];
    const value = `${prefixes[bytes[0] ?? 0] ?? ""}${new TextDecoder().decode(bytes.subarray(1))}`;
    try {
      const url = new URL(value);
      return {
        value,
        url: url.protocol === "http:" || url.protocol === "https:" ? url.href : null,
      };
    } catch {
      return { value, url: null };
    }
  }

  if (record.recordType === "text" && bytes.length > 0) {
    const status = bytes[0] ?? 0;
    const languageLength = status & 0x3f;
    const encoding = (status & 0x80) === 0 ? "utf-8" : "utf-16be";
    return {
      value: new TextDecoder(encoding).decode(bytes.subarray(1 + languageLength)),
      url: null,
    };
  }

  return null;
}

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
  const [hours, setHours] = useState<OpeningHour[]>(defaultHours());
  const [showHours, setShowHours] = useState(hasTemplateBlock(TEMPLATES[0]!, "hours"));
  const [templateId, setTemplateId] = useState("");
  const [hasSelectedTemplate, setHasSelectedTemplate] = useState(false);
  const [showDetailsPage, setShowDetailsPage] = useState(false);
  const [templateToPreview, setTemplateToPreview] = useState<TemplateDefinition | null>(null);
  const [contactFields, setContactFields] = useState<ContactFieldOptions>(
    getContactFieldDefaults(TEMPLATES[0]!),
  );
  const [description, setDescription] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [socialPlatform, setSocialPlatform] = useState(SOCIAL_PLATFORMS[0]?.value ?? "instagram");
  const [socialUrl, setSocialUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [usernameConflict, setUsernameConflict] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState<IdentityLink | null>(null);
  const [editToken, setEditToken] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [nfcStatus, setNfcStatus] = useState("");
  const [nfcReadResult, setNfcReadResult] = useState<{ value: string; url: string | null } | null>(
    null,
  );
  const [nfcReading, setNfcReading] = useState(false);
  const [nfcWriting, setNfcWriting] = useState(false);
  const nfcOperationController = useRef<AbortController | null>(null);
  const selectedTemplate = TEMPLATE_MAP[templateId] ?? TEMPLATES[0]!;
  const templateFeatures = {
    about: hasTemplateBlock(selectedTemplate, "text", "business_info"),
    links: hasTemplateBlock(selectedTemplate, "links"),
    services: hasTemplateBlock(selectedTemplate, "services", "products"),
    gallery: hasTemplateBlock(selectedTemplate, "gallery"),
    video: hasTemplateBlock(selectedTemplate, "video"),
    social: hasTemplateBlock(selectedTemplate, "social"),
    hours: hasTemplateBlock(selectedTemplate, "hours"),
    contact: hasTemplateBlock(selectedTemplate, "contact", "contact_form"),
  };
  const previewValues: TemplatePreviewValues = {
    displayName,
    title,
    bio,
    description,
    phone: contactFields.phone ? phone : "",
    whatsapp: contactFields.whatsapp ? whatsapp : "",
    email: contactFields.email ? email : "",
    website: contactFields.website ? website : "",
    address: contactFields.location ? address : "",
    linkTitle,
    linkUrl,
    serviceName,
    serviceDescription,
    servicePrice,
    profileImageUrl,
    imageUrls,
    videoUrl,
    socialPlatform,
    socialUrl,
    hours,
    showHours,
  };
  const selectTemplate = (template: TemplateDefinition) => {
    setTemplateId(template.id);
    setHasSelectedTemplate(true);
    setShowDetailsPage(true);
    setContactFields(getContactFieldDefaults(template));
    setShowHours(hasTemplateBlock(template, "hours"));
    setError("");
  };

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

  useEffect(
    () => () => {
      const controller = nfcOperationController.current;
      nfcOperationController.current = null;
      controller?.abort();
    },
    [],
  );

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

  const uploadProfilePhoto = async (file: File | undefined) => {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(normalizedUsername)) {
      setError("Enter a valid custom link before uploading your profile photo.");
      return;
    }

    setUploadingPhotos(true);
    setError("");
    try {
      setProfileImageUrl(await uploadIdentityPhoto(normalizedUsername, file));
    } catch (uploadError) {
      console.error(uploadError);
      setError(
        uploadError instanceof Error
          ? `Profile photo upload failed: ${uploadError.message}`
          : "Profile photo upload failed. Please try again.",
      );
    } finally {
      setUploadingPhotos(false);
    }
  };

  const uploadGalleryPhotos = async (files: File[]) => {
    if (files.length === 0) return;
    if (imageUrls.length + files.length > 10) {
      setError("You can add up to 10 gallery photos.");
      return;
    }
    const validationError = files.map(validateImageFile).find((message) => message !== null);
    if (validationError) {
      setError(validationError);
      return;
    }
    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(normalizedUsername)) {
      setError("Enter a valid custom link before uploading gallery photos.");
      return;
    }

    setUploadingPhotos(true);
    setError("");
    try {
      for (const file of files) {
        const uploadedPath = await uploadIdentityPhoto(normalizedUsername, file);
        setImageUrls((current) => [...current, uploadedPath]);
      }
    } catch (uploadError) {
      console.error(uploadError);
      setError(
        uploadError instanceof Error
          ? `Gallery photo upload failed: ${uploadError.message}`
          : "Gallery photo upload failed. Please try again.",
      );
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (uploadingPhotos) {
      setError("Wait for the photo upload to finish before creating your profile.");
      return;
    }
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
    if ((linkTitle.trim() || linkUrl.trim()) && (!linkTitle.trim() || !linkUrl.trim())) {
      setError("Add both a link label and destination, or leave both fields empty.");
      return;
    }

    setBusy(true);
    setError("");
    setUsernameConflict(false);
    try {
      const result = await createIdentityLink({
        username: normalizedUsername,
        displayName: displayName.trim(),
        title: title.trim(),
        bio: bio.trim(),
        phone: contactFields.phone ? phone.trim() : "",
        whatsapp: contactFields.whatsapp ? whatsapp.trim() : "",
        email: contactFields.email ? email.trim() : "",
        website: contactFields.website ? website.trim() : "",
        address: contactFields.location ? address.trim() : "",
        profileImage: profileImageUrl || null,
        template,
        templateFields: {
          description: description.trim(),
          linkTitle: linkTitle.trim(),
          linkUrl: linkUrl.trim(),
          serviceName: serviceName.trim(),
          serviceDescription: serviceDescription.trim(),
          servicePrice: servicePrice.trim(),
          imageUrls,
          videoUrl: videoUrl.trim(),
          socialPlatform,
          socialUrl: socialUrl.trim(),
          openingHours: showHours ? hours : [],
          contactOptions: {
            call: contactFields.phone,
            whatsapp: contactFields.whatsapp,
            email: contactFields.email,
            website: contactFields.website,
            location: contactFields.location,
          },
        },
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
      if (isUsernameConflict(createError)) {
        setUsernameConflict(true);
        setError("That custom link is already in use. Choose a different one and try again.");
        usernameInputRef.current?.focus();
      } else {
        console.error(createError);
        setError(
          createError instanceof Error ? createError.message : "We couldn't create your link.",
        );
      }
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
    if (!window.isSecureContext) {
      setNfcStatus("NFC requires a secure HTTPS connection.");
      return;
    }
    const NDEFReader = (window as Window & { NDEFReader?: NdefReaderCompat }).NDEFReader;
    if (!NDEFReader) {
      setNfcStatus(
        "Web NFC is unavailable here. Use Chrome on an NFC-capable Android device, enable NFC, and open this page over HTTPS.",
      );
      return;
    }

    nfcOperationController.current?.abort();
    const controller = new AbortController();
    nfcOperationController.current = controller;
    setNfcReading(false);
    setNfcReadResult(null);
    setNfcWriting(true);
    setNfcStatus(
      "Waiting for an NFC card. Keep this page open and hold the card near your device.",
    );
    try {
      await new NDEFReader().write(
        { records: [{ recordType: "url", data: publicUrl }] },
        { signal: controller.signal },
      );
      setNfcStatus("Your profile link was written to the NFC card.");
    } catch (nfcError) {
      if (controller.signal.aborted) {
        if (nfcOperationController.current === controller) {
          nfcOperationController.current = null;
          setNfcStatus("NFC writing canceled.");
        }
        return;
      }
      console.error(nfcError);
      const message =
        nfcError instanceof Error && nfcError.name === "NotAllowedError"
          ? "Chrome blocked NFC access. Allow NFC for this site in Chrome’s site settings, then try again."
          : nfcError instanceof Error && nfcError.name === "NotSupportedError"
            ? "NFC is unavailable or turned off. Enable NFC on your Android device and try again."
            : nfcError instanceof Error && nfcError.name === "NotReadableError"
              ? "The NFC adapter is busy or unavailable. Close other NFC apps and try again."
              : nfcError instanceof Error && nfcError.name === "SecurityError"
                ? "This page is not allowed to use NFC. Open it directly in Chrome over HTTPS and allow NFC for the site."
                : nfcError instanceof Error
                  ? `NFC writing failed: ${nfcError.message}`
                  : "NFC writing failed. Check Chrome’s site permissions and device NFC settings.";
      setNfcStatus(message);
    } finally {
      if (nfcOperationController.current === controller) {
        nfcOperationController.current = null;
        setNfcWriting(false);
      }
    }
  };

  const stopNfcWrite = () => {
    nfcOperationController.current?.abort();
    nfcOperationController.current = null;
    setNfcWriting(false);
    setNfcStatus("NFC writing canceled.");
  };

  const stopNfcRead = () => {
    nfcOperationController.current?.abort();
    nfcOperationController.current = null;
    setNfcReading(false);
    setNfcStatus("NFC reading stopped.");
  };

  const readNfcCard = async () => {
    if (!window.isSecureContext) {
      setNfcStatus("NFC requires a secure HTTPS connection.");
      return;
    }
    const NDEFReader = (window as Window & { NDEFReader?: NdefReaderCompat }).NDEFReader;
    if (!NDEFReader) {
      setNfcStatus(
        "Web NFC is unavailable here. Use Chrome on an NFC-capable Android device, enable NFC, and open this page over HTTPS.",
      );
      return;
    }

    const controller = new AbortController();
    nfcOperationController.current?.abort();
    nfcOperationController.current = controller;
    setNfcReadResult(null);
    setNfcReading(true);
    setNfcStatus("Hold an NFC card near your device.");
    try {
      const reader = new NDEFReader();
      reader.onreading = (event) => {
        if (nfcOperationController.current !== controller) return;
        nfcOperationController.current = null;
        controller.abort();
        setNfcReading(false);
        const result = event.message.records
          .map(decodeNdefRecord)
          .find((record) => record !== null);
        setNfcReadResult(result ?? null);
        setNfcStatus(
          result
            ? "NFC card read successfully."
            : "The NFC card was read, but it contains no supported URL or text record.",
        );
      };
      reader.onreadingerror = () => {
        if (nfcOperationController.current !== controller) return;
        nfcOperationController.current = null;
        controller.abort();
        setNfcReading(false);
        setNfcStatus("The NFC card could not be read. Hold it near the device and try again.");
      };
      await reader.scan({ signal: controller.signal });
    } catch (nfcError) {
      if (controller.signal.aborted) return;
      if (nfcOperationController.current === controller) {
        nfcOperationController.current = null;
      }
      setNfcReading(false);
      console.error(nfcError);
      const message =
        nfcError instanceof Error && nfcError.name === "NotAllowedError"
          ? "Chrome blocked NFC access. Allow NFC for this site in Chrome’s site settings, then try again."
          : nfcError instanceof Error && nfcError.name === "NotSupportedError"
            ? "NFC is unavailable or turned off. Enable NFC on your Android device and try again."
            : nfcError instanceof Error && nfcError.name === "NotReadableError"
              ? "The NFC adapter is busy or unavailable. Close other NFC apps and try again."
              : nfcError instanceof Error && nfcError.name === "SecurityError"
                ? "This page is not allowed to use NFC. Open it directly in Chrome over HTTPS and allow NFC for the site."
                : nfcError instanceof Error
                  ? `NFC reading failed: ${nfcError.message}`
                  : "NFC reading failed. Check Chrome’s site permissions and device NFC settings.";
      setNfcStatus(message);
    }
  };

  const nfcStatusIsError =
    /blocked|unavailable|turned off|busy|failed|could not|requires|not allowed/i.test(nfcStatus);

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

      <section className="mx-auto max-w-7xl px-5 py-8 sm:py-12">
        {link ? (
          <div className="mx-auto max-w-3xl rounded-xl border border-[#D9D9D2] bg-white p-6 sm:p-8">
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
                <section className="mt-5 rounded-lg border border-[#D9D9D2] bg-[#F8F7F4] p-4">
                  <h2 className="text-sm font-semibold">Use your link with an NFC card</h2>
                  <p className="mt-1 text-xs leading-5 text-[#667085]">
                    Chrome will ask for NFC permission when you start reading or writing. Allow
                    access, then hold a writable card near your NFC-capable Android device. Keep
                    this page open until the operation finishes. Web NFC requires HTTPS.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void writeNfcCard()}
                      disabled={nfcWriting || nfcReading || !publicUrl}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1F2A44] px-3 py-2 text-sm font-medium text-white hover:bg-[#253455] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {nfcWriting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                      {nfcWriting ? "Waiting for NFC card…" : "Write link to NFC card"}
                    </button>
                    {nfcWriting ? (
                      <button
                        type="button"
                        onClick={stopNfcWrite}
                        className="rounded-md border border-[#D9D9D2] px-3 py-2 text-sm font-medium hover:bg-white"
                      >
                        Cancel writing
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void (nfcReading ? stopNfcRead() : readNfcCard())}
                        className="rounded-md border border-[#D9D9D2] px-3 py-2 text-sm font-medium hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {nfcReading ? "Stop reading" : "Read NFC card"}
                      </button>
                    )}
                  </div>
                  {nfcStatus && (
                    <p
                      role={nfcStatusIsError ? "alert" : "status"}
                      aria-live={nfcStatusIsError ? "assertive" : "polite"}
                      className={`mt-3 rounded-md p-3 text-xs ${nfcStatusIsError ? "border border-[#E7B4AE] bg-[#FFF5F4] font-medium text-[#8D2F29]" : "bg-white text-[#49566d]"}`}
                    >
                      {nfcStatus}
                    </p>
                  )}
                  {nfcReadResult && (
                    <p className="mt-2 break-all text-xs text-[#49566d]">
                      {nfcReadResult.url ? (
                        <a
                          href={nfcReadResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2"
                        >
                          {nfcReadResult.value}
                        </a>
                      ) : (
                        nfcReadResult.value
                      )}
                    </p>
                  )}
                </section>
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
          <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <p className="eyebrow mb-2">No account needed</p>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                {showDetailsPage ? "Fill in your details" : "Create your link"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#667085]">
                {showDetailsPage
                  ? `Add the information you want to show on your ${selectedTemplate.name} page.`
                  : "Choose a design, add the details that fit, and preview your profile as you build it."}
              </p>

              <form
                onSubmit={handleCreate}
                className="mt-6 space-y-6 rounded-xl border border-[#D9D9D2] bg-white p-5 sm:p-7"
              >
                {!showDetailsPage && (
                  <section aria-labelledby="template-heading">
                    <div className="mb-3">
                      <h2 id="template-heading" className="text-base font-semibold">
                        Choose a template
                      </h2>
                      <p className="mt-1 text-xs text-[#667085]">
                        Each design comes with sections and a style tailored to its purpose.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 2xl:grid-cols-3">
                      {TEMPLATES.map((template) => {
                        const selected = hasSelectedTemplate && template.id === templateId;
                        return (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => setTemplateToPreview(template)}
                            className={`min-w-0 rounded-lg border p-2 sm:p-2.5 transition ${
                              selected
                                ? "border-[#1F2A44] bg-[#F8F7F4] ring-1 ring-[#1F2A44]"
                                : "border-[#E4E2DC] hover:border-[#9AA1AE]"
                            } flex w-full flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F2A44] focus-visible:ring-offset-2`}
                          >
                            <TemplateThumbnail template={template} />
                            <span className="mt-2 block text-xs font-semibold leading-4 sm:text-sm">
                              {template.name}
                            </span>
                            <span className="mt-0.5 block min-h-8 text-[10px] leading-4 text-[#667085] sm:text-xs">
                              {template.audience}
                            </span>
                            <span className="mt-2 flex min-h-6 flex-wrap gap-1">
                              {[...new Set(template.blocks.map((block) => block.type))]
                                .filter((type) => type !== "profile")
                                .slice(0, 3)
                                .map((type) => (
                                  <span
                                    key={type}
                                    className="rounded-full bg-white px-1.5 py-0.5 text-[9px] capitalize leading-3 text-[#667085] sm:px-2 sm:text-[10px]"
                                  >
                                    {type.replace("_", " ")}
                                  </span>
                                ))}
                            </span>
                            <span className="mt-3 inline-flex min-h-9 w-full items-center justify-center rounded-md border border-[#1F2A44] px-3 py-1.5 text-xs font-semibold text-[#1F2A44] sm:w-auto sm:self-end">
                              Preview template
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {showDetailsPage ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDetailsPage(false);
                        setError("");
                      }}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F2A44] underline underline-offset-4"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" />
                      Back to templates
                    </button>
                    <section aria-labelledby="details-heading">
                      <h2 id="details-heading" className="text-base font-semibold">
                        Profile information
                      </h2>
                      <p className="mt-1 text-xs text-[#667085]">
                        Add the information you want to show on your page.
                      </p>
                    </section>

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
                            ref={usernameInputRef}
                            required
                            minLength={3}
                            maxLength={30}
                            value={username}
                            onChange={(event) => {
                              setUsername(
                                event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                              );
                              if (usernameConflict) {
                                setUsernameConflict(false);
                                setError("");
                              }
                            }}
                            className={`min-w-0 flex-1 rounded-r-md px-3 py-2.5 text-sm outline-none ${usernameConflict ? "bg-[#FFF5F4] text-[#8D2F29] ring-1 ring-inset ring-[#C84A40]" : ""}`}
                            aria-invalid={usernameConflict}
                            aria-describedby={
                              usernameConflict ? "username-help username-error" : "username-help"
                            }
                          />
                        </div>
                        <p id="username-help" className="mt-1.5 text-xs text-[#667085]">
                          3–30 lowercase letters, numbers, or hyphens.
                        </p>
                        {usernameConflict && (
                          <p
                            id="username-error"
                            role="alert"
                            className="mt-2 flex items-start gap-1.5 text-sm font-medium text-[#A33A32]"
                          >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{error}</span>
                          </p>
                        )}
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
                      <p className="flex items-end rounded-md bg-[#F8F7F4] px-3 py-2.5 text-sm text-[#667085]">
                        Selected design:{" "}
                        <span className="ml-1 font-semibold text-[#1F2A44]">
                          {selectedTemplate.name}
                        </span>
                      </p>
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

                    <section className="space-y-3 rounded-lg bg-[#F8F7F4] p-4">
                      <div>
                        <h2 className="text-sm font-semibold">Profile photo</h2>
                        <p className="mt-1 text-xs text-[#667085]">
                          JPG, PNG, or WebP. Maximum 5 MB.
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {profileImageUrl && (
                          <img
                            src={mediaUrl(profileImageUrl) ?? ""}
                            alt="Profile photo preview"
                            className="h-16 w-16 rounded-full border border-[#D9D9D2] object-cover"
                          />
                        )}
                        <div>
                          <input
                            id="profile-photo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={uploadingPhotos}
                            onChange={(event) =>
                              void uploadProfilePhoto(event.currentTarget.files?.[0])
                            }
                            className="block max-w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium"
                          />
                          {profileImageUrl && (
                            <button
                              type="button"
                              onClick={() => setProfileImageUrl("")}
                              className="mt-2 text-xs underline underline-offset-2"
                            >
                              Remove profile photo
                            </button>
                          )}
                        </div>
                      </div>
                    </section>

                    {templateFeatures.about && (
                      <div>
                        <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
                          {String(
                            selectedTemplate.blocks.find(
                              (block) => block.type === "text" || block.type === "business_info",
                            )?.content?.["heading"] ?? "About",
                          )}
                          <span className="ml-1 font-normal text-[#667085]">Optional</span>
                        </label>
                        <textarea
                          id="description"
                          maxLength={1200}
                          rows={3}
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                          className="w-full resize-y rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none focus:border-[#1F2A44]"
                          placeholder={`Write a little more about ${displayName || "yourself"}`}
                        />
                      </div>
                    )}

                    {templateFeatures.contact && (
                      <section aria-labelledby="contact-fields-heading" className="space-y-3">
                        <div>
                          <h2 id="contact-fields-heading" className="text-sm font-semibold">
                            Choose contact fields
                          </h2>
                          <p className="mt-1 text-xs text-[#667085]">
                            Select which details to collect and show on this template.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-2">
                          {(
                            [
                              ["phone", "Phone"],
                              ["whatsapp", "WhatsApp"],
                              ["email", "Email"],
                              ["website", "Website"],
                              ["location", "Address and directions"],
                            ] as const
                          ).map(([field, label]) => (
                            <label key={field} className="inline-flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={contactFields[field]}
                                onChange={(event) =>
                                  setContactFields((current) => ({
                                    ...current,
                                    [field]: event.target.checked,
                                  }))
                                }
                                className="accent-[#1F2A44]"
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {contactFields.phone && (
                            <div>
                              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                                Phone number
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
                          )}
                          {contactFields.whatsapp && (
                            <div>
                              <label
                                htmlFor="whatsapp"
                                className="mb-1.5 block text-sm font-medium"
                              >
                                WhatsApp number
                              </label>
                              <input
                                id="whatsapp"
                                type="tel"
                                value={whatsapp}
                                onChange={(event) => setWhatsapp(event.target.value)}
                                className="w-full rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none focus:border-[#1F2A44]"
                              />
                            </div>
                          )}
                          {contactFields.email && (
                            <div>
                              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                                Contact email
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
                          )}
                          {contactFields.website && (
                            <div>
                              <label htmlFor="website" className="mb-1.5 block text-sm font-medium">
                                Website
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
                          )}
                          {contactFields.location && (
                            <div className="sm:col-span-2">
                              <label htmlFor="address" className="mb-1.5 block text-sm font-medium">
                                Business or meeting address
                              </label>
                              <input
                                id="address"
                                autoComplete="street-address"
                                value={address}
                                onChange={(event) => setAddress(event.target.value)}
                                className="w-full rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none focus:border-[#1F2A44]"
                              />
                            </div>
                          )}
                        </div>
                      </section>
                    )}

                    {templateFeatures.hours && (
                      <section aria-labelledby="hours-heading" className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 id="hours-heading" className="text-sm font-semibold">
                              Opening hours
                            </h2>
                            <p className="mt-1 text-xs text-[#667085]">
                              Customize the schedule included with this template.
                            </p>
                          </div>
                          <label className="inline-flex shrink-0 items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={showHours}
                              onChange={(event) => setShowHours(event.target.checked)}
                              className="accent-[#1F2A44]"
                            />
                            Include hours
                          </label>
                        </div>
                        {showHours && (
                          <div className="divide-y rounded-lg border border-[#E4E2DC]">
                            {hours.map((hour, index) => (
                              <div
                                key={hour.day}
                                className="grid items-center gap-2 px-3 py-2 sm:grid-cols-[1fr_auto_1fr_1fr]"
                              >
                                <span className="text-sm font-medium">{hour.day}</span>
                                <label className="inline-flex items-center gap-2 text-xs text-[#667085]">
                                  <input
                                    type="checkbox"
                                    checked={hour.closed}
                                    onChange={(event) =>
                                      setHours((current) =>
                                        current.map((item, itemIndex) =>
                                          itemIndex === index
                                            ? { ...item, closed: event.target.checked }
                                            : item,
                                        ),
                                      )
                                    }
                                    className="accent-[#1F2A44]"
                                  />
                                  Closed
                                </label>
                                <input
                                  type="time"
                                  aria-label={`${hour.day} opening time`}
                                  value={hour.open}
                                  disabled={hour.closed}
                                  onChange={(event) =>
                                    setHours((current) =>
                                      current.map((item, itemIndex) =>
                                        itemIndex === index
                                          ? { ...item, open: event.target.value }
                                          : item,
                                      ),
                                    )
                                  }
                                  className="w-full rounded-md border border-[#D9D9D2] px-2 py-1.5 text-xs disabled:opacity-40"
                                />
                                <input
                                  type="time"
                                  aria-label={`${hour.day} closing time`}
                                  value={hour.close}
                                  disabled={hour.closed}
                                  onChange={(event) =>
                                    setHours((current) =>
                                      current.map((item, itemIndex) =>
                                        itemIndex === index
                                          ? { ...item, close: event.target.value }
                                          : item,
                                      ),
                                    )
                                  }
                                  className="w-full rounded-md border border-[#D9D9D2] px-2 py-1.5 text-xs disabled:opacity-40"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    )}

                    {templateFeatures.links && (
                      <section className="grid gap-4 rounded-lg bg-[#F8F7F4] p-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <h2 className="text-sm font-semibold">
                            {String(
                              selectedTemplate.blocks.find((block) => block.type === "links")
                                ?.content?.["heading"] ?? "Featured link",
                            )}
                          </h2>
                          <p className="mt-1 text-xs text-[#667085]">
                            Leave both fields empty to skip this section.
                          </p>
                        </div>
                        <div>
                          <label htmlFor="link-title" className="mb-1.5 block text-sm font-medium">
                            Link label
                          </label>
                          <input
                            id="link-title"
                            value={linkTitle}
                            onChange={(event) => setLinkTitle(event.target.value)}
                            className="w-full rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none"
                            placeholder="e.g. View our menu"
                          />
                        </div>
                        <div>
                          <label htmlFor="link-url" className="mb-1.5 block text-sm font-medium">
                            Destination URL
                          </label>
                          <input
                            id="link-url"
                            type="url"
                            value={linkUrl}
                            onChange={(event) => setLinkUrl(event.target.value)}
                            className="w-full rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none"
                            placeholder="https://"
                          />
                        </div>
                      </section>
                    )}

                    {templateFeatures.services && (
                      <section className="grid gap-4 rounded-lg bg-[#F8F7F4] p-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <h2 className="text-sm font-semibold">
                            {String(
                              selectedTemplate.blocks.find(
                                (block) => block.type === "services" || block.type === "products",
                              )?.content?.["heading"] ?? "Featured service",
                            )}
                          </h2>
                          <p className="mt-1 text-xs text-[#667085]">
                            Add one featured item now; you can add more from your editor later.
                          </p>
                        </div>
                        <div>
                          <label
                            htmlFor="service-name"
                            className="mb-1.5 block text-sm font-medium"
                          >
                            Name
                          </label>
                          <input
                            id="service-name"
                            value={serviceName}
                            onChange={(event) => setServiceName(event.target.value)}
                            className="w-full rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="service-price"
                            className="mb-1.5 block text-sm font-medium"
                          >
                            Price <span className="font-normal text-[#667085]">Optional</span>
                          </label>
                          <input
                            id="service-price"
                            value={servicePrice}
                            onChange={(event) => setServicePrice(event.target.value)}
                            className="w-full rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none"
                            placeholder="e.g. From $50"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="service-description"
                            className="mb-1.5 block text-sm font-medium"
                          >
                            Details <span className="font-normal text-[#667085]">Optional</span>
                          </label>
                          <textarea
                            id="service-description"
                            maxLength={500}
                            rows={2}
                            value={serviceDescription}
                            onChange={(event) => setServiceDescription(event.target.value)}
                            className="w-full resize-y rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none"
                          />
                        </div>
                      </section>
                    )}

                    {templateFeatures.gallery && (
                      <section className="space-y-3 rounded-lg bg-[#F8F7F4] p-4">
                        <div>
                          <h2 className="text-sm font-semibold">
                            {String(
                              selectedTemplate.blocks.find((block) => block.type === "gallery")
                                ?.content?.["heading"] ?? "Photo gallery",
                            )}
                          </h2>
                          <p className="mt-1 text-xs text-[#667085]">
                            Upload up to 10 photos. JPG, PNG, or WebP, maximum 5 MB each.
                          </p>
                        </div>
                        <input
                          id="gallery-photos"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          disabled={uploadingPhotos || imageUrls.length >= 10}
                          onChange={(event) => {
                            void uploadGalleryPhotos(Array.from(event.currentTarget.files ?? []));
                            event.currentTarget.value = "";
                          }}
                          className="block max-w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium"
                        />
                        {uploadingPhotos && (
                          <p role="status" className="text-xs text-[#667085]">
                            Uploading photo…
                          </p>
                        )}
                        {imageUrls.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                            {imageUrls.map((path, index) => (
                              <div key={path} className="relative">
                                <img
                                  src={mediaUrl(path) ?? ""}
                                  alt={`Gallery photo ${index + 1}`}
                                  className="aspect-square w-full rounded-md border border-[#D9D9D2] object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setImageUrls((current) =>
                                      current.filter((item) => item !== path),
                                    )
                                  }
                                  aria-label={`Remove gallery photo ${index + 1}`}
                                  className="absolute right-1 top-1 rounded-full bg-white px-2 py-1 text-xs shadow"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    )}

                    {templateFeatures.video && (
                      <div>
                        <label htmlFor="video-url" className="mb-1.5 block text-sm font-medium">
                          Featured YouTube video{" "}
                          <span className="font-normal text-[#667085]">Optional</span>
                        </label>
                        <input
                          id="video-url"
                          type="url"
                          value={videoUrl}
                          onChange={(event) => setVideoUrl(event.target.value)}
                          className="w-full rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    )}

                    {templateFeatures.social && (
                      <section className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="social-platform"
                            className="mb-1.5 block text-sm font-medium"
                          >
                            Social platform
                          </label>
                          <select
                            id="social-platform"
                            value={socialPlatform}
                            onChange={(event) => setSocialPlatform(event.target.value)}
                            className="w-full rounded-md border border-[#D9D9D2] bg-white px-3 py-2.5 text-sm outline-none"
                          >
                            {SOCIAL_PLATFORMS.map((platform) => (
                              <option key={platform.value} value={platform.value}>
                                {platform.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="social-url" className="mb-1.5 block text-sm font-medium">
                            Social profile URL{" "}
                            <span className="font-normal text-[#667085]">Optional</span>
                          </label>
                          <input
                            id="social-url"
                            type="url"
                            value={socialUrl}
                            onChange={(event) => setSocialUrl(event.target.value)}
                            className="w-full rounded-md border border-[#D9D9D2] px-3 py-2.5 text-sm outline-none"
                            placeholder={
                              SOCIAL_PLATFORMS.find((platform) => platform.value === socialPlatform)
                                ?.hint
                            }
                          />
                        </div>
                      </section>
                    )}

                    {error && !usernameConflict && (
                      <div
                        role="alert"
                        className="flex items-start gap-2 rounded-md border border-[#E7B4AE] bg-[#FFF5F4] p-3 text-sm text-[#8D2F29]"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={busy || uploadingPhotos}
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
                  </>
                ) : !hasSelectedTemplate ? (
                  <p role="status" className="rounded-md bg-[#F8F7F4] p-3 text-sm text-[#667085]">
                    Select a template to continue.
                  </p>
                ) : null}
              </form>
            </div>
            {showDetailsPage && (
              <aside className="sticky top-6 hidden xl:block">
                <h2 className="mb-3 text-sm font-semibold">
                  Live preview · {selectedTemplate.name}
                </h2>
                <div className="h-[640px] overflow-hidden rounded-xl border border-[#D9D9D2] bg-[#F5F4F0] shadow-sm">
                  <div
                    className="relative left-1/2 w-[520px] origin-top"
                    style={{ transform: "translateX(-50%) scale(0.62)" }}
                  >
                    <TemplatePreview
                      template={selectedTemplate}
                      values={previewValues}
                      contactFields={contactFields}
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-[#667085]">
                  Preview updates as you enter your profile details.
                </p>
              </aside>
            )}
            <Dialog
              open={templateToPreview !== null}
              onOpenChange={(open) => {
                if (!open) setTemplateToPreview(null);
              }}
            >
              {templateToPreview && (
                <DialogContent className="flex max-h-[90dvh] flex-col gap-3 overflow-hidden p-4 sm:p-6 max-sm:!left-0 max-sm:!top-0 max-sm:!h-dvh max-sm:!w-full max-sm:!max-w-none max-sm:!translate-x-0 max-sm:!translate-y-0 max-sm:!max-h-none max-sm:!rounded-none max-sm:!border-0 max-sm:!p-0 max-sm:!gap-0">
                  <DialogHeader className="shrink-0 border-b border-[#E4E2DC] px-4 py-4 pr-12 text-left sm:border-0 sm:px-0 sm:py-0 sm:pr-8">
                    <DialogTitle>{templateToPreview.name} preview</DialogTitle>
                    <DialogDescription>{templateToPreview.audience}</DialogDescription>
                  </DialogHeader>
                  <div className="min-h-0 flex-1 overflow-y-auto bg-[#F5F4F0] sm:rounded-lg sm:border sm:border-[#D9D9D2]">
                    <TemplatePreview
                      template={templateToPreview}
                      values={previewValues}
                      contactFields={getContactFieldDefaults(templateToPreview)}
                    />
                  </div>
                  <DialogFooter className="shrink-0 flex-row justify-end gap-2 border-t border-[#E4E2DC] bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:border-0 sm:bg-transparent sm:p-0">
                    <button
                      type="button"
                      onClick={() => setTemplateToPreview(null)}
                      className="rounded-md border border-[#D9D9D2] px-4 py-2 text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        selectTemplate(templateToPreview);
                        setTemplateToPreview(null);
                      }}
                      className="rounded-md bg-[#1F2A44] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Use this template
                    </button>
                  </DialogFooter>
                </DialogContent>
              )}
            </Dialog>
          </div>
        )}
      </section>
    </main>
  );
}
