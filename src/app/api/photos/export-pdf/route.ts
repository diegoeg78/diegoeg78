import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: NextRequest) {
  const { images }: { images: string[] } = await req.json();

  if (!images?.length) {
    return NextResponse.json({ error: "No images provided" }, { status: 400 });
  }

  const pdf = await PDFDocument.create();

  for (const dataUrl of images) {
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const imgBytes = Buffer.from(base64, "base64");

    const jpgImage = await pdf.embedJpg(imgBytes);
    const { width, height } = jpgImage.scale(1);

    // A4 landscape: 841.89 x 595.28 pt — scale image to fit
    const pageW = 841.89;
    const pageH = 595.28;
    const scale = Math.min(pageW / width, pageH / height);

    const page = pdf.addPage([pageW, pageH]);
    page.drawImage(jpgImage, {
      x: (pageW - width * scale) / 2,
      y: (pageH - height * scale) / 2,
      width: width * scale,
      height: height * scale,
    });
  }

  const pdfBytes = await pdf.save();

  return new NextResponse(pdfBytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="listing-photos.pdf"',
    },
  });
}
