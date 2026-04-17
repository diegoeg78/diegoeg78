import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const listing = await prisma.listing.findUnique({
    where: { id: parseInt(params.id) },
  });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(listing);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const listing = await prisma.listing.update({
    where: { id: parseInt(params.id) },
    data: body,
  });
  return NextResponse.json(listing);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.listing.delete({ where: { id: parseInt(params.id) } });
  return new NextResponse(null, { status: 204 });
}
