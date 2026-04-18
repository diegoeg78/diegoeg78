export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const listings = await prisma.listing.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, address: true, city: true, state: true,
        price: true, bedrooms: true, bathrooms: true, sqft: true, createdAt: true,
      },
    });
    return NextResponse.json(listings);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const listing = await prisma.listing.create({ data: { userId, ...body } });
    return NextResponse.json(listing, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
