export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function getOwnedListing(id: number, userId: string) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.userId !== userId) return null;
  return listing;
}

export async function GET(
  _req: NextRequest,
  {
  try {
  { params }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listing = await getOwnedListing(parseInt(params.id), userId);
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(listing);
}

export async function PATCH(
  req: NextRequest,
  {
  try {
  { params }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getOwnedListing(parseInt(params.id), userId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const listing = await prisma.listing.update({
    where: { id: parseInt(params.id) },
    data: body,
  });
  return NextResponse.json(listing);
}

export async function DELETE(
  _req: NextRequest,
  {
  try {
  { params }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getOwnedListing(parseInt(params.id), userId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.listing.delete({ where: { id: parseInt(params.id) } });
  return new NextResponse(null, { status: 204 });
}
