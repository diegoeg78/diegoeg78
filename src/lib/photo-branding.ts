import sharp from "sharp";

export interface BrandingOptions {
  agentName: string;
  phone: string;
  email: string;
  website: string;
  overlayPosition: string;
  bgColor: string;
  textColor: string;
  opacity: number;
  fontSize: number;
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function buildOverlaySvg(
  imgWidth: number,
  opts: BrandingOptions
): { svg: Buffer; overlayHeight: number } {
  const paddingX = 20;
  const paddingY = 12;
  const lineGap = opts.fontSize * 0.35;
  const lines = [opts.agentName, opts.phone, opts.email];
  if (opts.website) lines.push(opts.website);

  const overlayHeight =
    paddingY * 2 + opts.fontSize * lines.length + lineGap * (lines.length - 1);

  const bg = hexToRgba(opts.bgColor, opts.opacity);

  const textElements = lines
    .map((line, i) => {
      const y = paddingY + opts.fontSize + i * (opts.fontSize + lineGap);
      return `<text x="${paddingX}" y="${y}" font-size="${opts.fontSize}" fill="${opts.textColor}" font-family="Arial, sans-serif">${escapeXml(line)}</text>`;
    })
    .join("\n");

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${imgWidth}" height="${overlayHeight}">
  <rect width="${imgWidth}" height="${overlayHeight}" fill="${bg}"/>
  ${textElements}
</svg>`;

  return { svg: Buffer.from(svgStr), overlayHeight };
}

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function brandPhoto(
  inputBuffer: Buffer,
  opts: BrandingOptions
): Promise<Buffer> {
  const meta = await sharp(inputBuffer).metadata();
  const imgWidth = meta.width ?? 1200;
  const imgHeight = meta.height ?? 800;

  const { svg, overlayHeight } = buildOverlaySvg(imgWidth, opts);

  const isTop = opts.overlayPosition.includes("top");
  const top = isTop ? 0 : imgHeight - overlayHeight;

  return sharp(inputBuffer)
    .composite([{ input: svg, top, left: 0 }])
    .jpeg({ quality: 90 })
    .toBuffer();
}
