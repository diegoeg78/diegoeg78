import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteListingButton from "@/components/DeleteListingButton";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const listings = await prisma.listing.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, address: true, city: true, state: true, price: true, bedrooms: true, bathrooms: true, sqft: true },
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
        <div className="grid gap-3">
          {listings.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <Link href={`/listings/${l.id}`} className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{l.address}</p>
                <p className="text-sm text-gray-500">{[l.city, l.state].filter(Boolean).join(", ")}</p>
                <p className="text-xs text-gray-400 mt-1">{l.bedrooms}bd · {l.bathrooms}ba · {l.sqft.toLocaleString()} sqft</p>
              </Link>
              <div className="flex items-center gap-4 ml-4">
                <div className="text-right">
                  <p className="font-bold text-blue-600">${l.price.toLocaleString()}</p>
                  <Link href={`/listings/${l.id}`} className="text-xs text-gray-400 hover:text-gray-600">View playbook →</Link>
                </div>
                <DeleteListingButton listingId={l.id} address={l.address} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
