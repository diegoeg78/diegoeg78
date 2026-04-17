import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function CommandCenter() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [listings, profile] = await Promise.all([
    prisma.listing.findMany({
      where: { userId },
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
        mlsDescription: true,
        cmaSummary: true,
        videoScript: true,
        fairHousingScan: true,
        sellerNotes: true,
        cmaData: true,
      },
    }),
    prisma.brandingProfile.findUnique({ where: { id: userId } }),
  ]);

  const SECTIONS = ["mlsDescription", "cmaSummary", "videoScript", "fairHousingScan", "sellerNotes"];
  const totalSections = listings.length * SECTIONS.length;
  const completedSections = listings.reduce(
    (acc, l) => acc + SECTIONS.filter((k) => (l[k as keyof typeof l] as string)?.trim().length > 0).length,
    0
  );
  const pct = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Command Center</h1>
          {profile?.agentName ? (
            <p className="text-gray-500 mt-1">Welcome back, {profile.agentName}</p>
          ) : (
            <p className="text-amber-600 text-sm mt-1">
              <Link href="/settings" className="underline underline-offset-2">Set up your branding profile</Link>{" "}
              to personalize AI outputs
            </p>
          )}
        </div>
        <Link href="/listings/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
          + New Listing
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard value={listings.length} label="Listings" sub="active listings" color="blue" />
        <StatCard
          value={totalSections > 0 ? `${pct}%` : "—"}
          label="Complete"
          sub={`${completedSections} of ${totalSections} sections filled`}
          color={pct === 100 && totalSections > 0 ? "green" : "yellow"}
        />
        <StatCard
          value={listings.length > 0 ? `~$${(listings.length * 0.045).toFixed(2)}` : "$0"}
          label="Est. AI Cost"
          sub="per full playbook generation"
          color="gray"
        />
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-4xl mb-4">🏠</p>
          <p className="text-gray-600 font-medium mb-1">No listings yet</p>
          <p className="text-gray-400 text-sm mb-6">Create your first listing to start generating playbooks</p>
          <Link href="/listings/new" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
            Create First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-400">
        <Link href="/photos" className="hover:text-gray-600">Photo Branding</Link>
        <Link href="/listings" className="hover:text-gray-600">All Listings</Link>
        <Link href="/settings" className="hover:text-gray-600">Branding Settings</Link>
      </div>
    </main>
  );
}

function StatCard({ value, label, sub, color }: { value: string | number; label: string; sub: string; color: "blue" | "green" | "yellow" | "gray" }) {
  const ring = { blue: "border-blue-200 bg-blue-50", green: "border-green-200 bg-green-50", yellow: "border-yellow-200 bg-yellow-50", gray: "border-gray-200 bg-gray-50" }[color];
  const val  = { blue: "text-blue-700", green: "text-green-700", yellow: "text-yellow-700", gray: "text-gray-700" }[color];
  return (
    <div className={`rounded-xl border p-5 ${ring}`}>
      <p className={`text-3xl font-bold ${val}`}>{value}</p>
      <p className="text-sm font-semibold text-gray-700 mt-1">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
