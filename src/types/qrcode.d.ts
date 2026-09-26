declare module "qrcode" {
  export interface QrModules {
    size: number;
    data: Uint8Array;
  }

  export interface QrCodeData {
    modules: QrModules;
    version: number;
  }

  export function create(
    text: string,
    options?: { errorCorrectionLevel?: "L" | "M" | "Q" | "H"; version?: number },
  ): QrCodeData;

  const QRCode: { create: typeof create };
  export default QRCode;
}
