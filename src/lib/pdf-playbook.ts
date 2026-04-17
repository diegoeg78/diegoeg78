import {
  PDFDocument,
  PDFPage,
  StandardFonts,
  rgb,
  PDFFont,
  RGB,
} from "pdf-lib";

// ── Palette ────────────────────────────────────────────────────────────────
const NAVY = rgb(0.07, 0.18, 0.37);
const WHITE = rgb(1, 1, 1);
const LIGHT_GRAY = rgb(0.96, 0.96, 0.97);
const MID_GRAY = rgb(0.55, 0.55, 0.6);
const DARK = rgb(0.12, 0.12, 0.15);
const ACCENT = rgb(0.13, 0.55, 0.83);

// ── Layout constants ───────────────────────────────────────────────────────
const W = 612;   // Letter width  (pts)
const H = 792;   // Letter height (pts)
const MARGIN = 50;
const CONTENT_W = W - MARGIN * 2;

interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
}

// ── Text wrapping ──────────────────────────────────────────────────────────
function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(" ");
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
      } else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    lines.push(""); // paragraph break
  }
  // trim trailing blank lines
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

// ── Draw utilities ─────────────────────────────────────────────────────────
function fillRect(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  color: RGB
) {
  page.drawRectangle({ x, y, width: w, height: h, color });
}

function text(
  page: PDFPage,
  str: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color: RGB = DARK
) {
  page.drawText(str, { x, y, font, size, color });
}

function drawHRule(page: PDFPage, y: number, color: RGB = LIGHT_GRAY) {
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: W - MARGIN, y },
    thickness: 1,
    color,
  });
}

// ── Page footer ────────────────────────────────────────────────────────────
function addFooter(
  page: PDFPage,
  fonts: Fonts,
  pageNum: number,
  agentName: string
) {
  drawHRule(page, 38, LIGHT_GRAY);
  text(page, agentName, MARGIN, 22, fonts.regular, 8, MID_GRAY);
  const pStr = `Page ${pageNum}`;
  const pw = fonts.regular.widthOfTextAtSize(pStr, 8);
  text(page, pStr, W - MARGIN - pw, 22, fonts.regular, 8, MID_GRAY);
}

// ── Section header banner ──────────────────────────────────────────────────
function sectionHeader(page: PDFPage, label: string, fonts: Fonts): number {
  const bannerH = 36;
  const y = H - MARGIN - bannerH;
  fillRect(page, MARGIN, y, CONTENT_W, bannerH, NAVY);
  text(page, label.toUpperCase(), MARGIN + 14, y + 12, fonts.bold, 13, WHITE);
  return y - 20; // cursor below banner
}

// ── Body text block — returns new cursor y ─────────────────────────────────
function drawBody(
  doc: PDFDocument,
  pages: PDFPage[],
  fonts: Fonts,
  lines: string[],
  startY: number,
  pageNum: number,
  agentName: string,
  size = 10.5,
  lineH = 15,
  color: RGB = DARK
): { y: number; pageNum: number } {
  let y = startY;
  let pNum = pageNum;
  let page = pages[pages.length - 1];

  for (const line of lines) {
    if (y < MARGIN + 50) {
      addFooter(page, fonts, pNum, agentName);
      page = doc.addPage([W, H]);
      pages.push(page);
      pNum++;
      y = H - MARGIN - 20;
    }
    if (line === "") {
      y -= lineH * 0.6;
    } else {
      text(page, line, MARGIN, y, fonts.regular, size, color);
      y -= lineH;
    }
  }
  return { y, pageNum: pNum };
}

// ── CMA table ──────────────────────────────────────────────────────────────
interface Comp {
  address: string;
  price: number;
  sqft: number;
  beds: number;
  baths: number;
  soldDate?: string;
}

function drawCmaTable(
  page: PDFPage,
  comps: Comp[],
  fonts: Fonts,
  startY: number
): number {
  const cols = [
    { label: "Address",    w: 180, key: "address" },
    { label: "Price",      w: 90,  key: "price" },
    { label: "Sq Ft",      w: 65,  key: "sqft" },
    { label: "Bed/Bath",   w: 75,  key: "bedBath" },
    { label: "Sold Date",  w: 90,  key: "soldDate" },
  ] as const;

  const rowH = 22;
  let y = startY;

  // Header row
  fillRect(page, MARGIN, y - rowH + 6, CONTENT_W, rowH, NAVY);
  let cx = MARGIN + 8;
  for (const col of cols) {
    text(page, col.label, cx, y - 10, fonts.bold, 9, WHITE);
    cx += col.w;
  }
  y -= rowH;

  // Data rows
  comps.forEach((comp, i) => {
    const bg = i % 2 === 0 ? WHITE : LIGHT_GRAY;
    fillRect(page, MARGIN, y - rowH + 6, CONTENT_W, rowH, bg);
    cx = MARGIN + 8;
    const rowData = [
      comp.address,
      `$${comp.price.toLocaleString()}`,
      comp.sqft.toLocaleString(),
      `${comp.beds}bd / ${comp.baths}ba`,
      comp.soldDate ?? "—",
    ];
    rowData.forEach((val, j) => {
      const maxW = cols[j].w - 10;
      // truncate if too wide
      let display = val;
      while (
        display.length > 3 &&
        fonts.regular.widthOfTextAtSize(display, 9) > maxW
      ) {
        display = display.slice(0, -4) + "…";
      }
      text(page, display, cx, y - 10, fonts.regular, 9, DARK);
      cx += cols[j].w;
    });
    y -= rowH;
  });

  return y - 10;
}

// ── Cover page ─────────────────────────────────────────────────────────────
async function drawCoverPage(
  doc: PDFDocument,
  page: PDFPage,
  fonts: Fonts,
  listing: ListingData,
  agentName: string,
  agentPhone: string,
  agentEmail: string
) {
  // Top navy bar
  fillRect(page, 0, H - 90, W, 90, NAVY);
  text(page, "LISTING PLAYBOOK", MARGIN, H - 42, fonts.bold, 22, WHITE);
  text(page, "Prepared by ListingOS", MARGIN, H - 65, fonts.regular, 10, rgb(0.7, 0.8, 0.9));

  // Cover photo
  let photoY = H - 110;
  if (listing.coverPhotoB64) {
    try {
      const photoBytes = Buffer.from(
        listing.coverPhotoB64.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      const img = await doc.embedJpg(photoBytes);
      const { width, height } = img.scale(1);
      const scale = Math.min(CONTENT_W / width, 320 / height);
      const imgW = width * scale;
      const imgH = height * scale;
      const imgX = (W - imgW) / 2;
      page.drawImage(img, { x: imgX, y: photoY - imgH, width: imgW, height: imgH });
      photoY -= imgH + 20;
    } catch {
      photoY -= 20;
    }
  }

  // Address block
  const fullAddress = [listing.address, listing.city, listing.state]
    .filter(Boolean)
    .join(", ");
  fillRect(page, MARGIN, photoY - 90, CONTENT_W, 90, LIGHT_GRAY);
  text(page, fullAddress, MARGIN + 16, photoY - 28, fonts.bold, 18, DARK);
  text(
    page,
    `$${listing.price.toLocaleString()}`,
    MARGIN + 16,
    photoY - 52,
    fonts.bold,
    15,
    ACCENT
  );
  const specs = [
    listing.bedrooms && `${listing.bedrooms} bed`,
    listing.bathrooms && `${listing.bathrooms} bath`,
    listing.sqft && `${listing.sqft.toLocaleString()} sqft`,
    listing.yearBuilt && `Built ${listing.yearBuilt}`,
  ]
    .filter(Boolean)
    .join("  ·  ");
  text(page, specs, MARGIN + 16, photoY - 72, fonts.regular, 10, MID_GRAY);

  // Agent card at bottom
  fillRect(page, 0, 0, W, 75, NAVY);
  text(page, agentName, MARGIN, 50, fonts.bold, 12, WHITE);
  text(page, agentPhone, MARGIN, 33, fonts.regular, 10, rgb(0.8, 0.85, 0.9));
  text(page, agentEmail, MARGIN, 18, fonts.regular, 10, rgb(0.8, 0.85, 0.9));
  text(
    page,
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    W - MARGIN - 120,
    18,
    fonts.regular,
    9,
    rgb(0.6, 0.65, 0.75)
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export interface ListingData {
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  mlsDescription: string;
  cmaData: string;
  cmaSummary: string;
  videoScript: string;
  fairHousingScan: string;
  sellerNotes: string;
  coverPhotoB64: string;
}

export async function generatePlaybookPdf(
  listing: ListingData,
  agentName: string,
  agentPhone: string,
  agentEmail: string
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
  };

  // ── Cover ──────────────────────────────────────────────────────────────
  const coverPage = doc.addPage([W, H]);
  await drawCoverPage(doc, coverPage, fonts, listing, agentName, agentPhone, agentEmail);

  const pages: PDFPage[] = [];
  let pageNum = 2;

  // ── Helper: start new section page ────────────────────────────────────
  function newSectionPage(label: string): number {
    const page = doc.addPage([W, H]);
    pages.push(page);
    return sectionHeader(page, label, fonts);
  }

  // ── MLS Description ───────────────────────────────────────────────────
  if (listing.mlsDescription) {
    let y = newSectionPage("MLS Description");
    y -= 10;
    const lines = wrapText(listing.mlsDescription, fonts.regular, 10.5, CONTENT_W);
    const result = drawBody(doc, pages, fonts, lines, y, pageNum, agentName);
    addFooter(pages[pages.length - 1], fonts, result.pageNum, agentName);
    pageNum = result.pageNum + 1;
  }

  // ── CMA ───────────────────────────────────────────────────────────────
  let comps: Comp[] = [];
  try {
    comps = JSON.parse(listing.cmaData);
  } catch { /* invalid JSON — skip table */ }

  if (comps.length || listing.cmaSummary) {
    let y = newSectionPage("Comparative Market Analysis");
    y -= 10;

    if (comps.length) {
      y = drawCmaTable(pages[pages.length - 1], comps, fonts, y);
      y -= 16;
    }

    if (listing.cmaSummary) {
      const summaryLines = wrapText(listing.cmaSummary, fonts.regular, 10.5, CONTENT_W);
      const result = drawBody(doc, pages, fonts, summaryLines, y, pageNum, agentName);
      addFooter(pages[pages.length - 1], fonts, result.pageNum, agentName);
      pageNum = result.pageNum + 1;
    } else {
      addFooter(pages[pages.length - 1], fonts, pageNum, agentName);
      pageNum++;
    }
  }

  // ── Video Script ──────────────────────────────────────────────────────
  if (listing.videoScript) {
    let y = newSectionPage("Video Script");
    y -= 10;
    const lines = wrapText(listing.videoScript, fonts.regular, 10.5, CONTENT_W);
    const result = drawBody(doc, pages, fonts, lines, y, pageNum, agentName);
    addFooter(pages[pages.length - 1], fonts, result.pageNum, agentName);
    pageNum = result.pageNum + 1;
  }

  // ── Fair Housing Scan ─────────────────────────────────────────────────
  if (listing.fairHousingScan) {
    let y = newSectionPage("Fair Housing Compliance Scan");
    y -= 10;
    const lines = wrapText(listing.fairHousingScan, fonts.regular, 10.5, CONTENT_W);
    const result = drawBody(doc, pages, fonts, lines, y, pageNum, agentName);
    addFooter(pages[pages.length - 1], fonts, result.pageNum, agentName);
    pageNum = result.pageNum + 1;
  }

  // ── Seller Notes ──────────────────────────────────────────────────────
  if (listing.sellerNotes) {
    let y = newSectionPage("Seller Presentation Notes");
    y -= 10;
    const lines = wrapText(listing.sellerNotes, fonts.regular, 10.5, CONTENT_W);
    const result = drawBody(doc, pages, fonts, lines, y, pageNum, agentName);
    addFooter(pages[pages.length - 1], fonts, result.pageNum, agentName);
  }

  return doc.save();
}
