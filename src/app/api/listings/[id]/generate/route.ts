import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { route, type TaskType } from "@/lib/llm-router";

const VALID_TASKS = new Set<TaskType>([
  "fair-housing",
  "mls-description",
  "cma-summary",
  "video-script",
  "seller-presentation",
]);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const listingId = parseInt(params.id);
  const { task, agentNotes = "" }: { task: string; agentNotes?: string } =
    await req.json();

  if (!VALID_TASKS.has(task as TaskType)) {
    return NextResponse.json({ error: `Unknown task: ${task}` }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const profile = await prisma.brandingProfile.findUnique({ where: { id: 1 } });
  const agentName = profile?.agentName ?? "Your Agent";

  // Build task-specific variables
  const baseVars = {
    address: listing.address,
    city: listing.city,
    state: listing.state,
    price: listing.price,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    sqft: listing.sqft,
    yearBuilt: listing.yearBuilt,
    agentName,
    agentNotes,
  };

  const taskVars: Record<TaskType, Record<string, unknown>> = {
    "fair-housing": { description: listing.mlsDescription || agentNotes },
    "mls-description": baseVars,
    "cma-summary": { ...baseVars, compsJson: listing.cmaData },
    "video-script": baseVars,
    "seller-presentation": {
      ...baseVars,
      cmaSummary: listing.cmaSummary,
    },
  };

  const result = await route(task as TaskType, taskVars[task as TaskType]);

  return NextResponse.json({
    text: result.text,
    model: result.model,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    estimatedCostUsd: result.estimatedCostUsd,
  });
}
