import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const listings = await prisma.listing.findMany({
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
      coverPhotoB64: true,
    },
  });

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your listing playbooks</p>
        </div>
        <Link href="/listings/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
          + New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 mb-4">No listings yet</p>
          <Link href="/listings/new" className="text-blue-600 hover:underline text-sm font-medium">
            Create your first listing →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </main>
  );
}
