import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listings = await (prisma as any).listing.findMany({
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
    },
  });

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your listing playbooks</p>
        </div>
        <Link
          href="/listings/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
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
          {listings.map((l: { id: number; address: string; city: string; state: string; price: number; bedrooms: number; bathrooms: number; sqft: number }) => (
            <Link
              key={l.id}
              href={`/listings/${l.id}`}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div>
                <p className="font-semibold text-gray-900">{l.address}</p>
                <p className="text-sm text-gray-500">
                  {[l.city, l.state].filter(Boolean).join(", ")}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {l.bedrooms}bd · {l.bathrooms}ba · {l.sqft.toLocaleString()} sqft
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">${l.price.toLocaleString()}</p>
                <span className="text-xs text-gray-400">View playbook →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
