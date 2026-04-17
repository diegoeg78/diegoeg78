import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePlaybookDocx } from "@/lib/docx-playbook";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const listing = await prisma.listing.findUnique({
    where: { id: parseInt(params.id) },
  });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const profile = await prisma.brandingProfile.findUnique({ where: { id: 1 } });

  const docBuffer = await generatePlaybookDocx(
    listing,
    profile?.agentName ?? "Your Agent",
    profile?.phone ?? "",
    profile?.email ?? ""
  );

  const slug = listing.address.replace(/[^a-z0-9]/gi, "-").toLowerCase();

  return new NextResponse(docBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="playbook-${slug}.docx"`,
    },
  });
}
