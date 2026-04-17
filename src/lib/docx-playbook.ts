import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  PageBreak,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { ListingData } from "./pdf-playbook";

// ── Palette (hex strings for docx) ─────────────────────────────────────────
const NAVY = "0E2D5E";
const WHITE = "FFFFFF";
const ACCENT = "1F8DD6";
const LIGHT_GRAY = "F4F5F7";
const MID_GRAY = "888893";
const DARK = "1F1F26";

// ── Helpers ─────────────────────────────────────────────────────────────────

function pt(n: number) {
  return n * 20; // docx uses half-points (twips) for some things, but font sizes use half-points
}

/** Bold navy section heading with bottom border */
function sectionHeading(label: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 4 } },
    children: [
      new TextRun({
        text: label.toUpperCase(),
        bold: true,
        color: NAVY,
        size: pt(14),
        font: "Calibri",
      }),
    ],
  });
}

/** Body paragraph with normal styling */
function bodyParagraph(line: string, italic = false): Paragraph {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text: line,
        size: pt(11),
        color: DARK,
        italics: italic,
        font: "Calibri",
      }),
    ],
  });
}

/** Convert multi-line text into an array of body paragraphs */
function textToParagraphs(content: string, italic = false): Paragraph[] {
  if (!content.trim()) return [];
  return content
    .split("\n")
    .map((line) => bodyParagraph(line || " ", italic));
}

/** Shaded label+value row used in the property details table */
function detailRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: LIGHT_GRAY },
        borders: cellBorders(),
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: label, bold: true, size: pt(10), color: DARK, font: "Calibri" }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        borders: cellBorders(),
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: value, size: pt(10), color: DARK, font: "Calibri" }),
            ],
          }),
        ],
      }),
    ],
  });
}

function cellBorders() {
  const thin = { style: BorderStyle.SINGLE, size: 4, color: "D0D3D8" };
  return { top: thin, bottom: thin, left: thin, right: thin };
}

/** CMA comps table */
interface Comp {
  address: string;
  price: number;
  sqft: number;
  beds: number;
  baths: number;
  soldDate?: string;
}

function cmaTable(comps: Comp[]): Table {
  const headers = ["Address", "Price", "Sq Ft", "Bed/Bath", "Sold Date"];
  const colWidths = [35, 15, 12, 13, 15]; // percentages

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) =>
      new TableCell({
        width: { size: colWidths[i], type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: NAVY },
        borders: cellBorders(),
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: h, bold: true, color: WHITE, size: pt(9), font: "Calibri" }),
            ],
          }),
        ],
      })
    ),
  });

  const dataRows = comps.map((comp, i) => {
    const cells = [
      comp.address,
      `$${comp.price.toLocaleString()}`,
      comp.sqft.toLocaleString(),
      `${comp.beds}bd / ${comp.baths}ba`,
      comp.soldDate ?? "—",
    ];
    return new TableRow({
      children: cells.map((val, j) =>
        new TableCell({
          width: { size: colWidths[j], type: WidthType.PERCENTAGE },
          shading: {
            type: ShadingType.SOLID,
            color: i % 2 === 0 ? WHITE : LIGHT_GRAY,
          },
          borders: cellBorders(),
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: val, size: pt(9), color: DARK, font: "Calibri" }),
              ],
            }),
          ],
        })
      ),
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

// ── Cover block (first page) ─────────────────────────────────────────────────

function coverBlock(
  listing: ListingData,
  agentName: string,
  agentPhone: string,
  agentEmail: string
): Paragraph[] {
  const address = [listing.address, listing.city, listing.state]
    .filter(Boolean)
    .join(", ");

  const specs = [
    listing.bedrooms && `${listing.bedrooms} Bed`,
    listing.bathrooms && `${listing.bathrooms} Bath`,
    listing.sqft && `${listing.sqft.toLocaleString()} Sq Ft`,
    listing.yearBuilt && `Built ${listing.yearBuilt}`,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return [
    new Paragraph({
      spacing: { before: pt(6), after: pt(2) },
      children: [
        new TextRun({
          text: "LISTING PLAYBOOK",
          bold: true,
          color: NAVY,
          size: pt(28),
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: pt(1) },
      children: [
        new TextRun({
          text: address,
          bold: true,
          color: DARK,
          size: pt(18),
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: pt(1) },
      children: [
        new TextRun({
          text: `$${listing.price.toLocaleString()}`,
          bold: true,
          color: ACCENT,
          size: pt(16),
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: pt(3) },
      children: [
        new TextRun({ text: specs, color: MID_GRAY, size: pt(11), font: "Calibri" }),
      ],
    }),
    // Separator line paragraph
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 4 } },
      spacing: { after: pt(2) },
      children: [],
    }),
    new Paragraph({
      spacing: { after: pt(1) },
      children: [
        new TextRun({ text: "Prepared by  ", color: MID_GRAY, size: pt(10), font: "Calibri" }),
        new TextRun({ text: agentName, bold: true, color: DARK, size: pt(10), font: "Calibri" }),
      ],
    }),
    new Paragraph({
      spacing: { after: pt(1) },
      children: [
        new TextRun({ text: `${agentPhone}  ·  ${agentEmail}`, color: MID_GRAY, size: pt(10), font: "Calibri" }),
      ],
    }),
    new Paragraph({
      spacing: { after: pt(1) },
      children: [
        new TextRun({
          text: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          color: MID_GRAY,
          size: pt(10),
          font: "Calibri",
        }),
      ],
    }),
    // Force page break after cover
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ── Property details table (second section) ─────────────────────────────────

function propertyDetailsSection(listing: ListingData): (Paragraph | Table)[] {
  const rows = [
    ["Address", [listing.address, listing.city, listing.state].filter(Boolean).join(", ")],
    ["List Price", `$${listing.price.toLocaleString()}`],
    ["Bedrooms", String(listing.bedrooms)],
    ["Bathrooms", String(listing.bathrooms)],
    ["Square Feet", listing.sqft ? listing.sqft.toLocaleString() : "—"],
    ["Year Built", listing.yearBuilt ? String(listing.yearBuilt) : "—"],
  ] as [string, string][];

  return [
    sectionHeading("Property Details"),
    new Paragraph({ spacing: { after: 120 }, children: [] }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows.map(([label, value]) => detailRow(label, value)),
    }),
  ];
}

// ── Main export ──────────────────────────────────────────────────────────────

export async function generatePlaybookDocx(
  listing: ListingData,
  agentName: string,
  agentPhone: string,
  agentEmail: string
): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Cover
  children.push(...coverBlock(listing, agentName, agentPhone, agentEmail));

  // Property details
  children.push(...propertyDetailsSection(listing));

  // MLS Description
  if (listing.mlsDescription) {
    children.push(sectionHeading("MLS Description"));
    children.push(...textToParagraphs(listing.mlsDescription));
  }

  // CMA
  let comps: Comp[] = [];
  try { comps = JSON.parse(listing.cmaData); } catch { /* skip */ }

  if (comps.length || listing.cmaSummary) {
    children.push(sectionHeading("Comparative Market Analysis"));
    if (comps.length) {
      children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
      children.push(cmaTable(comps));
      children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
    }
    if (listing.cmaSummary) {
      children.push(bodyParagraph("Summary", false));
      children.push(...textToParagraphs(listing.cmaSummary));
    }
  }

  // Video Script
  if (listing.videoScript) {
    children.push(sectionHeading("Video Script"));
    children.push(...textToParagraphs(listing.videoScript));
  }

  // Fair Housing
  if (listing.fairHousingScan) {
    children.push(sectionHeading("Fair Housing Compliance Scan"));
    children.push(...textToParagraphs(listing.fairHousingScan));
  }

  // Seller Notes
  if (listing.sellerNotes) {
    children.push(sectionHeading("Seller Presentation Notes"));
    children.push(...textToParagraphs(listing.sellerNotes));
  }

  const doc = new Document({
    creator: agentName,
    title: `Listing Playbook — ${listing.address}`,
    description: "Generated by ListingOS",
    styles: {
      default: {
        heading1: {
          run: { font: "Calibri", bold: true, color: NAVY, size: pt(14) },
          paragraph: { spacing: { before: pt(3), after: pt(2) } },
        },
      },
    },
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "D0D3D8", space: 4 } },
                children: [
                  new TextRun({
                    text: `${listing.address}  ·  $${listing.price.toLocaleString()}`,
                    color: MID_GRAY,
                    size: pt(9),
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: { top: { style: BorderStyle.SINGLE, size: 4, color: "D0D3D8", space: 4 } },
                children: [
                  new TextRun({
                    text: `${agentName}  ·  ListingOS`,
                    color: MID_GRAY,
                    size: pt(9),
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
