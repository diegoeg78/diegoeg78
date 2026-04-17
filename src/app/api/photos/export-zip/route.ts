import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
  const { images }: { images: string[] } = await req.json();

  if (!images?.length) {
    return NextResponse.json({ error: "No images provided" }, { status: 400 });
  }

  const zip = new JSZip();

  images.forEach((dataUrl, i) => {
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    zip.file(`photo-${String(i + 1).padStart(2, "0")}.jpg`, base64, {
      base64: true,
    });
  });

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="branded-photos.zip"',
    },
  });
}
