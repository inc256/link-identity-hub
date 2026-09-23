export interface QrOptions {
  fgColor: string;
  bgColor: string;
  style: "square" | "rounded" | "dots";
  eyeStyle: "square" | "rounded" | "circle";
  logo: string | null;
  logoSize: number;
  frame: boolean;
  frameText: string;
  margin: boolean;
  size: number;
}

export const QR_PRESETS: { id: string; label: string; fgColor: string; bgColor: string }[] = [
  { id: "navy", label: "Navy on white", fgColor: "#1F2A44", bgColor: "#FFFFFF" },
  { id: "gold", label: "Gold on navy", fgColor: "#C6A75E", bgColor: "#1F2A44" },
  { id: "black", label: "Black on white", fgColor: "#111111", bgColor: "#FFFFFF" },
  { id: "beige", label: "Navy on beige", fgColor: "#1F2A44", bgColor: "#E8DCC8" },
  { id: "white", label: "White on navy", fgColor: "#FFFFFF", bgColor: "#1F2A44" },
];

export const DEFAULT_QR_OPTIONS: QrOptions = {
  fgColor: "#1F2A44",
  bgColor: "#FFFFFF",
  style: "square",
  eyeStyle: "square",
  logo: null,
  logoSize: 22,
  frame: true,
  frameText: "Scan to connect",
  margin: true,
  size: 280,
};

function channels(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const int = parseInt(full.slice(0, 6) || "000000", 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = channels(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between the QR modules and its background. */
export function qrContrast(fgColor: string, bgColor: string): number {
  const a = relativeLuminance(fgColor);
  const b = relativeLuminance(bgColor);
  const light = Math.max(a, b);
  const dark = Math.min(a, b);
  return (light + 0.05) / (dark + 0.05);
}

export interface Scannability {
  level: "good" | "caution" | "poor";
  message: string;
}

export function scannability(options: QrOptions): Scannability {
  const contrast = qrContrast(options.fgColor, options.bgColor);
  const darkBackground = relativeLuminance(options.bgColor) < relativeLuminance(options.fgColor);

  if (contrast < 3) {
    return {
      level: "poor",
      message:
        "These two colours are too close together. Many phone cameras will fail to read this code — pick a darker code colour or a lighter background.",
    };
  }
  if (darkBackground) {
    return {
      level: "caution",
      message:
        "A light code on a dark background works on most modern phones, but older cameras can struggle. Test it before printing a large batch.",
    };
  }
  if (options.logo && options.logoSize > 26) {
    return {
      level: "caution",
      message: "Your logo is covering a lot of the code. Make it smaller if scanning feels slow.",
    };
  }
  if (contrast < 4.5) {
    return {
      level: "caution",
      message: "The contrast is on the low side. Scan it yourself before printing.",
    };
  }
  return { level: "good", message: "Good contrast — this code should scan reliably." };
}

export function qrTargetUrl(origin: string, profileId: string): string {
  return `${origin}/qr/${profileId}`;
}
