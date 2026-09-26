import QRCode from "qrcode";
import type { QrOptions } from "./qr";

const SAFE_COLOR = /^#[0-9a-fA-F]{3,8}$/;

function color(value: string, fallback: string): string {
  return SAFE_COLOR.test(value.trim()) ? value.trim() : fallback;
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface Modules {
  size: number;
  get(row: number, col: number): boolean;
}

function readModules(text: string): Modules {
  const qr = QRCode.create(text, { errorCorrectionLevel: "Q" });
  const size = qr.modules.size;
  const data = qr.modules.data;
  return {
    size,
    get: (row, col) => {
      if (row < 0 || col < 0 || row >= size || col >= size) return false;
      return Boolean(data[row * size + col]);
    },
  };
}

function isFinder(row: number, col: number, size: number): boolean {
  const inTopLeft = row < 7 && col < 7;
  const inTopRight = row < 7 && col >= size - 7;
  const inBottomLeft = row >= size - 7 && col < 7;
  return inTopLeft || inTopRight || inBottomLeft;
}

function eyePath(x: number, y: number, unit: number, style: QrOptions["eyeStyle"]): string {
  const outerRadius = style === "circle" ? unit * 3.5 : style === "rounded" ? unit * 2 : 0;
  const innerRadius = style === "circle" ? unit * 1.5 : style === "rounded" ? unit * 0.8 : 0;
  const outer = `<path d="M ${x} ${y} h ${unit * 7} v ${unit * 7} h ${-unit * 7} Z" />`;
  void outer;
  return [
    `<rect x="${x}" y="${y}" width="${unit * 7}" height="${unit * 7}" rx="${outerRadius}" />`,
    `<rect x="${x + unit}" y="${y + unit}" width="${unit * 5}" height="${unit * 5}" rx="${Math.max(outerRadius - unit, 0)}" fill="var(--qr-bg)" />`,
    `<rect x="${x + unit * 2}" y="${y + unit * 2}" width="${unit * 3}" height="${unit * 3}" rx="${innerRadius}" />`,
  ].join("");
}

export interface QrSvgResult {
  svg: string;
  /** Pixel width/height of the produced square/portrait graphic. */
  width: number;
  height: number;
}

/** Builds a self-contained SVG string for the QR code, honouring the studio options. */
export function buildQrSvg(text: string, options: QrOptions): QrSvgResult {
  const modules = readModules(text);
  const fg = color(options.fgColor, "#1F2A44");
  const bg = color(options.bgColor, "#FFFFFF");
  const quiet = options.margin ? 4 : 1;
  const grid = modules.size + quiet * 2;
  const unit = 10;
  const codeSize = grid * unit;

  const framePad = options.frame ? unit * 4 : 0;
  const frameText = options.frame ? escapeText(options.frameText.slice(0, 40)) : "";
  const textBar = options.frame && frameText ? unit * 9 : 0;

  const width = codeSize + framePad * 2;
  const height = codeSize + framePad * 2 + textBar;

  const parts: string[] = [];

  for (let row = 0; row < modules.size; row += 1) {
    for (let col = 0; col < modules.size; col += 1) {
      if (!modules.get(row, col)) continue;
      if (isFinder(row, col, modules.size)) continue;
      const x = (col + quiet) * unit + framePad;
      const y = (row + quiet) * unit + framePad;
      if (options.style === "dots") {
        parts.push(
          `<circle cx="${x + unit / 2}" cy="${y + unit / 2}" r="${unit * 0.46}" />`,
        );
      } else if (options.style === "rounded") {
        parts.push(
          `<rect x="${x + unit * 0.06}" y="${y + unit * 0.06}" width="${unit * 0.88}" height="${unit * 0.88}" rx="${unit * 0.32}" />`,
        );
      } else {
        parts.push(`<rect x="${x}" y="${y}" width="${unit}" height="${unit}" />`);
      }
    }
  }

  const eyeOrigins: [number, number][] = [
    [quiet * unit + framePad, quiet * unit + framePad],
    [(modules.size - 7 + quiet) * unit + framePad, quiet * unit + framePad],
    [quiet * unit + framePad, (modules.size - 7 + quiet) * unit + framePad],
  ];
  const eyes = eyeOrigins
    .map(([x, y]) => eyePath(x, y, unit, options.eyeStyle))
    .join("")
    .replace(/var\(--qr-bg\)/g, bg);

  const logoBox = Math.round((codeSize * Math.min(Math.max(options.logoSize, 10), 30)) / 100);
  const logoX = framePad + (codeSize - logoBox) / 2;
  const logoY = framePad + (codeSize - logoBox) / 2;
  const logo = options.logo
    ? `<rect x="${logoX - unit * 0.6}" y="${logoY - unit * 0.6}" width="${logoBox + unit * 1.2}" height="${logoBox + unit * 1.2}" rx="${unit}" fill="${bg}" />` +
      `<image x="${logoX}" y="${logoY}" width="${logoBox}" height="${logoBox}" href="${escapeText(options.logo)}" preserveAspectRatio="xMidYMid slice" />`
    : "";

  const frame = options.frame
    ? `<rect x="${unit * 0.8}" y="${unit * 0.8}" width="${width - unit * 1.6}" height="${height - unit * 1.6}" rx="${unit * 2}" fill="none" stroke="${fg}" stroke-width="${unit * 0.7}" />`
    : "";

  const caption =
    textBar > 0
      ? `<text x="${width / 2}" y="${height - framePad - unit * 0.5}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="${unit * 3.4}" font-weight="600" letter-spacing="${unit * 0.12}" fill="${fg}">${frameText}</text>`
      : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="QR code">
<rect width="${width}" height="${height}" fill="${bg}" ${options.frame ? `rx="${unit * 2}"` : ""} />
${frame}
<g fill="${fg}">${parts.join("")}${eyes}</g>
${logo}
${caption}
</svg>`;

  return { svg, width, height };
}

export function svgToBlob(svg: string): Blob {
  return new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
}

/** Rasterises the SVG in the browser for PNG downloads. */
export async function svgToPngBlob(svg: string, targetWidth: number): Promise<Blob> {
  const source = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Could not render the code as an image."));
    image.src = source;
  });
  const ratio = image.height / image.width || 1;
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = Math.round(targetWidth * ratio);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not render the code as an image.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not render the code as an image."));
    }, "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
