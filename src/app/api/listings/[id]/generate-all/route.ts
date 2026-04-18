export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { route } from "@/lib/llm-router";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listingId = parseInt(params.id);
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const profile = await prisma.brandingProfile.findUnique({ where: { id: userId } });
  const agentName = profile?.agentName ?? "Your Agent";

  const base = {
    address: listing.address,
    city: listing.city,
    state: listing.state,
    price: listing.price,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    sqft: listing.sqft,
    yearBuilt: listing.yearBuilt,
    agentName,
    agentNotes: listing.agentNotes,
  };

  // Batch 1 — independent (parallel)
  const [mlsResult, cmaResult, videoResult] = await Promise.all([
    route("mls-description", base),
    route("cma-summary", { ...base, compsJson: listing.cmaData }),
    route("video-script", base),
  ]);

  // Batch 2 — depend on Batch 1 output (parallel)
  const [fhResult, sellerResult] = await Promise.all([
    route("fair-housing",        { description: mlsResult.text }),
    route("seller-presentation", { ...base, cmaSummary: cmaResult.text }),
  ]);

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      mlsDescription:  mlsResult.text,
      cmaSummary:      cmaResult.text,
      videoScript:     videoResult.text,
      fairHousingScan: fhResult.text,
      sellerNotes:     sellerResult.text,
    },
  });

  const totalCostUsd =
    mlsResult.estimatedCostUsd + cmaResult.estimatedCostUsd +
    videoResult.estimatedCostUsd + fhResult.estimatedCostUsd +
    sellerResult.estimatedCostUsd;

  return NextResponse.json({ totalCostUsd });
}
