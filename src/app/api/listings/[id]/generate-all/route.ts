import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { route } from "@/lib/llm-router";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const listingId = parseInt(params.id);

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const profile = await prisma.brandingProfile.findUnique({ where: { id: 1 } });
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

  const results: Record<string, { text: string; model: string; costUsd: number }> = {};
  let totalCost = 0;

  // ── Batch 1: independent tasks (parallel) ────────────────────────────────
  const [mlsResult, cmaResult, videoResult] = await Promise.all([
    route("mls-description", base),
    route("cma-summary", { ...base, compsJson: listing.cmaData }),
    route("video-script", base),
  ]);

  results["mls-description"]  = { text: mlsResult.text,   model: mlsResult.model,   costUsd: mlsResult.estimatedCostUsd };
  results["cma-summary"]      = { text: cmaResult.text,   model: cmaResult.model,   costUsd: cmaResult.estimatedCostUsd };
  results["video-script"]     = { text: videoResult.text, model: videoResult.model, costUsd: videoResult.estimatedCostUsd };
  totalCost += mlsResult.estimatedCostUsd + cmaResult.estimatedCostUsd + videoResult.estimatedCostUsd;

  // ── Batch 2: tasks that depend on Batch 1 output (parallel) ─────────────
  const [fhResult, sellerResult] = await Promise.all([
    route("fair-housing",        { description: mlsResult.text }),
    route("seller-presentation", { ...base, cmaSummary: cmaResult.text }),
  ]);

  results["fair-housing"]        = { text: fhResult.text,     model: fhResult.model,     costUsd: fhResult.estimatedCostUsd };
  results["seller-presentation"] = { text: sellerResult.text, model: sellerResult.model, costUsd: sellerResult.estimatedCostUsd };
  totalCost += fhResult.estimatedCostUsd + sellerResult.estimatedCostUsd;

  // ── Save all results to DB ────────────────────────────────────────────────
  await prisma.listing.update({
    where: { id: listingId },
    data: {
      mlsDescription: mlsResult.text,
      cmaSummary:     cmaResult.text,
      videoScript:    videoResult.text,
      fairHousingScan: fhResult.text,
      sellerNotes:    sellerResult.text,
    },
  });

  return NextResponse.json({ results, totalCostUsd: totalCost });
}
