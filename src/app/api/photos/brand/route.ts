import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { brandPhoto } from "@/lib/photo-branding";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("photos") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "No photos provided" }, { status: 400 });
  }

  const profile = await prisma.brandingProfile.findUnique({ where: { id: 1 } });
  if (!profile) {
    return NextResponse.json(
      { error: "Branding profile not configured" },
      { status: 400 }
    );
  }

  const results: string[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const branded = await brandPhoto(buffer, profile);
    results.push(`data:image/jpeg;base64,${branded.toString("base64")}`);
  }

  return NextResponse.json({ images: results });
}
