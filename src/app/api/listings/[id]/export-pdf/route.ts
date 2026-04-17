import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generatePlaybookPdf } from "@/lib/pdf-playbook";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: parseInt(params.id) } });
  if (!listing || listing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const profile = await prisma.brandingProfile.findUnique({ where: { id: userId } });
  const pdfBytes = await generatePlaybookPdf(
    listing,
    profile?.agentName ?? "Your Agent",
    profile?.phone ?? "",
    profile?.email ?? ""
  );

  const slug = listing.address.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  return new NextResponse(pdfBytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="playbook-${slug}.pdf"`,
    },
  });
}
