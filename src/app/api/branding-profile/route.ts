import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await prisma.brandingProfile.findUnique({ where: { id: 1 } });
  return NextResponse.json(profile ?? {});
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const profile = await prisma.brandingProfile.upsert({
    where: { id: 1 },
    update: body,
    create: { id: 1, ...body },
  });

  return NextResponse.json(profile);
}
