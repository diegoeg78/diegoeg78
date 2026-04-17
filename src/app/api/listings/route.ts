import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      price: true,
      bedrooms: true,
      bathrooms: true,
      sqft: true,
      createdAt: true,
    },
  });
  return NextResponse.json(listings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const listing = await prisma.listing.create({ data: body });
  return NextResponse.json(listing, { status: 201 });
}
