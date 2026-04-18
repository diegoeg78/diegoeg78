export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { brandPhoto } from "@/lib/photo-branding";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const files = formData.getAll("photos") as File[];
  if (!files.length) {
    return NextResponse.json({ error: "No photos provided" }, { status: 400 });
  }

  const profile = await prisma.brandingProfile.findUnique({ where: { id: userId } });
  if (!profile) {
    return NextResponse.json({ error: "Branding profile not configured" }, { status: 400 });
  }

  const results: string[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const branded = await brandPhoto(buffer, profile);
    results.push(`data:image/jpeg;base64,${branded.toString("base64")}`);
  }

  return NextResponse.json({ images: results });
}
